import Player from "./Player.js";
import Deck from "./Deck.js";
import Room from "./Room.js";
import Card from "../api/Card.js";
import InvalidPlayerError from "./errors/InvalidPlayerError.js";
import CardVerificationError from "./errors/CardVerificationError.js";
import Role from "./Role.js";
import StateError from "./errors/StateError.js";
import TurnManager from "./TurnManager.js";

enum GameState {
  Running, // Game is currently running
  Waiting, // Game is not currently running
  Taxation, // Taxation phase
  GameOver, // All rounds are done
}

export default class Game extends Room {
  private _deck: Deck;
  // turn in [0, _activePlayers.length - 1]
  private _playArea: Card[];
  private _nextRole: Role = Role.Daifugo;
  private _rounds = 1;
  private _state = GameState.Waiting;

  private _daifugoTaxed = false;
  private _fugoTaxed = false;
  private _turnManager: TurnManager;

  public constructor(name: string, key: string, p: boolean) {
    super(name, key, p);
    this._deck = new Deck();
    this._playArea = [];
    this._turnManager = new TurnManager(this._players);
  }

  // need to seperate ui and model
  // TODO: rev, ctr rev, 3 of spades

  // Reset all vars and start
  public prepareGame() {
    this.checkState(GameState.Waiting);

    if (this._players.length !== 4) {
      throw new InvalidPlayerError("Need Exactly 4 Players!");
    }

    // this._deck = new Deck();
    // this.dealCards(13);
    // this._playArea = [];
    // this._turn = 0;
    // this._cont_passes = 0;
    // this._nextRole = 0;
    // this._activePlayers = this._players;
    this._deck = new Deck();
    this.dealCards(13);
    this._playArea = [];
    this._turnManager = new TurnManager(this._players);

    // First round has no tax
    this._state = this._rounds === 1 ? GameState.Running : GameState.Taxation;
  }

  public playCards(player: Player, cards: Card[]) {
    this.checkState(GameState.Running);
    // let finished = false;

    this.verifyCards(player, cards);
    player.removeCards(cards);
    // this.resetPasses();
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
    if (activeDaifugo !== null && activeDaifugo !== player) {
      activeDaifugo.nextRole = Role.Daihinmin;
      this._turnManager.removeActivePlayer(activeDaifugo);
    }

    if (this._turnManager.allFinished()) {
      // if (this.getRole(Role.Daihinmin) !== null) {
      //   player.nextRole = Role.Hinmin;
      // } else {
      //   player.nextRole = Role.Daihinmin;
      // }
      const lastPlayer = this._players.find(
        (player) => player.nextRole === null
      );

      if (lastPlayer !== null) {
        lastPlayer!.nextRole = Role.Daihinmin;
      }

      this.players.forEach((player) => {
        player.addPoints();
      });

      this.players.forEach((player) => {
        player.switchRole();
      });

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
    console.log(role);
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

  get currentPlayer() {
    return this._turnManager.currentPlayer;
  }

  // private incTurn() {
  //   this._turn = (this._turn + 1) % this._activePlayers.length;
  // }

  // private allFinished() {
  //   return this._activePlayers.length <= 1;
  // }

  // private resetPasses() {
  //   this._cont_passes = 0;
  // }

  private getRole(role: Role): Player | null {
    this.players.forEach((player) => {
      if (player.role == role) {
        return player;
      }
    });
    return null;
  }

  get playArea() {
    return this._playArea;
  }

  get rounds() {
    return this._rounds;
  }
}
