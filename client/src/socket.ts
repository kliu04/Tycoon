import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (data: RoomData) => void;
    "game:hasStarted": () => void;
}

interface RoomData {
    name: string;
    key: string;
    numPlayers: number;
    playerNames: string[];
}

interface ClientToServerEvents {
    "player:set_username": (s: string) => void;
    "room:join": (joinkey: string, callback: Function) => void;
    "room:create": (rn: string, key: string, p: boolean) => void;
    "room:get_public": (callback: Function) => void;
    "game:start": () => void;
}

const URL: string = "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
