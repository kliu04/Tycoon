import Game from "./Game.js";
import Card from "./Card.js";

export default class Player {
    private _hand: Card[] = [];
    private readonly _id: string;
    private _username: string = "";
    private _room: Game | null = null;

    constructor(id: string) {
        this._id = id;
    }

    sortHand() {
        this._hand.sort((a, b) => {
            if (a.value != b.value) {
                return a.value - b.value;
            } else {
                return a.suit - b.suit;
            }
        });
    }

    set hand(cards: Card[]) {
        this._hand = cards;
    }

    get hand() {
        return this._hand;
    }

    set username(username: string) {
        this._username = username;
    }

    set room(room: Game | null) {
        this._room = room;
    }

    removeCards(cards: Card[]) {
        this._hand = this._hand.filter((card) => {
            !cards.includes(card);
        });
    }

    getCardsFromNames(cardNames: string[]) {
        let cards: Card[] = [];

        this._hand.forEach((card) => {
            if (cardNames.includes(card.toString())) {
                cards.push(card);
            }
        });

        return cards;
    }

    get username() {
        return this._username;
    }

    get id() {
        return this._id;
    }

    get room(): Game | null {
        return this._room;
    }
}
