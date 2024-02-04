import Hand from "./Hand.js";

export default class Player {
    hand: Hand | null = null;
    readonly id: string;
    private username: string = "";
    private isInGame: boolean = false;

    constructor(id: string) {
        this.id = id;
    }

    set setUsername(username: string) {
        this.username = username;
    }

    get getUsername() {
        return this.username;
    }

    get getId() {
        return this.id;
    }
}
