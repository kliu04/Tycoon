import { useParams } from "react-router-dom";

export default function Lobby() {
    const { test } = useParams();
    console.log(test);
    return <h1>Hello! {test}</h1>;
}
