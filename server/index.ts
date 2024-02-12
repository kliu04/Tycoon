import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import Player from "./game/Player.js";
import Game from "./game/Game.js";

interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (data: RoomData) => void;
    "game:hasStarted": () => void;
    "game:setCardNames": (cardNames: string[]) => void;
}

interface ClientToServerEvents {
    "player:setUsername": (s: string) => void;
    "room:join": (joinkey: string, callback: Function) => void;
    "room:create": (rn: string, key: string, p: boolean) => void;
    "room:getPublic": (callback: Function) => void;
    "game:start": () => void;
}

interface InterServerEvents {}

interface SocketData {
    username: string;
    player: Player;
    game: Game;
}

// TODO: share type defs
// https://stackoverflow.com/questions/65045106/share-types-between-client-and-server
interface RoomData {
    name: string;
    key: string;
    numPlayers: number;
    playerNames: string[];
}

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

function getRoomByKey(key: string): Game {
    const r = rooms.find((room) => room.getKey == key);
    if (!r) {
        throw new Error("Cannot find Room!");
    }
    return r;
}

function isValidRoom(key: string): boolean {
    return !!rooms.find((room) => room.getKey == key);
}

io.on("connection", (socket) => {
    console.log("a user connected");
    console.log(socket.id);
    socket.data.player = new Player(socket.id);
    players.push(socket.data.player);

    socket.on("disconnect", () => {
        if (socket.data.game) {
            socket.data.game.removePlayer(socket.data.player);
            socket.data.player.removeFromRoom();
        }

        players = players.filter((player) => player != socket.data.player);

        rooms = rooms.filter((room) => !room.isEmpty());

        console.log("user disconnected");
    });

    socket.on("player:setUsername", (username) => {
        console.log("user has set name to: " + username);
        socket.data.player.setUsername = username;
    });

    // client has created a room
    socket.on("room:create", (roomname, key, p) => {
        console.log(
            `a new room has been created with name: ${roomname} and key: ${key}`
        );
        socket.data.game = new Game(socket.data.player, roomname, key, p);
        rooms.push(socket.data.game);
        socket.join(key);
        io.to(key).emit("room:joined", {
            name: socket.data.game.getName,
            key: socket.data.game.getKey,
            playerNames: socket.data.game.getPlayerNames,
            numPlayers: socket.data.game.getNumPlayers,
        });
    });

    // client wants to join room
    socket.on("room:join", (key, callback) => {
        if (isValidRoom(key)) {
            callback({ status: true });
            socket.join(key);
            socket.data.game = getRoomByKey(key);
            socket.data.game.addPlayer(socket.data.player);
            // update room members on the new state
            io.to(key).emit("room:joined", {
                name: socket.data.game.getName,
                key: socket.data.game.getKey,
                playerNames: socket.data.game.getPlayerNames,
                numPlayers: socket.data.game.getNumPlayers,
            });
            console.log("user has joined room: " + socket.data.game.getName);
        } else {
            callback({ status: false });
        }
    });

    // client is looking at all public rooms
    socket.on("room:getPublic", (callback) => {
        let public_rooms: RoomData[] = [];
        rooms.forEach((room) => {
            if (room.isPublic) {
                public_rooms.push({
                    name: room.getName,
                    key: room.getKey,
                    numPlayers: room.getNumPlayers,
                    playerNames: room.getPlayerNames,
                });
            }
        });
        callback(public_rooms);
    });

    // notify clients in room that game has started
    socket.on("game:start", () => {
        io.to(socket.data.game.getKey).emit("game:hasStarted");
        socket.data.game.beginGame();
        // emit initial card state to each player
        socket.data.game.getPlayers.forEach((player) => {
            io.to(player.getId).emit(
                "game:setCardNames",
                player.getHand.map((card) => card.toString())
            );
        });
    });
});
