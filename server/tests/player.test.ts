import Card from "../shared/Card";
import Player from "../game/Player";
import Role from "../game/Role";

describe("Player Tests", () => {
    let player: Player;
    beforeEach(() => {
        player = new Player("p");
        const hand = [new Card(1, 2), new Card(4, 3), new Card(13, 1)];
        player.hand = hand;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("Test Contains Failure", () => {
        const hand = [new Card(1, 2), new Card(4, 3), new Card(13, 2)];
        expect(player.handContainsCards(hand)).toBe(false);
        expect(player.hand.length).toBe(3);
    });

    test("Test Contains Success", () => {
        const hand = [new Card(1, 2), new Card(4, 3)];
        expect(player.handContainsCards(hand)).toBe(true);
        expect(player.hand.length).toBe(3);
    });

    test("Test Remove Empty", () => {
        const toRemove = [new Card(1, 1), new Card(4, 2)];
        player.removeCards(toRemove);
        expect(player.hand.length).toBe(3);
        expect(player.hand).toEqual([
            new Card(1, 2),
            new Card(4, 3),
            new Card(13, 1),
        ]);
    });

    test("Test Remove Success", () => {
        const toRemove = [new Card(1, 2), new Card(4, 2)];
        player.removeCards(toRemove);
        expect(player.hand.length).toBe(2);
        expect(player.hand).toEqual([new Card(4, 3), new Card(13, 1)]);
    });

    test("Test Role ", () => {
        expect(player.role).toBe(Role.Heimin);
        expect(player.points).toBe(0);

        player.role = Role.Daifugo;
        player.addPoints();
        expect(player.points).toBe(3);

        player.role = Role.Fugo;
        player.addPoints();
        expect(player.points).toBe(5);

        player.role = Role.Hinmin;
        player.addPoints();
        expect(player.points).toBe(6);

        player.role = Role.Daihinmin;
        player.addPoints();
        expect(player.points).toBe(6);
    });
});
