import { createRoot } from "react-dom/client";
import App from "./App";
import SimpleApp from "./SimpleApp";
import "./styles.css";

// Test with simple app first
const USE_SIMPLE_APP = true;

createRoot(document.getElementById("root")!).render(
  USE_SIMPLE_APP ? <SimpleApp /> : <App />
);
