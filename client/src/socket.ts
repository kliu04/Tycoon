import { io, Socket } from "socket.io-client";
import {
    ServerToClientEvents,
    ClientToServerEvents,
} from "../../server/shared/Events";

const URL: string = "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
