import Game from "./Game.js";
import Card from "./Card.js";
import Role from "./Role.js";

export default class Player {
    private _hand: Card[] = [];
    private readonly _id: string;
    private _username: string = "";
    private _room: Game | null = null;
    private _role: Role = Role.Heimin;
    private _done: boolean = false;

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

    removeCards(cards: Card[]) {

        cards.forEach((card) => {
            let index = -1;
            for (let i = 0; i < this._hand.length; i++) {
                if (this._hand[i].toString() === card.toString()) {
                    index = i;
                }
            }
            if (index === -1) {
                console.error("Missing card in player's hand!");
            } else {
                this._hand.splice(index, 1);
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

    get username() {
        return this._username;
    }

    get id() {
        return this._id;
    }

    get room(): Game | null {
        return this._room;
    }

    get numCards() {
        return this._hand.length;
    }

    get done() {
        return this._done;
    }

    set done(status) {
        this._done = status;
    }
}
