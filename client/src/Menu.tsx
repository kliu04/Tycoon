import { SyntheticEvent } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import "./output.css";

export default function Menu() {
    const navigate = useNavigate();

    function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
        event.preventDefault();
        const form = event.currentTarget;
        const elements = form.elements as typeof form.elements & {
            username: { value: string };
        };
        socket.emit("player:setUsername", elements.username.value);

        let buttonName: string = event.nativeEvent.submitter!.id;
        if (buttonName === "find") {
            navigate("/lobby");
        } else if (buttonName === "create") {
            navigate("/create");
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-teal-100">
            <div className="w-96 rounded-lg bg-white p-6 shadow-md border-blue-200 border-4">
                <h1 className="mb-4 text-center text-4xl font-bold">Tycoon</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-lg font-medium"
                        >
                            Username:
                        </label>
                        <input
                            type="text"
                            id="username"
                            required
                            className="mt-1 w-full rounded-md border border-gray-300 p-2 text-gray-900 shadow-sm focus:border-teal-600 focus:outline-none focus:ring-teal-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <button
                            type="submit"
                            id="create"
                            className="w-full rounded-md bg-purple-300 px-4 py-2 hover:bg-teal-600"
                        >
                            Create a Game
                        </button>
                        <button
                            type="submit"
                            id="find"
                            className="w-full rounded-md bg-purple-300 px-4 py-2 hover:bg-teal-600"
                        >
                            Join a Game
                        </button>
                        <button
                            type="button"
                            className="w-full rounded-md bg-purple-300 px-4 py-2 hover:bg-teal-600"
                        >
                            How to Play
                        </button>
                    </div>
                </form>
                <div className="mt-6 flex justify-center">
                    <a
                        href="https://github.com/kliu04/Tycoon"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img
                            src={require("./images/github-mark.png")}
                            alt="GitHub Logo"
                            className="h-8 w-8"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
}
