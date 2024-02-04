import { SyntheticEvent, useState } from "react";

export default function Create() {
    const [checked, setChecked] = useState(false);
    const [key, setKey] = useState("");

    function createJoinCode() {
        // https://stackoverflow.com/a/44622300
        setKey(
            Array.from(Array(20), () =>
                Math.floor(Math.random() * 36).toString(36)
            ).join("")
        );
    }

    function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault();
    }

    function handleCheck(event: {
        currentTarget: { checked: boolean | ((prevState: boolean) => boolean) };
    }) {
        setChecked(event.currentTarget.checked);

        if (checked) {
            createJoinCode();
        } else {
            setKey("");
        }
    }

    return (
        <div>
            <h1>Create a Room:</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="room-name">Room name:</label>
                <input type="text" name="room-name" id="room-name" />
                <label htmlFor="private">Private?</label>
                <input
                    type="checkbox"
                    name="private"
                    id="private"
                    onChange={handleCheck}
                />
                <div>{checked && <p>Your private key is: {key}</p>}</div>
                <input type="submit" value="Create!" />
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(key);
                    }}
                >
                    Copy
                </button>
            </form>
        </div>
    );
}
