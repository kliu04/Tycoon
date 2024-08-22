import Player from "./Player.js";
import Deck from "./Deck.js";
import Room from "./Room.js";
import Card from "../api/Card.js";
import InvalidPlayerError from "./exceptions/InvalidPlayerError.js";
import CardVerificationError from "./exceptions/CardVerificationError.js";
import Role from "./Role.js";
import StateError from "./exceptions/StateError.js";

enum GameState {
  Running, // Game is currently running
  Waiting, // Game is not currently running
  Taxation, // Taxation phase
  GameOver, // All rounds are done
}

export default class Game extends Room {
  private _deck: Deck;
  // turn in [0, numPlayers - 1]
  private _turn = 0;
  // player that started the trick
  private _cont_passes = 0;
  private _playArea: Card[];
  private _activePlayers: Player[];
  private _nextRole: Role = 0;
  private _rounds = 1;
  private _state = GameState.Waiting;

  public constructor(name: string, key: string, p: boolean) {
    super(name, key, p);
    this._deck = new Deck();
    this._playArea = [];
    this._activePlayers = [];
  }

  // need to seperate ui and model
  // TODO: rev, ctr rev, 3 of spades

  // Reset all vars and start
  public startGame() {
    this.checkState(GameState.Waiting);

    if (this._players.length !== 4) {
      throw new InvalidPlayerError("Need Exactly 4 Players!");
    }

    this._deck = new Deck();
    this.dealCards(13);
    this._playArea = [];
    this._turn = 0;
    this._cont_passes = 0;
    this._nextRole = 0;
    this._activePlayers = this._players;

    if (this._rounds === 1) {
      this._state = GameState.Running;
    } else {
      this._state = GameState.Taxation;
    }
  }

  public playCards(player: Player, cards: Card[]) {
    this.checkState(GameState.Running);
    let finished = false;

    this.verifyCards(player, cards);
    player.removeCards(cards);
    this.resetPasses();
    this._playArea = cards;

    if (player.numCards === 0) {
      this._activePlayers = this._activePlayers.filter((p) => p != player);
      finished = true;
      // modification of game rules for easier coding
      this._playArea = [];

      // if daifugo exists and player is not daifugo, bankrupt it
      if (this.getDaifugo() !== null && player !== this.getDaifugo()) {
        this._activePlayers = this._activePlayers.filter(
          (player) => player !== this.getDaifugo()
        );
        this.getDaifugo()!.role = Role.Daihinmin;
      }
      // assign player role
      player.role = this._nextRole;
      this._nextRole++;
      if (this._nextRole > 3) {
        throw new Error("Impossible Role Reached!");
      }
    }

    if (this.allFinished()) {
      if (this._activePlayers.length == 1) {
        // could be a bankrupt player
        if (this.getDaihinmin() != null) {
          this._activePlayers[0].role = Role.Hinmin;
        } else {
          this._activePlayers[0].role = Role.Daihinmin;
        }
      }
      this.players.forEach((player) => {
        player.addPoints();
      });
      this._rounds++;
      this._state = GameState.Waiting;
    }

    // 8 stop
    if (cards.some((card) => card.value == 8)) {
      console.log("8 stop");
      this._playArea = [];
    } else if (!finished) {
      this.incTurn();
    }

    if (finished) {
      // pointer is the last and finished needs to go to 0
      if (this._turn === this._activePlayers.length) {
        this._turn = 0;
      }
    }
  }

  public passTurn(player: Player) {
    this.checkState(GameState.Running);
    this.checkCurrentPlayer(player);
    if (this.playArea.length == 0) {
      throw new CardVerificationError(
        `Player ${player.username} must play cards!`
      );
    }
    this._cont_passes++;
    // only remove when trick is done
    if (this._cont_passes == this._activePlayers.length - 1) {
      this._playArea = [];
      this._cont_passes = 0;
    }
    this.incTurn();
  }

  private dealCards(num: number) {
    this._players.forEach((player) => {
      const hand = this._deck.getNCards(num);
      player.hand = hand;
      player.sortHand();
    });
  }

  private verifyCards(player: Player, cards: Card[]) {
    this.checkCurrentPlayer(player);
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
    // initial state
    if (
      this.playArea.length === 0 &&
      cards.every(
        (card) => card.value === cards[0].value || card.toString() === "Joker"
      )
    ) {
      return;
    }
    // some cards have different values
    if (
      !cards.every(
        (card) => card.value === cards[0].value || card.toString() === "Joker"
      )
    ) {
      throw new CardVerificationError(
        `Player ${player.username} is attempting to play cards with different values!`
      );
    }
    // different num of cards
    if (this.playArea.length != cards.length) {
      throw new CardVerificationError(
        `Player ${player.username} is playing the incorrect number of cards!`
      );
    }

    // increasing value of cards
    if (
      !(
        cards.reduce((prev, curr) => (prev.value < curr.value ? prev : curr))
          .value >
        this.playArea.reduce((prev, curr) =>
          prev.value < curr.value ? prev : curr
        ).value
      )
    ) {
      throw new CardVerificationError(
        `Player ${player.username}'s cards are not increasing in value!`
      );
    }
  }

  private checkState(requiredState: GameState) {
    if (this._state !== requiredState) {
      throw new StateError(
        `The Current State is ${this._state}, but it needs to be ${requiredState}`
      );
    }
  }

  private incTurn() {
    this._turn = (this._turn + 1) % this._activePlayers.length;
  }

  private allFinished() {
    return this._activePlayers.length <= 1;
  }

  private resetPasses() {
    this._cont_passes = 0;
  }

  private checkCurrentPlayer(player: Player) {
    if (player != this.currentPlayer) {
      throw new InvalidPlayerError(`It is not ${player.username}'s turn!`);
    }
  }

  private getDaifugo(): Player | null {
    this.players.forEach((player) => {
      if (player.role == Role.Daifugo) {
        return player;
      }
    });
    return null;
  }

  private getDaihinmin(): Player | null {
    this.players.forEach((player) => {
      if (player.role == Role.Daihinmin) {
        return player;
      }
    });
    return null;
  }

  //   private resetGame() {}

  get turn() {
    return this._turn;
  }

  get currentPlayer() {
    return this._activePlayers[this._turn];
  }

  // set playArea(newPlayArea: Card[]) {
  //   this._playArea = newPlayArea;
  // }

  get playArea() {
    return this._playArea;
  }

  get rounds() {
    return this._rounds;
  }
}
