import Card from "../api/Card";
import Game from "../game/Game";
import Player from "../game/Player";

describe("Game Tests", () => {
  let game: Game;
  let player0: Player;
  let player1: Player;
  let player2: Player;
  let player3: Player;

  let error: jest.SpyInstance<
    void,
    [message?: any, ...optionalParams: any[]],
    any
  >;

  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
    error = jest.spyOn(console, "error").mockImplementation();

    player0 = new Player("0");
    player1 = new Player("1");
    player2 = new Player("2");
    player3 = new Player("3");

    player0.username = "a";
    player1.username = "b";
    player2.username = "c";
    player3.username = "d";

    game = new Game(player0, "Test", "ID", false);
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.addPlayer(player3);

    game.beginGame();
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
    error.mockRestore();
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
      game.players.forEach((player) => expect(player.hand.length).toBe(13));
      // console.log statements can be used for debugging
      // game.players.forEach((player) => console.log(player.hand));
      expect(game.currentPlayer).toBe(player0);
    });
  });

  describe("First Player Plays", () => {
    test("Wrong Player", () => {
      // Use expect with a function to test for throwing errors
      // expect(() => game.playTurn(player1, [])).toThrow(
      //     "Incorrect Player"
      // );
      game.playCards(player1, []);
      expect(error).toHaveBeenCalledWith("Incorrect Player!");
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toStrictEqual([]);
    });

    test("Failed verification", () => {
      expect(game.verifyCards([])).toBe(false);
      expect(error).toHaveBeenCalledWith(
        "Player should not be able to play 0 cards!"
      );

      expect(game.verifyCards([new Card(3, 2)])).toBe(false);
      expect(error).toHaveBeenCalledWith(
        "Current Player does not have these cards!"
      );
    });

    test("Successfully Played a Card", () => {
      expect(game.verifyCards([new Card(3, 0), new Card(3, 1)])).toBe(true);
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      expect(error).not.toHaveBeenCalled();
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toStrictEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);
    });

    test("Sucessfully Played Multiple Cards", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      game.playCards(player1, [new Card(4, 0), new Card(4, 1)]);

      expect(player1.hand.length).toBe(11);
      expect(game.currentPlayer).toBe(player2);
      expect(game.playArea).toStrictEqual([new Card(4, 0), new Card(4, 1)]);
    });
  });
});
