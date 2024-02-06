import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useState } from "react";

interface RoomData {
    name: string;
    key: string;
    numPlayers: number;
    playerNames: string[];
}

export default function Lobby() {
    // don't really need useparams here, redundant
    const { key } = useParams();
    const [data, setData] = useState<RoomData>();

    socket.on("room:joined", (roomData: RoomData) => {
        setData(roomData);
    });

    return (
        <div>
            <h1>
                The room key is {key} with name {data && data.name}. There are{" "}
                {data && data.numPlayers} players in the room:
            </h1>
            <ul>{data && data.playerNames.map((name) => <li>{name}</li>)}</ul>
        </div>
    );
    // The room name is s and there are n people in the room.
    // players: a, b
}
