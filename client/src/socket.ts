import { io } from "socket.io-client";

const URL: string = "http://localhost:4000";

export const socket = io(URL);
