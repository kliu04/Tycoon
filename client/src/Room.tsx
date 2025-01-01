import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useCallback, useEffect, useState } from "react";
import { PlayerData, RoomData } from "../../server/shared/Data";
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
    Joker = 4,
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
    // synced with server
    const [clientTurn, setClientTurn] = useState(false);
    const [playArea, setPlayArea] = useState<Card[]>([]);
    const [playersInfo, setPlayersInfo] = useState<PlayerData[]>([]);

    //
    const handleCardClick = useCallback(
        (card: Card) => {
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
                    console.log(card);
                    console.log(cardName);
                    return (
                        <img
                            key={cardName}
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
                    return (
                        <img
                            key={cardName}
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
                            {playerInfo.name}
                            <br />
                            {Role[playerInfo.role]}
                            <br />
                            {playerInfo.numCards}
                            <br />
                            {playerInfo.points}
                            <br />
                            {playerInfo.isCurrentPlayer ? 1 : 0}
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
                // TODO: change API here
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
                        data.players.map((player) => <li>{player.name}</li>)}
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
            </div>
        );
    }
}
