import Card from "./Card.js";

export default class Hand {
    cards: Card[];
    constructor(cards: Card[]) {
        this.cards = cards;
    }

    setHand(cards: Card[]) {
        this.cards = cards;
    }
}
