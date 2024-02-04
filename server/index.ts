import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import Player from "./game/Player.js";
import Room from "./game/Room.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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

    socket.on("username_set", (username: string) => {
        console.log("user has set name to: " + username);
        getPlayerById(socket.id).setUsername = username;
    });

    socket.on("create", (roomname: string, key: string, p: boolean) => {
        console.log(
            `a new room has been created with name: ${roomname} and key: ${key}`
        );
        rooms.push(new Room(getPlayerById(socket.id), roomname, key, p));
    });
});
