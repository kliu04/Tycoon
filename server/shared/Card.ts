import Suit from "./Suit.js";

export default class Card {
    public value: number;
    public suit: Suit;
    constructor(value: number, suit: Suit) {
        this.value = value;
        this.suit = suit;
    }

    toString(): string {
        switch (this.value) {
            case 11:
                return `Jack_of_${Suit[this.suit]}`;
            case 12:
                return `Queen_of_${Suit[this.suit]}`;
            case 13:
                return `King_of_${Suit[this.suit]}`;
            case 14:
                return `Ace_of_${Suit[this.suit]}`;
            case 15:
                return `2_of_${Suit[this.suit]}`;
            case 16:
                return `Joker`;
            default:
                return `${this.value}_of_${Suit[this.suit]}`;
        }
    }
}
