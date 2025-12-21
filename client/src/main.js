import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import "./unified-focus-eliminator.css";
// Import Firebase configuration to ensure it's initialized before React renders
import "./firebase";
import App from "./App";
import "./index.css";
// Register service worker for performance optimization
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
            console.log('Service Worker registered successfully:', registration);
        })
            .catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    });
}
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
