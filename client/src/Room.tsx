import { useParams } from "react-router-dom";
import { socket } from "./socket";
import { useCallback, useEffect, useState } from "react";
import { RoomData } from "@backend/Events";
import Card from "@backend/Card";

export default function Room() {
  const { key } = useParams();
  const [data, setData] = useState<RoomData>();
  const [start, setStart] = useState(false);
  const [cardNames, setCardNames] = useState<Card[]>([]);
  const [selCards, setSelCards] = useState<Card[]>([]);
  // synced with server
  const [clientTurn, setClientTurn] = useState(false);
  const [playArea, setPlayArea] = useState<Card[]>([]);

  const handleCardClick = useCallback(
    (cardName: string) => {
      if (selCards.includes(cardName)) {
        setSelCards(selCards.filter((cName) => cName !== cardName));
      } else {
        setSelCards([...selCards, cardName]);
      }
    },
    [selCards]
  );

  const renderCards = useCallback(() => {
    return (
      <div>
        {cardNames.map((cardName) => (
          <img
            key={cardName}
            src={require(`./images/cards/${cardName}.svg`)}
            alt={cardName}
            className={selCards.includes(cardName) ? "card selected" : "card"}
            onClick={() => handleCardClick(cardName)}
          />
        ))}
      </div>
    );
  }, [cardNames, selCards, handleCardClick]);

  const renderPlayArea = useCallback(() => {
    return (
      <div>
        {playArea.map((cardName) => (
          <img
            key={cardName}
            src={require(`./images/cards/${cardName}.svg`)}
            alt={cardName}
            className={"card"}
          />
        ))}
      </div>
    );
  }, [playArea]);

  // add a class to the image that makes it darker

  function playSelected() {
    if (!clientTurn) {
      return;
    }

    socket.emit("game:playSelected", selCards, (response) => {
      if (response) {
        setCardNames(
          cardNames.filter((cardName) => {
            return !selCards.includes(cardName);
          })
        );
        setSelCards([]);
        setClientTurn(false);
      } else {
        // illegal cards played
        alert("You selected unplayable cards!");
      }
    });
  }

  function passTurn() {
    if (!clientTurn) {
      return;
    }

    socket.emit("game:passTurn");
    setClientTurn(false);
  }

  useEffect(() => {
    socket.on("room:joined", (roomData: RoomData) => {
      setData(roomData);
    });

    socket.on("game:hasStarted", () => {
      setStart(true);
    });

    socket.on("game:setPlayerCards", (cardNames: string[]) => {
      setCardNames(cardNames);
      renderCards();
    });

    socket.on("game:setClientTurn", () => {
      setClientTurn(true);
    });

    socket.on("game:updatePlayArea", (cardNames: string[]) => {
      setPlayArea(cardNames);
      renderPlayArea();
    });
  }, [renderCards, renderPlayArea]);

  if (!start) {
    return (
      <div>
        <h1>
          The room key is {key} with name {data && data.name}. There are{" "}
          {data && data.numPlayers} players in the room:
        </h1>
        <ul>{data && data.playerNames.map((name) => <li>{name}</li>)}</ul>
        <button
          type="button"
          disabled={data?.numPlayers !== 4}
          onClick={() => {
            setStart(true);
            socket.emit("game:start");
          }}
        >
          Start Game!
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Game has started!</h1>
        {clientTurn && <h1>It is currently your turn.</h1>}
        {renderPlayArea()}
        <br></br>
        <hr />
        {renderCards()}
        <button
          type="button"
          disabled={!clientTurn || selCards.length === 0}
          onClick={() => playSelected()}
        >
          Play!
        </button>
        <button type="button" disabled={!clientTurn} onClick={() => passTurn()}>
          Pass!
        </button>
      </div>
    );
  }
}
