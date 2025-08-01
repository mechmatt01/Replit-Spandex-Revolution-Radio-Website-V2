import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./no-focus-rings.css";

createRoot(document.getElementById("root")!).render(<App />);
