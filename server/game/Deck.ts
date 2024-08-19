import Card from "../api/Card.js";
import Suit from "./Suit.js";

// wrapper for a collection of cards
export default class Deck {
  private deck: Card[] = [];

  constructor() {
    this.createDeck();
    this.shuffle();
  }

  createDeck() {
    const suits = [Suit.Spades, Suit.Hearts, Suit.Clubs, Suit.Diamonds];
    for (const suit of suits) {
      for (let i = 3; i <= 15; i++) {
        let card = new Card(i, suit);
        this.deck.push(card);
      }
    }
    // jokers
    let joker = new Card(16, Suit.Joker);
    this.deck.push(joker);
    this.deck.push(joker);
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
  getNCards(n: number) {
    const slice = this.deck.slice(0, n);
    this.deck = this.deck.slice(n);
    return slice;
  }

  static getCardsFromNames(cardNames: string[]) {
    return cardNames.map((cardName) => Card.toCard(cardName));
  }
}
