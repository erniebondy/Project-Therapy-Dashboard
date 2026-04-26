import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Outlet } from "react-router";
import App from "../components/App";

const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <App>
            <Outlet />
        </App>
    </StrictMode>
);