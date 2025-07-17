import { createRoot } from "react-dom/client";
import "./index.css";

function TestApp() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">Test App</h1>
      <p className="text-lg">If you can see this, React is working!</p>
      <div className="mt-4 p-4 bg-card rounded">
        <h2 className="text-xl font-semibold">Theme Test</h2>
        <p className="text-muted-foreground">This should be styled correctly</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TestApp />);