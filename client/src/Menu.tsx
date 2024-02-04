import { SyntheticEvent } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import "./index.css";

function GotoLobby() {
    const navigate = useNavigate();

    function handleClick() {
        navigate("/lobby");
    }

    return (
        <button type="submit" id="find" onClick={handleClick}>
            Find Lobby
        </button>
    );
}

function GotoCreate() {
    const navigate = useNavigate();

    function handleClick() {
        navigate("/create");
    }

    return (
        <button type="submit" id="find" onClick={handleClick}>
            Create Lobby
        </button>
    );
}

export default function Menu() {
    function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault();
        const form = event.currentTarget;
        const elements = form.elements as typeof form.elements & {
            username: { value: string };
        };
        socket.emit("username_set", elements.username.value);
    }

    return (
        <div className="main">
            {/* TODO: fix bolding */}
            <h1>
                <b>Tycoon</b>
            </h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" id="username" required />
                </label>
                <GotoLobby />
                <GotoCreate />
            </form>
            <button type="button">How to Play</button>
        </div>
    );
}
