import Card from "./Card.js";
import { PlayerData, RoomData } from "./Data.js";

export interface ServerToClientEvents {
    // noArg: () => void;
    // basicEmit: (s: string) => void;
    // withAck: (d: string, callback: (e: string) => void) => void;
    "room:joined": (data: RoomData) => void;
    "game:hasStarted": () => void;
    "game:setPlayerCards": (cards: Card[]) => void;
    "game:updatePlayArea": (cards: Card[]) => void;
    "game:setClientTurn": () => void;
    "game:updatePlayerInfo": (info: PlayerData[]) => void;
    "game:roundOver": (status: boolean) => void;
    "game:isTaxPhase": (status: boolean) => void;
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
    "game:startNextRound": () => void;
    "game:sendTax": (
        selCards: Card[],
        callback: (status: boolean) => void
    ) => void;
}

export interface InterServerEvents {}
