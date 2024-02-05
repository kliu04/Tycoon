import { useParams } from "react-router-dom";
import { socket } from "./socket";

export default function Lobby() {
    const { key } = useParams();

    socket.on("joined_room", (roomName, playerNames) => {
        console.log(roomName, playerNames);
    });

    return <h1>{key}</h1>;
    // The room name is s and there are n people in the room.
    // players: a, b
}
