import Suit from "./Suit.js";

export default class Card {
    private value: number;
    private suit: Suit;
    constructor(value: number, suit: Suit) {
        this.value = value;
        this.suit = suit;
    }

    get getValue() {
        return this.value;
    }

    get getSuit() {
        return this.suit;
    }
}
