import Game from "./Game.js";
import Card from "../api/Card.js";
import Role from "./Role.js";

export default class Player {
  private _hand: Card[] = [];
  private readonly _id: string;
  private _username: string = "";
  private _room: Game | null = null;
  private _role: Role = Role.Heimin;
  private _points = 0;

  constructor(id: string) {
    this._id = id;
  }

  public sortHand() {
    this._hand.sort((a, b) => {
      if (a.value != b.value) {
        return a.value - b.value;
      } else {
        return a.suit - b.suit;
      }
    });
  }

  // get cards from names method

  // true iff cards argument is a subset of the hand
  public handContainsCards(cards: Card[]): boolean {
    // includes is deep equality so we compare names instead
    return cards
      .map((card) => card.toString())
      .every((cardName) =>
        this._hand.map((card) => card.toString()).includes(cardName)
      );
  }

  // removes all cards of the intersection of cards and hand from the hand
  public removeCards(cards: Card[]) {
    const cardNamesToRemove = cards.map((card) => card.toString());
    this._hand = this._hand.filter(
      (card) => !cardNamesToRemove.includes(card.toString())
    );
  }

  public addPoints() {
    switch (this._role) {
      case Role.Daifugo:
        this._points += 10;
        break;
      case Role.Fugo:
        this._points += 7;
        break;
      case Role.Hinmin:
        this._points += 4;
        break;
      case Role.Daihinmin:
        this._points += 1;
        break;
      default:
        this._points += 0;
    }
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

  get role() {
    return this._role;
  }

  set role(r) {
    this._role = r;
  }

  get points() {
    return this._points;
  }
}
