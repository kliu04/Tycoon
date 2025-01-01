import Card from "../shared/Card.js";
import Deck from "./Deck.js";
import CardVerificationError from "./errors/CardVerificationError.js";
import InvalidPlayerError from "./errors/InvalidPlayerError.js";
import StateError from "./errors/StateError.js";
import Player from "./Player.js";
import Role from "./Role.js";
import Room from "./Room.js";
import TurnManager from "./TurnManager.js";

enum GameState {
    Running, // Game is currently running
    Waiting, // Game is not currently running
    Taxation, // Taxation phase
    GameOver, // All rounds are done
}

export default class Game extends Room {
    private _deck: Deck;
    private _playArea: Card[];
    private _nextRole: Role = Role.Daifugo;
    private _rounds = 1;
    private _state = GameState.Waiting;
    private _turnManager: TurnManager;
    private _revolution = false;

    private _daifugoTaxed = false;
    private _fugoTaxed = false;
    private _bankrupcy = false;

    public constructor(name: string, key: string, p: boolean) {
        super(name, key, p);
        this._deck = new Deck();
        this._playArea = [];
        this._turnManager = new TurnManager(this._players);
    }

    // Reset all vars and start
    public prepareRound() {
        this.checkState(GameState.Waiting);

        if (this._players.length !== 4) {
            throw new InvalidPlayerError("Need Exactly 4 Players!");
        }
        this._deck = new Deck();
        this.dealCards(13);
        this._playArea = [];
        this._turnManager = new TurnManager(this._players);
        this._nextRole = 0;
        this._revolution = false;
        this._daifugoTaxed = false;
        this._fugoTaxed = false;
        this._bankrupcy = false;
        // First round has no tax
        this._state =
            this._rounds === 1 ? GameState.Running : GameState.Taxation;
    }

    // player attempts to play selected cards
    public playCards(player: Player, cards: Card[]) {
        this.checkState(GameState.Running);
        // possible exn here!
        this.verifyCards(player, cards);

        // no exn
        player.removeCards(cards);
        this._playArea = cards;

        this._turnManager.resetPasses();

        if (player.numCards === 0) {
            this.handlePlayerFinished(player);
        } else if (cards.some((card) => card.value == 8)) {
            this._playArea = [];
        } else {
            this._turnManager.incTurn();
        }
    }

    private handlePlayerFinished(player: Player) {
        this._turnManager.removeActivePlayer(player);
        this._playArea = [];
        player.nextRole = this.getNextRole();

        // bankrupt daifugo
        const activeDaifugo = this._turnManager.getActiveDaifugo();
        if (
            activeDaifugo !== null &&
            activeDaifugo !== player &&
            !this._bankrupcy
        ) {
            activeDaifugo.nextRole = Role.Daihinmin;
            this._turnManager.removeActivePlayer(activeDaifugo);
            this._bankrupcy = true;
        }

        if (this._turnManager.allFinished()) {
            const lastPlayer = this._turnManager.currentPlayer;
            this._turnManager.removeActivePlayer(lastPlayer);

            if (lastPlayer && !this._bankrupcy) {
                lastPlayer.nextRole = Role.Daihinmin;
            } else if (lastPlayer) {
                lastPlayer.nextRole = Role.Hinmin;
            }

            this.players.forEach((player) => {
                player.switchRole();
            });

            this.players.forEach((player) => {
                player.addPoints();
            });

            if (this._rounds === 3) {
                this._state = GameState.GameOver;
                // need to notify that the game is over somehow
                return;
            }

            this._rounds++;
            this._state = GameState.Waiting;
        }
    }

    private getNextRole(): Role {
        const role: Role = this._nextRole;
        this._nextRole++;
        if (this._nextRole > 3) {
            throw new Error("Impossible Role Reached!");
        }
        return role;
    }

    public passTurn(player: Player) {
        this.checkState(GameState.Running);
        this._turnManager.checkCurrentPlayer(player);
        if (this.playArea.length == 0) {
            throw new CardVerificationError(
                `Player ${player.username} must play cards!`
            );
        }
        this._turnManager.passTurn();
        if (this._turnManager.trickComplete()) {
            this._playArea = [];
            this._turnManager.resetPasses();
        }
        this._turnManager.incTurn();
    }

