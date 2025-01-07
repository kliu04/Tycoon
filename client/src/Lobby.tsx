import { SyntheticEvent, useEffect, useState } from "react";
import { socket } from "./socket";
import { useNavigate } from "react-router-dom";
import { RoomData } from "../../server/shared/Data";

export default function Lobby() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<RoomData[]>([]);

    // Fetch public rooms when the component mounts
    useEffect(() => {
        getPublicRooms();
    }, []);

    function getPublicRooms(): void {
        socket.emit("room:getPublic", (public_rooms: RoomData[]) => {
            console.log(public_rooms);
            setRooms(public_rooms);
        });
    }

    function joinPublicRoom(key: string) {
        socket.emit("room:join", key, (status: boolean) => {
            if (status) {
                navigate(`../rooms/${key}`);
            } else {
                alert("Invalid Join Code!");
            }
        });
    }

    function handlePrivate(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = event.currentTarget;
        const elements = form.elements as typeof form.elements & {
            key: { value: string };
        };
        const key = elements.key.value;

        socket.emit("room:join", key, (status: boolean) => {
            if (status) {
                navigate(`../rooms/${key}`);
            } else {
                alert("Invalid Join Code!");
            }
        });
    }

    return (
        <div className="flex flex-col items-center bg-teal-100 p-6 min-h-screen">
            <div className="w-full max-w-3xl space-y-8">
                {/* Public Rooms Section */}
                <div className="rounded-lg bg-white p-6 shadow-md border-blue-200 border-4">
                    <h2 className="mb-4 text-2xl font-bold">
                        Join a Public Game
                    </h2>
                    {rooms.length > 0 ? (
                        <table className="w-full table-auto border-collapse text-left text-gray-800">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2">Room Name</th>
                                    <th className="px-4 py-2">Players</th>
                                    <th className="px-4 py-2">Join</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map((room) => (
                                    <tr key={room.key} className="border-b">
                                        <td className="px-4 py-2">
                                            {room.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {room.players.length}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                className="rounded-md bg-green-200 px-4 py-2 text-green-900 hover:bg-green-300"
                                                onClick={() =>
                                                    joinPublicRoom(room.key)
                                                }
                                            >
                                                Join
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No public rooms available.</p>
                    )}
                    <button
                        onClick={getPublicRooms}
                        className="mt-4 rounded-md px-4 py-2 bg-blue-200  text-blue-900 hover:bg-blue-300"
                    >
                        Refresh
                    </button>
                </div>

                {/* Private Rooms Section */}
                <div className="rounded-lg bg-white p-6 shadow-md border-blue-200 border-4">
                    <h2 className="mb-4 text-2xl font-bold">
                        Join a Private Game
                    </h2>
                    <form
                        onSubmit={handlePrivate}
                        className="flex flex-col space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="key"
                                className="block text-lg font-medium"
                            >
                                Key:
                            </label>
                            <input
                                type="text"
                                id="key"
                                name="key"
                                required
                                className="mt-1 w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-teal-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full rounded-md bg-green-200 px-4 py-2 text-lg font-medium text-green-900 hover:bg-green-300"
                        >
                            Join
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
