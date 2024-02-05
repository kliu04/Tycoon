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
}

interface ClientToServerEvents {
    username_set: (s: string) => void;
    create: (rn: string, key: string, p: boolean) => void;
    joinkey: (joinkey: string, callback: Function) => void;
}

// interface SocketData {
//     username: string;
// }

const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
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
    players.push(new Player(socket.id));
    socket.on("disconnect", () => {
        players = players.filter((player) => {
            if (player == getPlayerById(socket.id)) {
                player.removeFromRoom();
                return false;
            }
            return true;
        });

        rooms = rooms.filter((room) => !room.isEmpty());

        console.log("user disconnected");
    });

    socket.on("username_set", (username) => {
        console.log("user has set name to: " + username);
        getPlayerById(socket.id).setUsername = username;
    });

    socket.on("create", (roomname: string, key: string, p: boolean) => {
        console.log(
            `a new room has been created with name: ${roomname} and key: ${key}`
        );
        rooms.push(new Room(getPlayerById(socket.id), roomname, key, p));
    });

    socket.on("joinkey", (joinkey: string, callback) => {
        if (isValidRoom(joinkey)) {
            callback({ status: true });
        } else {
            callback({ status: false });
        }
    });
});
