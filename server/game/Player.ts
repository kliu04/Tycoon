import Game from "./Game.js";
import Card from "./Card.js";

export default class Player {
    private hand: Card[] = [];
    private readonly id: string;
    private username: string = "";
    private room: Game | null = null;

    constructor(id: string) {
        this.id = id;
    }

    sortHand() {
        this.hand.sort((a, b) => {
            if (a.getValue != b.getValue) {
                return a.getValue - b.getValue;
            } else {
                return a.getSuit - b.getSuit;
            }
        });
    }

    set setHand(cards: Card[]) {
        this.hand = cards;
    }

    get getHand() {
        return this.hand;
    }

    set setUsername(username: string) {
        this.username = username;
    }

    set setRoom(room: Game) {
        this.room = room;
    }

    removeFromRoom() {
        this.room = null;
    }

    removeCards(cards: Card[]) {
        this.hand = this.hand.filter((card) => {
            !cards.includes(card);
        });
    }

    getCardsFromNames(cardNames: string[]) {
        let cards: Card[] = [];

        this.hand.forEach((card) => {
            if (cardNames.includes(card.toString())) {
                cards.push(card);
            }
        });

        return cards;
    }

    get getUsername() {
        return this.username;
    }

    get getId() {
        return this.id;
    }

    get getRoom() {
        return this.room;
    }
}
