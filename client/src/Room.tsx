import { useParams } from "react-router-dom";

export default function Lobby() {
    const { test } = useParams();
    return <h1>Hello!</h1>;
}
