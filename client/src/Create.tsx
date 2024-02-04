import { SyntheticEvent, useState } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";

export default function Create() {
    const [checked, setChecked] = useState(false);
    const [key, setKey] = useState(createJoinCode());
    const [p, setPrivate] = useState(false);
    const navigate = useNavigate();

    function createJoinCode(): string {
        // https://stackoverflow.com/a/44622300
        return Array.from(Array(20), () =>
            Math.floor(Math.random() * 36).toString(36)
        ).join("");
    }

    function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault();
        const form = event.currentTarget;
        const elements = form.elements as typeof form.elements & {
            roomname: { value: string };
        };
        socket.emit("create", elements.roomname.value, key, p);
        console.log(key);
        navigate(`../rooms/${key}`);
    }

    function handleCheck(event: {
        currentTarget: { checked: boolean | ((prevState: boolean) => boolean) };
    }) {
        setChecked(event.currentTarget.checked);
        setKey(createJoinCode());

        if (event.currentTarget.checked) {
            setPrivate(true);
        } else {
            setPrivate(false);
        }
    }

    return (
        <div>
            <h1>Create a Room:</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="roomname">Room name:</label>
                <input type="text" name="roomname" id="roomname" required />
                <label htmlFor="private">Private?</label>
                <input
                    type="checkbox"
                    name="private"
                    id="private"
                    checked={checked}
                    onChange={handleCheck}
                />

                {checked && (
                    <div>
                        <p>Your lobby key is: {key}</p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(key);
                            }}
                        >
                            Copy
                        </button>
                    </div>
                )}
                <input type="submit" value="Create!" />
            </form>
        </div>
    );
}
