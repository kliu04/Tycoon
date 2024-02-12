import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useState } from "react";

interface RoomData {
    name: string;
    key: string;
    numPlayers: number;
    playerNames: string[];
}

export default function Room() {
    const { key } = useParams();
    const [data, setData] = useState<RoomData>();
    const [start, setStart] = useState(false);
    const [cardNames, setCardNames] = useState<string[]>([]);

    function renderCards() {
        let images: JSX.Element[] = [];

        cardNames.forEach((cardName) => {
            images.push(
                <img
                    src={require(`./images/cards/${cardName}.png`)}
                    alt={`${cardName} image`}
                    onClick={() => handleCardClick(cardName)}
                />
            );
        });

        return <div>{images}</div>;
    }

    function handleCardClick(cardName: string) {
        // TODO: finish this fn
        console.log(`${cardName} was clicked!`);
    }

    socket.on("room:joined", (roomData: RoomData) => {
        setData(roomData);
    });

    socket.on("game:hasStarted", () => {
        setStart(true);
    });

    socket.on("game:setCardNames", (cardNames: string[]) => {
        setCardNames(cardNames);
        renderCards();
    });

    if (!start) {
        return (
            <div>
                <h1>
                    The room key is {key} with name {data && data.name}. There
                    are {data && data.numPlayers} players in the room:
                </h1>
                <ul>
                    {data && data.playerNames.map((name) => <li>{name}</li>)}
                </ul>
                <button
                    type="button"
                    disabled={data?.numPlayers !== 4}
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
                <h1>Game has started!</h1>
                {renderCards()}
            </div>
        );
    }
}
