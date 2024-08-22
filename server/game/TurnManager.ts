import InvalidPlayerError from "./errors/InvalidPlayerError";
import Player from "./Player";
import Role from "./Role";

export default class TurnManager {
  private _turn = 0;
  private _contPasses = 0;
  private _activePlayers: Player[];

  constructor(activePlayers: Player[]) {
    this._activePlayers = activePlayers;
  }

  public incTurn() {
    this._turn = (this._turn + 1) % this._activePlayers.length;
  }

  public resetPasses() {
    this._contPasses = 0;
  }

  public passTurn() {
    this._contPasses++;
  }

  public removeActivePlayer(p: Player) {
    this._activePlayers = this._activePlayers.filter((player) => player !== p);
    if (this._turn > this._activePlayers.length - 1) {
      this._turn = 0;
    }
  }

  public trickComplete(): boolean {
    return this._contPasses == this._activePlayers.length - 1;
  }

  public allFinished() {
    return this._activePlayers.length <= 1;
  }

  public getActiveDaifugo(): Player | null {
    return (
      this._activePlayers.find((player) => player.role === Role.Daifugo) || null
    );
  }

  public checkCurrentPlayer(player: Player) {
    if (player != this.currentPlayer) {
      throw new InvalidPlayerError(`It is not ${player.username}'s turn!`);
    }
  }

  get turn() {
    return this._turn;
  }

  get currentPlayer() {
    return this._activePlayers[this._turn];
  }
}
