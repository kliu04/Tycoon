import { SyntheticEvent } from "react";
import { socket } from "./socket";

export default function Lobby() {
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
        });
    }

    return (
        <div>
            <div>
                <h2>Join a Public Game:</h2>
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
