import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useCallback, useEffect, useState } from "react";
import { PlayerData, RoomData } from "../../server/shared/Data";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

type Card = {
    value: number;
    suit: Suit;
};

enum Suit {
    Spades = 0,
    Hearts = 1,
    Clubs = 2,
    Diamonds = 3,
    // hack to ensure joker keys are unique
    Joker_1 = 4,
    Joker_2 = 5,
}

enum Role {
    Daifugo = 0,
    Fugo = 1,
    Hinmin = 2,
    Daihinmin = 3,
    Heimin = 4,
}

// copied from server
function cardToString(card: Card): string {
    switch (card.value) {
        case 11:
            return `Jack_of_${Suit[card.suit]}`;
        case 12:
            return `Queen_of_${Suit[card.suit]}`;
        case 13:
            return `King_of_${Suit[card.suit]}`;
        case 14:
            return `Ace_of_${Suit[card.suit]}`;
        case 15:
            return `2_of_${Suit[card.suit]}`;
        case 16:
            return `Joker`;
        default:
            return `${card.value}_of_${Suit[card.suit]}`;
    }
}

export default function Room() {
    const { key } = useParams();
    const [data, setData] = useState<RoomData>();
    const [start, setStart] = useState(false);
    const [cards, setCards] = useState<Card[]>([]);
    const [selCards, setSelCards] = useState<Card[]>([]);
    const [clientTurn, setClientTurn] = useState(false);
    const [playArea, setPlayArea] = useState<Card[]>([]);
    const [playersInfo, setPlayersInfo] = useState<PlayerData[]>([]);
    const [isRoundOver, setRoundOver] = useState(false);
    const [isTaxPhase, setTaxPhase] = useState(false);
    const [isGameOver, setGameOver] = useState(false);
    const [isBankrupt, setBankrupt] = useState(false);
    const [revolution, setRevolution] = useState(false);

    const handleCardClick = useCallback(
        (card: Card) => {
            // toggle card selection
            if (selCards.includes(card)) {
                setSelCards(selCards.filter((c) => c !== card));
            } else {
                setSelCards([...selCards, card]);
            }
        },
        [selCards]
    );

    const renderCards = useCallback(() => {
        return (
            <div className="grid grid-cols-8 gap-x-0 gap-y-2 justify-center items-center">
                {cards.map((card: Card) => {
                    let cardName = cardToString(card);
                    return (
                        <img
                            key={`${cardName}-${card.suit}`}
                            src={require(`./images/cards/${cardName}.svg`)}
                            alt={cardName}
                            className={`w-16 h-24 cursor-pointer ${
                                selCards.includes(card)
                                    ? "card selected w-16 h-24"
                                    : "card w-16 h-24"
                            }`}
                            onClick={() => handleCardClick(card)}
                        />
                    );
                })}
            </div>
        );
    }, [cards, selCards, handleCardClick]);

    const renderPlayArea = useCallback(() => {
        return (
            <div className="flex justify-center items-center space-x-2">
                {playArea.map((card) => {
                    let cardName = cardToString(card);
                    let keyValue: string;
                    if (card.suit === Suit.Joker_1) {
                        keyValue = "Joker_1";
                    } else if (card.suit === Suit.Joker_2) {
                        keyValue = "Joker_2";
                    } else {
                        keyValue = cardName;
                    }
                    return (
                        <img
                            key={keyValue}
                            src={require(`./images/cards/${cardName}.svg`)}
                            alt={cardName}
                            className="w-48 h-64"
                        />
                    );
                })}
            </div>
        );
    }, [playArea]);

    const renderPlayerInfo = useCallback(() => {
        return (
            <div className="flex justify-around items-center bg-white p-4 rounded-lg shadow-md mb-4">
                {playersInfo.map((playerInfo) => (
                    <div
                        key={playerInfo.name}
                        className={`p-2 text-center rounded-lg ${
                            playerInfo.isCurrentPlayer
                                ? "bg-green-300 border-4 border-blue-200"
                                : "bg-gray-200 border-4 border-blue-200"
                        }`}
                    >
                        <p className="font-bold">{playerInfo.name}</p>
                        <p>Role: {Role[playerInfo.role]}</p>
                        <p>Cards: {playerInfo.numCards}</p>
                        <p>Points: {playerInfo.points}</p>
                    </div>
                ))}
            </div>
        );
    }, [playersInfo]);

    function playSelected() {
        if (!clientTurn) {
            return;
        }

        socket.emit("game:playSelected", selCards, (response) => {
            if (response) {
                // remove selected cards
                setCards(
                    cards.filter((card) => {
                        return !selCards.includes(card);
                    })
                );
                setSelCards([]);
                setClientTurn(false);
            } else {
                // illegal cards played
                alert("You selected unplayable cards!");
                setSelCards([]);
            }
        });
    }

    function passTurn() {
        if (!clientTurn) {
            return;
        }

        socket.emit("game:passTurn");
        setClientTurn(false);
    }

    function startNextRound() {
        socket.emit("game:startNextRound");
    }

    function getWinners() {
        const maxPoints = Math.max(
            ...playersInfo.map((player) => player.points)
        );
        const winners = playersInfo.filter(
            (player) => player.points === maxPoints
        );
        return winners;
    }

    function sendTax() {
        socket.emit("game:sendTax", selCards, (response) => {
            if (response) {
                setCards(cards.filter((c) => !selCards.includes(c)));
                setSelCards([]);
            } else {
                alert("Bad tax!");
                setSelCards([]);
            }
        });
    }

    useEffect(() => {
        socket.on("room:joined", (roomData: RoomData) => {
            setData(roomData);
        });

        socket.on("game:hasStarted", () => {
            setStart(true);
        });

        socket.on("game:setPlayerCards", (cards: Card[]) => {
            setCards(cards);
            renderCards();
        });

        socket.on("game:setClientTurn", () => {
            setClientTurn(true);
        });

        socket.on("game:updatePlayArea", (cards: Card[]) => {
            setPlayArea(cards);
            renderPlayArea();
        });

        socket.on("game:updatePlayerInfo", (info: PlayerData[]) => {
            setPlayersInfo(info);
            renderPlayerInfo();
        });

        socket.on("game:roundOver", (status) => {
            setBankrupt(false);
            setRoundOver(status);
        });

        socket.on("game:isTaxPhase", (status) => {
            setTaxPhase(status);
        });

        socket.on("game:gameEnded", () => {
            setBankrupt(false);
            setGameOver(true);
        });

        socket.on("game:playerIsBankrupt", () => {
            setBankrupt(true);
        });

        socket.on("game:revolution", (status) => {
            setRevolution(status);
        });
    }, [renderCards, renderPlayArea, renderPlayerInfo]);

    if (!start) {
        return (
            <div className="flex flex-col items-center min-h-screen p-6 bg-teal-100">
                <div className="bg-white shadow-lg p-6 rounded-lg w-full max-w-md border-blue-200 border-4">
                    <h1 className="text-2xl text-center font-bold mb-4">
                        Room Info
                    </h1>
                    <p>
                        Room Key: <span className="font-bold">{key}</span>
                    </p>
                    <p>
                        Room Name:{" "}
                        <span className="font-bold">{data?.name}</span>
                    </p>
                    <p>
                        Players in Room:{" "}
                        <span className="font-bold">
                            {data?.players?.length || 0}
                        </span>
                    </p>
                    <ul className="list-disc pl-6">
                        {data?.players?.map((player) => (
                            <li key={player.name}>{player.name}</li>
                        ))}
                    </ul>
                    <button
                        className={`mt-4 w-full py-2 px-4 rounded-lg ${
                            data?.players?.length === 4
                                ? "bg-green-200 text-green-900 hover:bg-green-300"
                                : "bg-gray-400"
                        }`}
                        disabled={data?.players?.length !== 4}
                        onClick={() => {
                            setStart(true);
                            socket.emit("game:start");
                        }}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col min-h-screen bg-teal-100 p-6">
                {renderPlayerInfo()}
                <div className="flex-1 flex justify-center items-center bg-white p-6 rounded-lg mb-4 shadow-md">
                    {renderPlayArea()}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mb-4">
                    <button
                        className={`py-2 px-4 rounded-lg ${
                            clientTurn && selCards.length > 0
                                ? "bg-blue-200  text-blue-900 hover:bg-blue-300"
                                : "bg-gray-400 cursor-not-allowed"
                        }`}
                        disabled={!clientTurn || selCards.length === 0}
                        onClick={playSelected}
                    >
                        Play!
                    </button>
                    <button
                        className={`py-2 px-4 rounded-lg ${
                            clientTurn
                                ? "bg-blue-200  text-blue-900 hover:bg-blue-300"
                                : "bg-gray-400"
                        }`}
                        disabled={!clientTurn}
                        onClick={passTurn}
                    >
                        Pass!
                    </button>
                    {isRoundOver && (
                        <button
                            type="button"
                            className={
                                "py-2 px-4 rounded-lg bg-blue-200  text-blue-900 hover:bg-blue-300"
                            }
                            onClick={() => startNextRound()}
                        >
                            Begin Next Round!
                        </button>
                    )}
                    {isTaxPhase && (
                        <button
                            type="button"
                            className={
                                "py-2 px-4 rounded-lg bg-blue-200  text-blue-900 hover:bg-blue-300"
                            }
                            onClick={() => sendTax()}
                        >
                            Tax!
                        </button>
                    )}
                </div>

                {/* Player Cards */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    {renderCards()}
                </div>

                {/* Game Over Popup */}
                {isGameOver && (
                    <Popup open={isGameOver} position="right center">
                        <div>
                            The winner(s) are:{" "}
                            {getWinners()
                                .map((player) => player.name)
                                .join(", ")}{" "}
                            with {getWinners()[0].points} points!
                        </div>
                    </Popup>
                )}

                {/* Other Status Messages */}
                {isBankrupt && (
                    <h1 className="text-center text-red-500">
                        You are bankrupt!
                    </h1>
                )}
                {revolution && (
                    <h1 className="text-center text-green-500">Revolution!</h1>
                )}
            </div>
        );
    }
}
