import { io, Socket } from "socket.io-client";

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
    public_rooms: (response: Function) => void;
}

const URL: string = "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
