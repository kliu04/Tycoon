import Suit from "./Suit.js";

export default class Card {
    private _value: number;
    private _suit: Suit;
    constructor(value: number, suit: Suit) {
        this._value = value;
        this._suit = suit;
    }

    get value() {
        return this._value;
    }

    get suit() {
        return this._suit;
    }

    toString() {
        switch (this._value) {
            case 11:
                return `Jack_of_${Suit[this._suit]}`;
            case 12:
                return `Queen_of_${Suit[this._suit]}`;
            case 13:
                return `King_of_${Suit[this._suit]}`;
            case 14:
                return `Ace_of_${Suit[this._suit]}`;
            case 15:
                return `Joker`;
            default:
                return `${this._value}_of_${Suit[this._suit]}`;
        }
    }
}
