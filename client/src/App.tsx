import { io } from "socket.io-client";
const socket = io("http://localhost:4000");

export default function App() {
  socket.emit("Hello World!");
  return (
    <div>
      <p>Hello World!</p>
    </div>
  );
}
