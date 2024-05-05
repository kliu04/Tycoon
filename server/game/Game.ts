// @ts-check
import Player from "./Player.js";
import Deck from "./Deck.js";
import Room from "./Room.js";
import Card from "./Card.js";

export default class Game extends Room {
    private _deck: Deck;
    // turn in [0, numPlayers - 1]
    private _turn: number;
    // player that started the trick
    private _cont_passes: number;
    private _playArea: Card[];

    constructor(admin: Player, name: string, key: string, p: boolean) {
        super(admin, name, key, p);
        this._deck = new Deck();
        this._turn = 0;
        this._cont_passes = 0;
        this._playArea = [];
    }

    // Game is ready to start
    beginGame() {
        this.dealCards(13);
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

    // could end up in infinite loop
    incTurn() {
        this._turn = (this._turn + 1) % 4;
        if (this.players.every((player) => player.done)) {
            console.error("All players have finished");
        }
        while (this.currentPlayer.done) {
            this._turn = (this._turn + 1) % 4;
        }
    }

    passTurn(): boolean {
        this.incTurn();
        this._cont_passes++;

        // count number of players that are done
        if (
            this._cont_passes ===
            this.numPlayers -
                1 -
                this.players.reduce((acc, current) => {
                    return current.done ? acc + 1 : acc;
                }, 0)
        ) {
            this._playArea = [];
            this._cont_passes = 0;
            return true;
        }
        return false;
    }

    allDone() {
        return this.players.every((player) => player.done);
    }

    resetPasses() {
        this._cont_passes = 0;
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
}
