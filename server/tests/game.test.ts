import Game from "../game/Game";
import Player from "../game/Player";
// import Deck from "../game/Deck";
// import Card from "../game/Card";

// jest.mock("../game/Game");
// jest.mock("../game/Player");

describe("Game Tests", () => {
    let game: Game;
    let player0: Player;
    let player1: Player;
    let player2: Player;
    let player3: Player;

    beforeEach(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);

        player0 = new Player("0");
        player1 = new Player("1");
        player2 = new Player("2");
        player3 = new Player("3");

        player0.username = "a";
        player1.username = "b";
        player2.username = "c";
        player3.username = "d";

        game = new Game(player0, "Test", "000", false);
        game.addPlayer(player1);
        game.addPlayer(player2);
        game.addPlayer(player3);

        game.beginGame();
    });

    afterEach(() => {
        jest.spyOn(global.Math, "random").mockRestore();
        jest.clearAllMocks();
    });

    describe("Init", () => {
        test("New instances created", () => {
            expect(game).toBeInstanceOf(Game);
            expect(game.isReady()).toBe(true);
            expect(game.playerNames).toStrictEqual(["a", "b", "c", "d"]);
            expect(game.players.length).toBe(4);
        });
        test("Check Players", () => {
            game.players.forEach((player) =>
                expect(player.hand.length).toBe(13)
            );
            game.players.forEach((player) => console.log(player.hand));
            expect(game.currentPlayer).toBe(player0);
        });
    });
    describe("Play a Card", () => {
        // player0.
        // TODO: rework index.ts
    });
});
