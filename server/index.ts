import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import Player from "./game/Player.js";
import Room from "./game/Room.js";

interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (data: RoomData) => void;
}

interface ClientToServerEvents {
    "player:set_username": (s: string) => void;
    "room:join": (joinkey: string, callback: Function) => void;
    "room:create": (rn: string, key: string, p: boolean) => void;
    "room:get_public": (callback: Function) => void;
}

interface InterServerEvents {}

interface SocketData {
    username: string;
    player: Player;
    room: Room;
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
let rooms: Room[] = [];

function getRoomByKey(key: string): Room {
    const r = rooms.find((room) => room.key == key);
    if (!r) {
        throw new Error("Cannot find Room!");
    }
    return r;
}

function isValidRoom(key: string): boolean {
    return !!rooms.find((room) => room.key == key);
}

io.on("connection", (socket) => {
    console.log("a user connected");
    console.log(socket.id);
    socket.data.player = new Player(socket.id);
    players.push(socket.data.player);

    socket.on("disconnect", () => {
        if (socket.data.room) {
            socket.data.room.removePlayer(socket.data.player);
            socket.data.player.removeFromRoom();
        }

        players = players.filter((player) => player != socket.data.player);

        rooms = rooms.filter((room) => !room.isEmpty());

        console.log("user disconnected");
    });

    socket.on("player:set_username", (username) => {
        console.log("user has set name to: " + username);
        socket.data.player.setUsername = username;
    });

    // client has created a room
    socket.on("room:create", (roomname, key, p) => {
        console.log(
            `a new room has been created with name: ${roomname} and key: ${key}`
        );
        socket.data.room = new Room(socket.data.player, roomname, key, p);
        rooms.push(socket.data.room);
        socket.join(key);
        io.to(key).emit("room:joined", {
            name: socket.data.room.name,
            key: socket.data.room.key,
            playerNames: socket.data.room.getPlayerNames,
            numPlayers: socket.data.room.getNumPlayers,
        });
    });

    // client wants to join room
    socket.on("room:join", (key, callback) => {
        if (isValidRoom(key)) {
            callback({ status: true });
            socket.join(key);
            socket.data.room = getRoomByKey(key);
            socket.data.room.addPlayer(socket.data.player);
            // update room members on the new state
            io.to(key).emit("room:joined", {
                name: socket.data.room.name,
                key: socket.data.room.key,
                playerNames: socket.data.room.getPlayerNames,
                numPlayers: socket.data.room.getNumPlayers,
            });
        } else {
            callback({ status: false });
        }
    });

    // client is looking at all public rooms
    socket.on("room:get_public", (callback) => {
        let public_rooms: RoomData[] = [];
        rooms.forEach((room) => {
            if (room.isPublic) {
                public_rooms.push({
                    name: room.name,
                    key: room.key,
                    numPlayers: room.getNumPlayers,
                    playerNames: room.getPlayerNames,
                });
            }
        });
        // TODO: figure out why this happens multiple times
        console.log(public_rooms);
        callback(public_rooms);
    });
});
