import Player from "./Player";

export default abstract class Room {
    protected _players: Player[] = [];
    protected readonly _name: string;
    protected readonly _key: string;
    protected readonly _isPrivate: boolean;

    constructor(name: string, key: string, p: boolean) {
        this._name = name;
        this._key = key;
        this._isPrivate = p;
    }

    addPlayer(player: Player) {
        this._players.push(player);
    }

    removePlayer(player: Player) {
        this._players = this._players.filter((p) => p !== player);
    }

    // all 4 players have joined
    isReady() {
        return this._players.length === 4;
    }

    // room is empty
    isEmpty() {
        return this._players.length === 0;
    }

    get key() {
        return this._key;
    }

    get playerNames() {
        return this._players.map((player) => player.username);
    }

    get players() {
        return this._players;
    }

    get numPlayers() {
        return this.playerNames.length;
    }

    get isPublic() {
        return !this._isPrivate;
    }

    get name() {
        return this._name;
    }

    get playerData() {
        return this.players.map((player) => player.data);
    }
}
