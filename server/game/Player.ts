import Hand from "./Hand.js";
import Room from "./Room.js";

export default class Player {
    hand: Hand | null = null;
    readonly id: string;
    private username: string = "";
    private isInGame: boolean = false;
    private room: Room | null = null;

    constructor(id: string) {
        this.id = id;
    }

    set setUsername(username: string) {
        this.username = username;
    }

    set setRoom(room: Room) {
        this.room = room;
    }

    removeFromRoom() {
        this.room = null;
    }

    get getUsername() {
        return this.username;
    }

    get getId() {
        return this.id;
    }

    get getRoom() {
        return this.room;
    }
}
