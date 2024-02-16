// @ts-check
import Player from "./Player.js";
import Deck from "./Deck.js";
import Room from "./Room.js";

export default class Game extends Room {
    private deck: Deck;
    // turn in [0, 3]
    private turn: number;

    constructor(admin: Player, name: string, key: string, p: boolean) {
        super(admin, name, key, p);
        this.deck = new Deck();
        this.turn = 0;
    }

    // Game is ready to start
    beginGame() {
        this.dealCards(13);
    }

    dealCards(num: number) {
        this.players.forEach((player) => {
            const hand = this.deck.getNCards(num);
            player.setHand = hand;
        });
    }

    incTurn() {
        this.turn = (this.turn + 1) % 4;
    }

    get getTurn() {
        return this.turn;
    }

    get getCurrentPlayer() {
        return this.players[this.turn];
    }
}
