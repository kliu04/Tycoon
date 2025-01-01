import Card from "./Card.js";

export interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (data: RoomData) => void;
    "game:hasStarted": () => void;
    "game:setPlayerCards": (cards: Card[]) => void;
    "game:updatePlayArea": (cards: Card[]) => void;
    "game:setClientTurn": () => void;
}

export interface ClientToServerEvents {
    "player:setUsername": (s: string) => void;
    "room:join": (joinkey: string, callback: (status: boolean) => void) => void;
    "room:create": (roomname: string, key: string, p: boolean) => void;
    "room:getPublic": (callback: (public_rooms: RoomData[]) => void) => void;
    "game:start": () => void;
    "game:playSelected": (
        selCards: Card[],
        callback: (status: boolean) => void
    ) => void;
    "game:passTurn": () => void;
}

export interface InterServerEvents {}

export interface PlayerData {
    name: string;
    numCards: number;
    points: number;
}

export interface RoomData {
    name: string;
    key: string;
    players: PlayerData[];
}

export interface Response {
    status: boolean;
}
