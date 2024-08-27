import Game from "./Game.js";
import Card from "../api/Card.js";
import Role from "./Role.js";
import CardVerificationError from "./errors/CardVerificationError.js";

export default class Player {
  private _hand: Card[] = [];
  private readonly _id: string;
  private _username: string = "";
  private _room: Game | null = null;
  private _role: Role = Role.Heimin;
  private _points = 0;
  private _nextRole: Role | null = null;

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
        this._points += 3;
        break;
      case Role.Fugo:
        this._points += 2;
        break;
      case Role.Hinmin:
        this._points += 1;
        break;
      case Role.Daihinmin:
        this._points += 0;
        break;
      default:
        this._points += 0;
        break;
    }
  }

  public takeCards(cards: Card[]) {
    if (!this.handContainsCards(cards)) {
      throw new CardVerificationError(
        `Player ${this._username} does not have the cards ${cards}!`
      );
    }
    this.removeCards(cards);
    return cards;
  }

  public receiveCards(cards: Card[]) {
    this._hand.push(...cards);
    this.sortHand();
  }

  public getNBestCards(n: number) {
    if (n !== 1 && n !== 2) {
      throw new Error("n must be 1 or 2!");
    }
    this.sortHand();
    let best = this._hand.slice(-n);
    this.removeCards(best);
    return best;
  }

  public switchRole() {
    if (this._nextRole === null) {
      throw new Error("Next Role has not been set!");
    }
    this._role = this._nextRole;
    this._nextRole = null;
  }

  set nextRole(role: Role) {
    this._nextRole = role;
  }

  get nextRole(): Role | null {
    return this._nextRole;
  }

  set role(role) {
    this._role = role;
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

  get points() {
    return this._points;
  }
}
