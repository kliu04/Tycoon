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
    joined_room: (roomName: string, playerNames: String[]) => void;
}

interface ClientToServerEvents {
    username_set: (s: string) => void;
    create: (rn: string, key: string, p: boolean) => void;
    joinkey: (joinkey: string, callback: Function) => void;
    public_rooms: (callback: Function) => void;
}

interface InterServerEvents {}

interface SocketData {
    username: string;
    player: Player;
    room: Room;
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

function getPlayerById(id: string): Player {
    const p = players.find((player) => player.id == id);
    if (!p) {
        throw new Error("Cannot find player!");
    }
    return p;
}

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
        socket.data.player.removeFromRoom();
        socket.data.room.removePlayer(socket.data.player);

        rooms = rooms.filter((room) => !room.isEmpty());

        console.log("user disconnected");
    });

    socket.on("username_set", (username) => {
        console.log("user has set name to: " + username);
        socket.data.player.setUsername = username;
    });

    // client has created a room
    socket.on("create", (roomname, key, p) => {
        console.log(
            `a new room has been created with name: ${roomname} and key: ${key}`
        );
        socket.data.room = new Room(socket.data.player, roomname, key, p);
        rooms.push(socket.data.room);
        socket.join(key);
    });

    // client wants to join private room
    socket.on("joinkey", (joinkey, callback) => {
        if (isValidRoom(joinkey)) {
            callback({ status: true });
            socket.join(joinkey);
            socket.data.room = getRoomByKey(joinkey);
            socket.data.room.addPlayer(socket.data.player);
            socket.emit(
                "joined_room",
                socket.data.room.name,
                socket.data.room.getPlayerNames
            );
        } else {
            callback({ status: false });
        }
    });

    socket.on("public_rooms", (callback) => {
        let obj: Object[] = [];
        rooms.forEach((room) => {
            if (room.isPublic) {
                obj.push({
                    name: room.name,
                    numPlayers: room.getNumPlayers,
                });
            }
        });
        console.log(obj);
        callback(obj);
    });
});
