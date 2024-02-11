import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useState } from "react";

interface RoomData {
    name: string;
    key: string;
    numPlayers: number;
    playerNames: string[];
}

function startGame() {
    socket.emit("room:start");
}

export default function Room() {
    const { key } = useParams();
    const [data, setData] = useState<RoomData>();
    const [start, setStart] = useState(false);

    socket.on("room:joined", (roomData: RoomData) => {
        setData(roomData);
    });

    // Game has not started
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
                        startGame();
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
            </div>
        );
    }
}
