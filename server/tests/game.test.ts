import { getDefaultHighWaterMark } from "stream";
import Card from "../api/Card";
import CardVerificationError from "../game/errors/CardVerificationError";
import InvalidPlayerError from "../game/errors/InvalidPlayerError";
import Game from "../game/Game";
import Player from "../game/Player";
import Role from "../game/Role";
import StateError from "../game/errors/StateError";

describe("Game Tests", () => {
  let game: Game;
  let player0: Player;
  let player1: Player;
  let player2: Player;
  let player3: Player;

  // let error: jest.SpyInstance<
  //   void,
  //   [message?: any, ...optionalParams: any[]],
  //   any
  // >;

  beforeEach(() => {
    jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
    // error = jest.spyOn(console, "error").mockImplementation();

    player0 = new Player("0");
    player1 = new Player("1");
    player2 = new Player("2");
    player3 = new Player("3");

    player0.username = "a";
    player1.username = "b";
    player2.username = "c";
    player3.username = "d";

    game = new Game("Test", "key", false);
    game.addPlayer(player0);
    game.addPlayer(player1);
    game.addPlayer(player2);
    game.addPlayer(player3);

    game.prepareRound();
  });

  afterEach(() => {
    jest.spyOn(global.Math, "random").mockRestore();
    // error.mockRestore();
    jest.clearAllMocks();
  });

  describe("Init", () => {
    test("New instance created", () => {
      expect(game).toBeInstanceOf(Game);
      expect(game.isReady()).toBe(true);
      const players = [player0, player1, player2, player3];
      expect(game.players).toEqual(players);
      expect(game.name).toEqual("Test");
      expect(game.key).toEqual("key");
      expect(game.isPublic).toBe(true);
      expect(game.rounds).toBe(1);
    });

    test("Check Players", () => {
      game.players.forEach((player) => expect(player.hand.length).toBe(13));
      expect(game.currentPlayer).toBe(player0);

      // expect(game.currentPlayer.role).toBe(Role.Heimin);
    });
  });

  describe("First Move", () => {
    test("Wrong Player, 0 Cards", () => {
      expect(() => game.playCards(player1, [])).toThrow(InvalidPlayerError);
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
      expect(player0.numCards).toBe(13);
      expect(player1.numCards).toBe(13);
    });

    test("Wrong Player, >0 Cards", () => {
      expect(() =>
        game.playCards(player1, [new Card(1, 1), new Card(1, 2)])
      ).toThrow(InvalidPlayerError);
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
      expect(player0.numCards).toBe(13);
      expect(player1.numCards).toBe(13);
    });

    test("Right Player, 0 Cards", () => {
      expect(() => game.playCards(player0, [])).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
      expect(player0.numCards).toBe(13);
      expect(player1.numCards).toBe(13);
    });

    test("Right Player, Wrong Cards", () => {
      expect(() =>
        game.playCards(player0, [new Card(1, 1), new Card(1, 2)])
      ).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
      expect(player0.numCards).toBe(13);
      expect(player1.numCards).toBe(13);
    });

    test("Successfully Played a Card", () => {
      game.playCards(player0, [new Card(3, 0)]);
      // expect(error).not.toHaveBeenCalled();
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0)]);
      expect(player0.hand.length).toBe(12);
    });

    test("Successfully Played a Card", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      // expect(error).not.toHaveBeenCalled();
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);
    });
  });

  describe("Multiple Moves", () => {
    test("First Move Error, Second Try Success", () => {
      expect(() =>
        game.playCards(player0, [new Card(1, 1), new Card(1, 2)])
      ).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
      expect(player0.numCards).toBe(13);
      expect(player1.numCards).toBe(13);

      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);
    });

    test("First Player Tries Again After Success", () => {
      expect(() =>
        game.playCards(player0, [new Card(1, 1), new Card(1, 2)])
      ).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
      expect(player0.numCards).toBe(13);
      expect(player1.numCards).toBe(13);

      expect(() =>
        game.playCards(player0, [new Card(1, 1), new Card(1, 2)])
      ).toThrow(CardVerificationError);
    });

    test("Second Player Plays With Missing Cards", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);

      expect(() =>
        game.playCards(player1, [new Card(1, 1), new Card(1, 2)])
      ).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);
      expect(player1.hand.length).toBe(13);
    });

    test("Second Player Plays With Incorrect Cards", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);

      expect(() =>
        game.playCards(player1, [new Card(5, 1), new Card(7, 1)])
      ).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);
      expect(player1.hand.length).toBe(13);
    });

    test("Second Player Plays Correctly", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);

      game.playCards(player1, [new Card(4, 0), new Card(4, 1)]);
      expect(game.currentPlayer).toBe(player2);
      expect(game.playArea).toEqual([new Card(4, 0), new Card(4, 1)]);
      expect(player1.hand.length).toBe(11);
    });

    test("First Player Attempts to Pass", () => {
      expect(() => game.passTurn(player0)).toThrow(CardVerificationError);
      expect(game.currentPlayer).toBe(player0);
    });

    test("First Plays, Second Passes", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      expect(game.currentPlayer).toBe(player1);
      expect(game.playArea).toEqual([new Card(3, 0), new Card(3, 1)]);
      expect(player0.hand.length).toBe(11);

      game.passTurn(player1);
      expect(game.currentPlayer).toBe(player2);
      expect(player1.hand.length).toBe(13);
    });
  });

  describe("Advanced Behaviour", () => {
    test("Everyone Passes", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      game.passTurn(player1);
      game.passTurn(player2);
      game.passTurn(player3);

      expect(game.currentPlayer).toBe(player0);
      expect(game.playArea).toEqual([]);
    });

    test("Complete Game", () => {
      game.playCards(player0, [new Card(3, 0), new Card(3, 1)]);
      game.playCards(player1, [new Card(4, 0), new Card(4, 1)]);
      game.playCards(player2, [new Card(6, 0), new Card(6, 2)]);
      game.playCards(player3, [new Card(8, 0), new Card(8, 3)]); // 8 stop!!
      expect(game.playArea).toEqual([]);

      game.playCards(player3, [new Card(7, 0), new Card(7, 3)]);
      game.playCards(player0, [new Card(14, 0), new Card(14, 1)]);
      game.passTurn(player1);
      game.passTurn(player2);
      game.playCards(player3, [new Card(15, 3), new Card(16, 4)]);
      game.passTurn(player0);
      game.passTurn(player1);
      game.passTurn(player2);
      expect(game.playArea).toEqual([]);

      game.playCards(player3, [new Card(5, 3)]);
      game.playCards(player0, [new Card(9, 2)]);
      game.playCards(player1, [new Card(10, 1)]);
      expect(() => game.playCards(player2, [new Card(10, 2)])).toThrow(
        CardVerificationError
      );
      game.playCards(player2, [new Card(11, 2)]);
      game.playCards(player3, [new Card(14, 3)]);
      game.playCards(player0, [new Card(15, 0)]);
      game.passTurn(player1);
      game.passTurn(player2);
      game.passTurn(player3);

      game.playCards(player0, [new Card(12, 0), new Card(12, 3)]);
      game.passTurn(player1);
      game.passTurn(player2);
      game.passTurn(player3);

      game.playCards(player0, [new Card(4, 3)]);
      game.playCards(player1, [new Card(8, 1)]);

      game.playCards(player1, [new Card(5, 0), new Card(5, 1)]);
      game.passTurn(player2);
      game.passTurn(player3);
      game.passTurn(player0);

      game.playCards(player1, [new Card(3, 2)]);
      game.playCards(player2, [new Card(4, 2)]);
      game.playCards(player3, [new Card(6, 3)]);
      game.playCards(player0, [new Card(10, 0)]);
      game.playCards(player1, [new Card(11, 1)]);
      game.playCards(player2, [new Card(12, 2)]);
      game.playCards(player3, [new Card(13, 3)]);
      game.passTurn(player0);
      game.playCards(player1, [new Card(15, 1)]);
      game.passTurn(player2);
      game.passTurn(player3);
      game.passTurn(player0);

      game.playCards(player1, [new Card(7, 1)]);
      game.playCards(player2, [new Card(10, 2)]);
      game.playCards(player3, [new Card(11, 3)]);
      game.playCards(player0, [new Card(13, 0)]);
      game.passTurn(player1);
      game.passTurn(player2);
      game.passTurn(player3);

      game.playCards(player0, [new Card(11, 0)]);
      game.passTurn(player1);
      game.passTurn(player2);
      game.passTurn(player3);

      game.playCards(player0, [new Card(6, 1)]);
      expect(player0.nextRole).toBe(Role.Daifugo);
      expect(game.playArea).toEqual([]);
      expect(game.currentPlayer).toBe(player1);

      game.playCards(player1, [new Card(9, 1)]);
      game.passTurn(player2);
      game.playCards(player3, [new Card(10, 3)]);
      game.passTurn(player1);
      game.passTurn(player2);
      expect(game.playArea).toEqual([]);

      game.playCards(player3, [new Card(9, 3)]);

      game.playCards(player1, [new Card(12, 1)]);
      game.passTurn(player2);

      game.playCards(player1, [new Card(13, 1)]);

      expect(game.playArea).toEqual([]);
      expect(player0.role).toBe(Role.Daifugo);
      expect(player3.role).toBe(Role.Fugo);
      expect(player1.role).toBe(Role.Hinmin);
      expect(player2.role).toBe(Role.Daihinmin);
      expect(game.rounds).toBe(2);

      // 2nd Round
      // jest.spyOn(global.Math, "random").mockReturnValue(0.11235813);
      jest.spyOn(global.Math, "random").mockReturnValue(0.5);
      game.prepareRound();
      expect(player0.points).toBe(3);
      expect(player3.points).toBe(2);
      expect(player1.points).toBe(1);
      expect(player2.points).toBe(0);

      expect(() => game.tax(player1, [])).toThrow(InvalidPlayerError);
      game.tax(player0, [new Card(4, 0), new Card(5, 0)]);
      game.tax(player3, [new Card(4, 3)]);
      expect(() => game.tax(player0, [])).toThrow(StateError);

      console.log("XXXXX");

      console.log(player0.hand);
      console.log(player1.hand);
      console.log(player2.hand);
      console.log(player3.hand);

      expect(player0.hand.length).toBe(13);
      expect(player1.hand.length).toBe(13);
      expect(player2.hand.length).toBe(13);
      expect(player3.hand.length).toBe(13);

      game.playCards(player0, [new Card(6, 0), new Card(6, 2)]);
    });
  });
});
