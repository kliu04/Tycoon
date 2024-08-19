import Game from "../game/Game";
import Player from "../game/Player";

export interface ServerToClientEvents {
  // noArg: () => void;
  // basicEmit: (s: string) => void;
  // withAck: (d: string, callback: (e: string) => void) => void;
  "room:joined": (data: RoomData) => void;
  "game:hasStarted": () => void;
  "game:setPlayerCards": (cardNames: string[]) => void;
  "game:updatePlayArea": (cardNames: string[]) => void;
  "game:setClientTurn": () => void;
}

export interface ClientToServerEvents {
  "player:setUsername": (s: string) => void;
  "room:join": (joinkey: string, callback: (status: boolean) => void) => void;
  "room:create": (rn: string, key: string, p: boolean) => void;
  "room:getPublic": (callback: (public_rooms: RoomData[]) => void) => void;
  "game:start": () => void;
  "game:playSelected": (
    selCards: string[],
    callback: (status: boolean) => void
  ) => void;
  "game:passTurn": () => void;
}

export interface InterServerEvents {}

export interface SocketData {
  username: string;
  player: Player;
  game: Game;
}

export interface RoomData {
  name: string;
  key: string;
  numPlayers: number;
  playerNames: string[];
}

export interface Response {
  status: boolean;
}
