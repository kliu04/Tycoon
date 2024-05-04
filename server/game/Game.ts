// @ts-check
import Player from "./Player.js";
import Deck from "./Deck.js";
import Room from "./Room.js";
import Card from "./Card.js";
import { createDecipheriv } from "crypto";

export default class Game extends Room {
    private _deck: Deck;
    // turn in [0, numPlayers - 1]
    private _turn: number;
    private _playArea: Card[];

    // tycoon
    private _daifugo: Player | null = null;
    // rich
    private _fugo: Player | null = null;
    // commoner
    private _heimin: Player[] = [];
    // poor
    private _hinmin: Player | null = null;
    // beggar
    private _daihinmin: Player | null = null;

    constructor(admin: Player, name: string, key: string, p: boolean) {
        super(admin, name, key, p);
        this._deck = new Deck();
        this._turn = 0;
        this._playArea = [];
    }

    // Game is ready to start
    beginGame() {
        this.dealCards(13);
        this.players.forEach((player) => {
            this._heimin.push(player);
        });
    }

    dealCards(num: number) {
        this._players.forEach((player) => {
            const hand = this._deck.getNCards(num);
            player.hand = hand;
            player.sortHand();
        });
    }

    verifyCards(cards: Card[]): boolean {
        // 0 length
        if (cards.length == 0) {
            return false;
        }
        // initial setup
        if (
            this.playArea.length === 0 &&
            cards.every(
                (card) =>
                    card.value === cards[0].value || card.toString() === "Joker"
            )
        ) {
            return true;
        }
        // all cards have the same value
        if (
            !cards.every(
                (card) =>
                    card.value === cards[0].value || card.toString() === "Joker"
            )
        ) {
            return false;
        }
        // different num of cards
        if (this.playArea.length != cards.length) {
            return false;
        }
        // increasing value of min
        return (
            cards.reduce((prev, curr) =>
                prev.value < curr.value ? prev : curr
            ).value >
            this.playArea.reduce((prev, curr) =>
                prev.value < curr.value ? prev : curr
            ).value
        );
    }

    incTurn() {
        this._turn = (this._turn + 1) % 4;
    }

    get turn() {
        return this._turn;
    }

    get currentPlayer() {
        return this._players[this._turn];
    }

    set playArea(newPlayArea: Card[]) {
        this._playArea = newPlayArea;
    }

    get playArea() {
        return this._playArea;
    }

    get daifugo(): Player | null {
        return this._daifugo;
    }

    get fugo(): Player | null {
        return this._fugo;
    }

    get heimin(): Player[] {
        return this._heimin;
    }

    get hinmin(): Player | null {
        return this._hinmin;
    }

    get daihinmin(): Player | null {
        return this._daihinmin;
    }

    set daifugo(player: Player | null) {
        this._heimin.filter((p) => p !== player);
        this._daifugo = player;
    }

    set fugo(player: Player | null) {
        this._heimin.filter((p) => p !== player);
        this._fugo = player;
    }

    set hinmin(player: Player | null) {
        this._heimin.filter((p) => p !== player);
        this._hinmin = player;
    }

    set daihinmin(player: Player | null) {
        this._heimin.filter((p) => p !== player);
        this._daihinmin = player;
    }
}
