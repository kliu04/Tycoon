import { SyntheticEvent } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import "./index.css";

// function GotoLobby() {
//     const navigate = useNavigate();

//     function handleClick() {
//         navigate("/lobby");
//     }

//     return (
//         <button type="submit" id="find" onClick={handleClick}>
//             Find Lobby
//         </button>
//     );
// }

// function GotoCreate() {

//     function handleClick() {
//     }

//     return (
//         <button type="submit" id="find" onClick={handleClick}>
//             Create Lobby
//         </button>
//     );
// }

export default function Menu() {
    const navigate = useNavigate();

    function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault();
        const form = event.currentTarget;
        const elements = form.elements as typeof form.elements & {
            username: { value: string };
        };
        socket.emit("username_set", elements.username.value);

        let buttonName: string = event.nativeEvent.submitter!.id;
        if (buttonName === "find") {
            navigate("/find");
        } else if (buttonName === "create") {
            navigate("/create");
        }
    }

    return (
        <div className="main">
            {/* TODO: fix bolding */}
            <h1>
                <b>Tycoon</b>
            </h1>
            <form onSubmit={handleSubmit}>
                <label>
                    {/* TODO: fix bug where username can be blank */}
                    Username:
                    <input type="text" id="username" required />
                </label>
                <button type="submit" id="find">
                    Find Lobby
                </button>
                <button type="submit" id="create">
                    Create Lobby
                </button>
            </form>
            <button type="button">How to Play</button>
            <a href="https://github.com/Wevie0/Tycoon">
                <img
                    src={require("./images/github-mark.png")}
                    alt="GitHub Logo"
                />
            </a>
        </div>
    );
}
