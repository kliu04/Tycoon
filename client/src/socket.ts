import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (data: RoomData) => void;
    "game:hasStarted": () => void;
    "game:setPlayerCards": (cardNames: string[]) => void;
    "game:updatePlayArea": (cardNames: string[]) => void;
    "game:setClientTurn": () => void;
}

interface RoomData {
    name: string;
    key: string;
    numPlayers: number;
    playerNames: string[];
}

interface ClientToServerEvents {
    "player:setUsername": (s: string) => void;
    "room:join": (joinkey: string, callback: Function) => void;
    "room:create": (rn: string, key: string, p: boolean) => void;
    "room:getPublic": (callback: Function) => void;
    "game:start": () => void;
    "game:playSelected": (selCards: string[], callback: (status: boolean) => void) => void;
    "game:passTurn": () => void;
}

export interface Response {
    status: boolean;
}

const URL: string = "http://localhost:4000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
    io(URL);
