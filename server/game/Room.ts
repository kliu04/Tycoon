import Player from "./Player";

export default abstract class Room {
    protected players: Player[] = [];
    protected readonly name: string;
    protected readonly key: string;
    protected readonly private: boolean;

    constructor(admin: Player, name: string, key: string, p: boolean) {
        this.players[0] = admin;
        this.name = name;
        this.key = key;
        this.private = p;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    removePlayer(player: Player) {
        this.players = this.players.filter((p) => p !== player);
    }

    // all 4 players have joined
    isReady() {
        return this.players.length === 4;
    }

    // room is empty
    isEmpty() {
        return this.players.length === 0;
    }

    get getKey() {
        return this.key;
    }

    get getPlayerNames() {
        let names: string[] = [];

        this.players.forEach((player) => {
            names.push(player.getUsername);
        });

        return names;
    }

    get getNumPlayers() {
        return this.getPlayerNames.length;
    }

    get isPublic() {
        return !this.private;
    }

    get getName() {
        return this.name;
    }
}
