import Player from "./Player.js";
import Deck from "./Deck.js";

export default class Room {
    players: [Player | null, Player | null, Player | null, Player | null] = [
        null,
        null,
        null,
        null,
    ];

    deck: Deck;
    readonly name: string;
    readonly key: string;
    readonly private?: boolean;

    constructor(admin: Player, name: string, key: string, p: boolean) {
        this.players[0] = admin;
        this.name = name;
        this.key = key;
        this.private = p;
        this.deck = new Deck();
    }

    addPlayer(player: Player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === null) {
                this.players[i] = player;
                break;
            }
        }
    }

    removePlayer(player: Player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === player) {
                this.players[i] = null;
                break;
            }
        }
    }

    // all 4 players have joined
    isReady() {
        return this.players.every(
            (val, i, arr) => typeof val === typeof arr[0]
        );
    }

    // room is empty
    isEmpty() {
        return this.players.every((val, i, arr) => typeof val === null);
    }

    get getKey() {
        return this.key;
    }

    get getPlayerNames() {
        let names: string[] = [];

        this.players.forEach((player) => {
            if (player != null) {
                names.push(player.getUsername);
            }
        });

        return names;
    }
}
