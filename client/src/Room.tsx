import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useCallback, useEffect, useState } from "react";
import { PlayerData, RoomData } from "../../server/shared/Data";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
// import Card from "../../server/shared/Card";

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

// hack
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
            <div>
                {cards.map((card: Card) => {
                    let cardName = cardToString(card);
                    return (
                        <img
                            key={`${cardName}-${card.suit}`}
                            src={require(`./images/cards/${cardName}.svg`)}
                            alt={cardName}
                            className={
                                // add a class that makes selected cards darker
                                selCards.includes(card)
                                    ? "card selected"
                                    : "card"
                            }
                            onClick={() => handleCardClick(card)}
                        />
                    );
                })}
            </div>
        );
    }, [cards, selCards, handleCardClick]);

    const renderPlayArea = useCallback(() => {
        return (
            <div>
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
                            className={"card"}
                        />
                    );
                })}
            </div>
        );
    }, [playArea]);

    const renderPlayerInfo = useCallback(() => {
        return (
            <div>
                {playersInfo.map((playerInfo) => {
                    return (
                        <div>
                            Name: {playerInfo.name}
                            <br />
                            Role: {Role[playerInfo.role]}
                            <br /># Cards: {playerInfo.numCards}
                            <br />
                            Points: {playerInfo.points}
                            <br />
                            Current: {playerInfo.isCurrentPlayer ? 1 : 0}
                        </div>
                    );
                })}
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
            setRoundOver(status);
        });

        socket.on("game:isTaxPhase", (status) => {
            setTaxPhase(status);
        });

        socket.on("game:gameEnded", () => {
            setGameOver(true);
        });
    }, [renderCards, renderPlayArea, renderPlayerInfo]);

    if (!start) {
        return (
            <div>
                <h1>
                    The room key is {key} with name {data && data.name}. There
                    are {data && data.players && data.players.length} players in
                    the room:
                </h1>
                <ul>
                    {data &&
                        data.players &&
                        data.players.map((player) => (
                            <li key={player.name}>{player.name}</li>
                        ))}
                </ul>
                <button
                    type="button"
                    disabled={data?.players.length !== 4}
                    onClick={() => {
                        setStart(true);
                        socket.emit("game:start");
                    }}
                >
                    Start Game!
                </button>
            </div>
        );
    } else {
        return (
            <div>
                {isGameOver && (
                    <Popup position="right center">
                        <div>
                            The winner(s) are:
                            {getWinners().map(
                                (player) => player.name
                            )} with {getWinners()[0].points}
                        </div>
                    </Popup>
                )}
                {clientTurn && <h1>It is currently your turn.</h1>}
                {renderPlayArea()}
                {renderPlayerInfo()}
                <br></br>
                <hr />
                {renderCards()}
                <button
                    type="button"
                    disabled={!clientTurn || selCards.length === 0}
                    onClick={() => playSelected()}
                >
                    Play!
                </button>
                <button
                    type="button"
                    disabled={!clientTurn}
                    onClick={() => passTurn()}
                >
                    Pass!
                </button>
                {isRoundOver && (
                    <button type="button" onClick={() => startNextRound()}>
                        Begin Next Round!
                    </button>
                )}
                {isTaxPhase && (
                    <button type="button" onClick={() => sendTax()}>
                        Tax!
                    </button>
                )}
            </div>
        );
    }
}
