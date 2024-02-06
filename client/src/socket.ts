import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (roomName: string, playerNames: String[]) => void;
}

interface ClientToServerEvents {
    "player:set_username": (s: string) => void;
    "room:join": (joinkey: string, callback: Function) => void;
    "room:create": (rn: string, key: string, p: boolean) => void;
    "room:get_public": (callback: Function) => void;
}

const URL: string = "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
