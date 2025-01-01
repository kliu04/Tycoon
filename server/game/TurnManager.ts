import InvalidPlayerError from "./errors/InvalidPlayerError.js";
import Player from "./Player.js";
import Role from "./Role.js";

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
        // bankrupting a player
        if (this.currentPlayer !== p) {
            const index = this._activePlayers.indexOf(p);

            if (index < this._turn) {
                this._turn--;
            }

            this._activePlayers = this._activePlayers.filter(
                (player) => player !== p
            );
        } else {
            this._activePlayers = this._activePlayers.filter(
                (player) => player !== p
            );

            if (this._turn > this._activePlayers.length - 1) {
                this._turn = 0;
            }
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
            this._activePlayers.find(
                (player) => player.role === Role.Daifugo
            ) || null
        );
    }

    public checkCurrentPlayer(player: Player) {
        if (player != this.currentPlayer) {
            throw new InvalidPlayerError(
                `It is not ${player.username}'s turn!`
            );
        }
    }

    /**
     * Initalize the beginning turn to the Daifugo's
     */
    public initTurn() {
        if (
            this._activePlayers.findIndex(
                (player) => player.role === Role.Daifugo
            ) === -1
        ) {
            throw new InvalidPlayerError(
                "There is no Daifugo in the active player list!"
            );
        }
        this._turn = this._activePlayers.findIndex(
            (player) => player.role === Role.Daifugo
        );
    }

    get turn() {
        return this._turn;
    }

    get currentPlayer() {
        return this._activePlayers[this._turn];
    }
}
