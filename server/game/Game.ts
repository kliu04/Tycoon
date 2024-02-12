import Player from "./Player.js";
import Deck from "./Deck.js";
import Room from "./Room.js";

export default class Game extends Room {
    deck: Deck;

    constructor(admin: Player, name: string, key: string, p: boolean) {
        super(admin, name, key, p);
        this.deck = new Deck();
    }

    // Game is ready to start
    beginGame() {
        this.dealCards(13);
    }

    dealCards(num: number) {
        this.players.forEach((player) => {
            const hand = this.deck.getNumCards(num);
            player.setHand = hand;
        });
    }
}
