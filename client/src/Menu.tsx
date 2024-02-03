import { SyntheticEvent } from "react";
import { io } from "socket.io-client";

export default function Menu() {
  function handleSubmit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();
    const form = event.currentTarget;
    const elements = form.elements as typeof form.elements & {
      username: { value: string };
    };
    let buttonName: string = event.nativeEvent.submitter!.id;

    // socket.emit(elements.username.value);

    if (buttonName === "find") {
      console.log("find");
    } else if (buttonName === "create") {
      console.log("create");
    } else {
      new Error("Invalid Button Type");
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
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
    </div>
  );
}
