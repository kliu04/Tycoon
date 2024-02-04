import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";
import Player from "./game/Player.js";

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

io.on("connection", (socket) => {
    console.log("a user connected");
    players.push(new Player(socket.id));
    console.log(socket.id);
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("username_set", (username) => {
        console.log("user has set name to: " + username);
    });
});
