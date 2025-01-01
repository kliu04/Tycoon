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

    static toCard(cardName: string): Card {
        if (cardName === "Joker") {
            return new Card(16, Suit.Joker);
        }
        let parts = cardName.split("_of_");
        if (parts.length !== 2) {
            throw new Error("Invalid Card!");
        }
        let value_string = parts[0];

        let rank: number;
        if (value_string === "Jack") {
            rank = 11;
        } else if (value_string === "Queen") {
            rank = 12;
        } else if (value_string === "King") {
            rank = 13;
        } else if (value_string === "Ace") {
            rank = 14;
        } else if (value_string === "2") {
            rank = 15;
        } else {
            rank = parseInt(value_string);
        }

        // should always pass
        let suit = Suit[parts[1] as keyof typeof Suit];
        return new Card(rank, suit);
    }
}
