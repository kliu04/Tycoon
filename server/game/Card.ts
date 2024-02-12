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

    toString() {
        switch (this.value) {
            // hack to encode jokers
            case -1:
                return "Red_Joker";
            case 0:
                return "Black_Joker";
            case 1:
                return `Ace_of_${Suit[this.suit]}`;
            case 11:
                return `Jack_of_${Suit[this.suit]}`;
            case 12:
                return `Queen_of_${Suit[this.suit]}`;
            case 13:
                return `King_of_${Suit[this.suit]}`;
            default:
                return `${this.value}_of_${Suit[this.suit]}`;
        }
    }
}
