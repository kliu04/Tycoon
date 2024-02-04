import Player from "./Player.js";
import Deck from "./Deck.js";

export default class Game {
    players: [Player | null, Player | null, Player | null, Player | null] = [
        null,
        null,
        null,
        null,
    ];

    deck : Deck;

    constructor(admin: Player) {
        this.players[0] = admin;
        this.deck = new Deck();
    }

    addPlayer(player: Player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === null) {
                this.players[i] = player;
            }
        }
    }

    removePlayer(player: Player) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] === player) {
                this.players[i] = null;
            }
        }
    }

    // all 4 players have joined
    isReady?() {
        return this.players.every(
            (val, i, arr) => typeof val === typeof arr[0]
        );
    }
}
