import Role from "../game/Role";

export interface PlayerData {
    name: string;
    numCards: number;
    points: number;
    role: Role;
    isCurrentPlayer: boolean | undefined;
}

export interface RoomData {
    name: string;
    key: string;
    players: PlayerData[];
}
