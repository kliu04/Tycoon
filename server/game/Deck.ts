import Card from "./Card.js";
import Suit from "./Suit.js";

export default class Deck {
    deck: Card[] = new Array();

    constructor() {
        const suits = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];
        for (const suit of suits) {
            for (let i = 1; i <= 13; i++) {
                this.deck.push(new Card(i, suit));
            }
        }
        this.shuffle();
    }

    // Fisher-Yates
    shuffle() {
        for (let i = this.deck.length - 1; i >= 1; i--) {
            // j in [0, i]
            const j = Math.floor(Math.random() * (i + 1));
            const temp = this.deck[j];
            this.deck[j] = this.deck[i];
            this.deck[i] = temp;
        }
    }
}
