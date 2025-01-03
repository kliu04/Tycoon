import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import Player from "./game/Player.js";
import Game from "./game/Game.js";
import Card from "./shared/Card.js";
import Deck from "./game/Deck.js";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
} from "./shared/Events.js";

import { RoomData, PlayerData } from "./shared/Data.js";

const app = express();
const server = createServer(app);
const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(server, {
    cors: {
        origin: "http://localhost:3000",
    },
    connectionStateRecovery: {
        // the backup duration of the sessions and the packets
        maxDisconnectionDuration: 2 * 60 * 1000,
        // whether to skip middlewares upon successful recovery
        skipMiddlewares: true,
    },
});

app.use(cors());

io.listen(4000);

let players: Player[] = [];
let rooms: Game[] = [];

export interface SocketData {
    username: string;
    player: Player;
    game: Game;
}

function getRoomByKey(key: string): Game {
    const r = rooms.find((room) => room.key == key);
    if (r === undefined) {
        throw new Error("Cannot find Room!");
    }
    return r;
}

function isValidRoom(key: string): boolean {
    return !!rooms.find((room) => room.key == key);
}

io.on("connection", (socket) => {
    function notifyCurrentPlayer() {
        io.to(game.currentPlayer.id).emit("game:setClientTurn");
    }

    function updatePlayersInfo() {
        io.to(game.key).emit("game:updatePlayerInfo", game.playerData);
    }
    // const player = socket.data.player;

    // console.log(`A player connected with id ${socket.id}`);
    // socket.data.player = new Player(socket.id);

    let player = socket.data.player;
    let game = socket.data.game;

    if (!player) {
        player = new Player(socket.id); // Initialize player properly
        socket.data.player = player; // Store it in socket.data
    }

    players.push(player);

    socket.on("disconnect", () => {
        // want some fancier logic here
        if (game) {
            game.removePlayer(player);
            player.room = null;
        }
        players = players.filter((player) => player != player);
        rooms = rooms.filter((room) => !room.isEmpty());

        console.log(`Player with id ${socket.id} disconnected`);
    });

    socket.on("player:setUsername", (username) => {
        console.log(
            `Player with id ${socket.id} has set username to ${username}`
        );
        player.username = username;
    });

    // client has created a room
    socket.on("room:create", (roomname, key, p) => {
        console.log(
            `A new room has been created with name: ${roomname} and key: ${key} by player ${player.username}`
        );
        game = new Game(roomname, key, p);
        socket.data.game = game;
        game.addPlayer(player);
        rooms.push(game);
        socket.join(key);

        io.to(key).emit("room:joined", {
            name: game.name,
            key: game.key,
            players: game.playerData,
        });
    });

    // client wants to join room
    socket.on("room:join", (key, callback) => {
        if (isValidRoom(key)) {
            callback(true);
            socket.join(key);
            game = getRoomByKey(key);
            game.addPlayer(player);
            // update room members on the new state
            io.to(key).emit("room:joined", {
                name: game.name,
                key: game.key,
                players: game.playerData,
            });
            console.log(
                `{Player ${player.username} has joined room ${game.name}`
            );
        } else {
            callback(false);
        }
    });

    // client is looking at all public rooms
    socket.on("room:getPublic", (callback) => {
        let public_rooms: RoomData[] = [];
        rooms.forEach((room) => {
            if (room.isPublic) {
                public_rooms.push({
                    name: room.name,
                    key: room.key,
                    players: room.playerData,
                });
            }
        });
        callback(public_rooms);
    });

    // notify clients in room that game has started
    socket.on("game:start", () => {
        try {
            game.prepareRound();
            updatePlayersInfo();
        } catch (e: any) {
            console.error(e.message);
            return;
        }

        console.log(
            `Game with id ${game.key} and name ${game.name} has started.`
        );
        io.to(game.key).emit("game:hasStarted");
        // emit initial card state to each player
        game.players.forEach((player) => {
            io.to(player.id).emit("game:setPlayerCards", player.hand);
        });

        // notifies the first player it's their turn
        notifyCurrentPlayer();
    });

    socket.on("game:playSelected", (selCards, callback) => {
        // have to turn the client card into the real card
        selCards = selCards.map((card) => new Card(card.value, card.suit));
        try {
            game.playCards(player, selCards);
        } catch (e: any) {
            console.error(e.message);
            callback(false);
            notifyCurrentPlayer();
        }
        io.to(game.key).emit("game:updatePlayArea", game.playArea);
        updatePlayersInfo();
        callback(true);

        if (game.isGameOver()) {
            console.log("Game is over!");
            io.to(game.key).emit("game:gameEnded");
            io.to(game.key).emit("game:updatePlayArea", []);
            game.players.forEach((player) => {
                io.to(player.id).emit("game:setPlayerCards", []);
            });
        } else if (game.isRoundOver()) {
            console.log("Round is over!");
            // reset
            io.to(game.key).emit("game:roundOver", true);
            io.to(game.key).emit("game:updatePlayArea", []);
            game.players.forEach((player) => {
                io.to(player.id).emit("game:setPlayerCards", []);
            });
        } else {
            // order does matter here because of 8 stop -- same player can play twice
            // possible race condition
            notifyCurrentPlayer();
        }
    });

    socket.on("game:passTurn", () => {
        try {
            game.passTurn(player);
            io.to(game.key).emit("game:updatePlayArea", game.playArea);
        } catch (e: any) {
            console.error(e.message);
        }
        notifyCurrentPlayer();
    });

    socket.on("game:startNextRound", () => {
        io.to(game.key).emit("game:roundOver", false);
        game.prepareRound();
        updatePlayersInfo();
        game.players.forEach((player) => {
            io.to(player.id).emit("game:setPlayerCards", player.hand);
        });
        io.to(game.key).emit("game:isTaxPhase", true);
        // now need to tax...
    });

    socket.on("game:sendTax", (selCards, callback) => {
        let res = false;
        selCards = selCards.map((card) => new Card(card.value, card.suit));
        try {
            res = game.tax(player, selCards);
        } catch (e: any) {
            console.error(e.message);
            callback(false);
        }
        game.players.forEach((player) => {
            io.to(player.id).emit("game:setPlayerCards", player.hand);
        });
        callback(true);

        if (res) {
            io.to(game.key).emit("game:isTaxPhase", false);
            notifyCurrentPlayer();
        }
    });
});
