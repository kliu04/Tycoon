import Card from "../../shared/Card";
import Deck from "../game/Deck";

describe("Deck Tests", () => {
    let deck: Deck;
    beforeEach(() => {
        jest.spyOn(global.Math, "random").mockReturnValue(0.123456789);
        deck = new Deck();
    });

    afterEach(() => {
        jest.spyOn(global.Math, "random").mockRestore();
        jest.clearAllMocks();
    });

    test("Test Shuffle", () => {
        const cards = [new Card(11, 0), new Card(6, 1), new Card(14, 1)];
        expect(deck.getNCards(3)).toEqual(cards);
    });
});
