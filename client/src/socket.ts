import { io, Socket } from "socket.io-client";
import {
    ServerToClientEvents,
    ClientToServerEvents,
} from "../../server/shared/Events";

const URL: string = "https://tycoon-zoho.onrender.com";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
