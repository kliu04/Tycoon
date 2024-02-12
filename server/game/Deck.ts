import Card from "./Card.js";
import Suit from "./Suit.js";

export default class Deck {
    private deck: Card[] = new Array();

    constructor() {
        this.createDeck();
        this.shuffle();
    }

    createDeck() {
        const suits = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];
        for (const suit of suits) {
            for (let i = 1; i <= 13; i++) {
                this.deck.push(new Card(i, suit));
            }
        }

        // black joker
        this.deck.push(new Card(0, Suit.Joker));
        // red joker
        this.deck.push(new Card(-1, Suit.Joker));
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

    // gets n cards from the top and removes them from the deck
    getNumCards(num: number) {
        const slice = this.deck.slice(0, num);
        this.deck = this.deck.slice(num);
        return slice;
    }
}