    public tax(giver: Player, cards: Card[]) {
        this.checkState(GameState.Taxation);
        if (giver.role === Role.Daifugo) {
            if (cards.length !== 2) {
                throw new CardVerificationError(
                    `Daifugo must select exactly 2 cards to give!`
                );
            }
            giver.takeCards(cards);
            this.getRole(Role.Daihinmin)?.receiveCards(cards);
            this._daifugoTaxed = true;
        } else if (giver.role === Role.Fugo) {
            if (cards.length !== 1) {
                throw new CardVerificationError(
                    `Fugo must select exactly 1 card to give!`
                );
            }
            giver.takeCards(cards);
            this.getRole(Role.Hinmin)?.receiveCards(cards);
            this._fugoTaxed = true;
        } else {
            throw new InvalidPlayerError("Giver must be Daifugo or Fugo");
        }

        if (this._fugoTaxed && this._daifugoTaxed) {
            this.getRole(Role.Daifugo)?.receiveCards(
                this.getRole(Role.Daihinmin)!.getNBestCards(2)
            );
            this.getRole(Role.Fugo)?.receiveCards(
                this.getRole(Role.Hinmin)!.getNBestCards(1)
            );
            this._turnManager.initTurn();
            this._state = GameState.Running;
        }
    }

    private dealCards(num: number) {
        this._players.forEach((player) => {
            const hand = this._deck.getNCards(num);
            player.hand = hand;
            player.sortHand();
        });
    }

    /**
     * Checks that the cards are a legal move in Tycoon by not throwing an error
     * @param player - the player making the move
     * @param cards - The cards the player is playing
     * @throws {CardVerificationError}
     * Thrown if the cards are illegal
     * @throws {InvalidPlayerError}
     * Thrown if the player is not the active player
     */
    private verifyCards(player: Player, cards: Card[]) {
        this._turnManager.checkCurrentPlayer(player);
        // check player has cards they are playing
        if (!player.handContainsCards(cards)) {
            throw new CardVerificationError(
                `Player ${player.username}'s hand does not contain these cards!`
            );
        }
        // 0 length
        if (cards.length == 0) {
            throw new CardVerificationError(
                `Player ${player.username}'s cannot play 0 cards!`
            );
        }

        if (
            !cards.every(
                (card) =>
                    card.toString() === "Joker" ||
                    card.value ===
                        cards.find((c) => c.toString() !== "Joker")?.value
            )
        ) {
            throw new CardVerificationError(
                `Player ${player.username} is attempting to play cards with different values!`
            );
        }

        // different num of cards
        if (
            this.playArea.length !== cards.length &&
            this.playArea.length !== 0
        ) {
            throw new CardVerificationError(
                `Player ${player.username} is playing the incorrect number of cards!`
            );
        }

        if (cards.length === 4) {
            this._revolution = !this._revolution;
        }

        // initial state
        if (this.playArea.length === 0) {
            return;
        }

        // 3 spades rule
        if (
            this.playArea.length === 1 &&
            this.playArea[0].value === 16 &&
            cards[0].suit === 0 &&
            cards[0].value === 3
        ) {
            return;
        }

        if (!this._revolution) {
            // increasing value of cards
            if (
                !(
                    cards.reduce((prev, curr) =>
                        prev.value < curr.value ? prev : curr
                    ).value >
                    this.playArea.reduce((prev, curr) =>
                        prev.value < curr.value ? prev : curr
                    ).value
                )
            ) {
                throw new CardVerificationError(
                    `Player ${player.username}'s cards are not increasing in value!`
                );
            }
        } else {
            if (
                !(
                    cards.reduce((prev, curr) =>
                        prev.value < curr.value ? prev : curr
                    ).value <
                    this.playArea.reduce((prev, curr) =>
                        prev.value < curr.value ? prev : curr
                    ).value
                )
            ) {
                throw new CardVerificationError(
                    `Player ${player.username}'s cards are not decreasing in value!`
                );
            }
        }
    }

    private checkState(requiredState: GameState) {
        if (this._state !== requiredState) {
            throw new StateError(
                `The Current State is ${this._state}, but it needs to be ${requiredState}`
            );
        }
    }

    get currentPlayer() {
        return this._turnManager.currentPlayer;
    }

    private getRole(role: Role): Player | null {
        return this.players.find((player) => player.role === role) || null;
    }

    get playArea() {
        return this._playArea;
    }

    get rounds() {
        return this._rounds;
    }

    public isGameOver() {
        return this._state === GameState.GameOver;
    }
}
