import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Menu from "./Menu";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Lobby from "./Lobby";
import Create from "./Create";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Menu />} />
                {/* <App /> */}
                <Route path="/lobby" element={<Lobby />}></Route>
                <Route path="/create" element={<Create />}></Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

// root.render(<Menu />);
