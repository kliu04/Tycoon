import { io, Socket } from "socket.io-client";
import {
    ServerToClientEvents,
    ClientToServerEvents,
} from "../../server/shared/Events";

const URL: string = "https://wevie-tycoon-1fe22816eef2.herokuapp.com/";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
