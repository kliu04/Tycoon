import { SyntheticEvent, useState } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";

export default function Create() {
    const [checked, setChecked] = useState(false);
    const [key, setKey] = useState(createJoinCode());
    const [isPrivate, setPrivate] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
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
        socket.emit("room:create", elements.roomname.value, key, isPrivate);
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

    function handleCopy() {
        navigator.clipboard.writeText(key);
        setPopupVisible(true);
        setTimeout(() => setPopupVisible(false), 1000); // close after 1 sec
    }

    return (
        <div className="flex h-screen items-center justify-center bg-teal-100">
            <div className="w-96 rounded-lg bg-white p-6 shadow-md border-blue-200 border-4">
                <h1 className="mb-6 text-center text-3xl font-bold">
                    Create a Game
                </h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="roomname"
                            className="block text-lg font-medium"
                        >
                            Roomname:
                        </label>
                        <input
                            type="text"
                            name="roomname"
                            id="roomname"
                            required
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-teal-600 "
                        />
                    </div>
                    <div className="flex items-center">
                        <label
                            htmlFor="private"
                            className="mr-2 text-lg font-medium"
                        >
                            Private:
                        </label>
                        <input
                            type="checkbox"
                            name="private"
                            id="private"
                            checked={checked}
                            onChange={handleCheck}
                            className="h-5 w-5 rounded border-gray-300"
                        />
                    </div>
                    {checked && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={key}
                                readOnly
                                className="w-full rounded-md border border-gray-300 p-2 shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    handleCopy();
                                }}
                                className="rounded-md bg-gray-200 p-2 hover:bg-gray-300"
                            >
                                {/* TODO: make a popup that says copied */}
                                📋
                            </button>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="w-full rounded-md px-4 py-2 text-lg font-medium bg-green-200 text-green-900 hover:bg-green-300"
                    >
                        Create
                    </button>
                </form>
            </div>

            {isPopupVisible && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
                    Key copied!
                </div>
            )}
        </div>
    );

    // return (
    //     <div>
    //         <h1>Create a Room:</h1>
    //         <form onSubmit={handleSubmit}>
    //             <label htmlFor="roomname">Room name:</label>
    //             <input type="text" name="roomname" id="roomname" required />
    //             <label htmlFor="private">Private?</label>
    //             <input
    //                 type="checkbox"
    //                 name="private"
    //                 id="private"
    //                 checked={checked}
    //                 onChange={handleCheck}
    //             />

    //             {checked && (
    //                 <div>
    //                     <p>Your lobby key is: {key}</p>
    //                     <button
    //                         onClick={() => {
    //                             navigator.clipboard.writeText(key);
    //                         }}
    //                         type="button"
    //                     >
    //                         Copy
    //                     </button>
    //                 </div>
    //             )}
    //             <input type="submit" value="Create!" />
    //         </form>
    //     </div>
    // );
}
