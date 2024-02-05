import { ReactNode, SyntheticEvent } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";

function getPublicRooms(): any[] {
    socket.emit("public_rooms", (response: any[]) => {
        console.log(response);
        return response;
    });
    throw new Error("Missing Response from Server!");
}

// TODO: fix any
function Table({ rooms }: { rooms: any }) {
    return <table></table>;
}

export default function Lobby() {
    const navigate = useNavigate();

    function handlePrivate(
        event: SyntheticEvent<HTMLFormElement, SubmitEvent>
    ) {
        event.preventDefault();
        const form = event.currentTarget;
        const elements = form.elements as typeof form.elements & {
            key: { value: string };
        };
        const joinkey = elements.key.value;

        socket.emit("joinkey", joinkey, (response: any) => {
            console.log(response.status);
            if (response.status) {
                navigate(`../rooms/${joinkey}`);
            } else {
                alert("Invalid Join Code!");
            }
        });
    }

    getPublicRooms();

    return (
        <div>
            <div>
                <h2>Join a Public Game:</h2>
                <Table rooms={getPublicRooms()} />
            </div>
            <form onSubmit={handlePrivate}>
                <h2>Join a Private Game:</h2>
                <label htmlFor="key">Join Key:</label>
                <input type="text" id="key" name="key" />
                <button type="submit">Join!</button>
            </form>
        </div>
    );
}
