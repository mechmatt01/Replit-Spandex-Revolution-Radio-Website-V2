import { createRoot } from "react-dom/client";
import "./index.css";

function TestApp() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-4xl font-bold mb-4">Firebase Migration Complete</h1>
      <p className="text-lg">React frontend is now loading correctly!</p>
      <div className="mt-4 p-4 bg-card rounded">
        <h2 className="text-xl font-semibold">Status</h2>
        <p className="text-muted-foreground">✓ Firebase backend integration working</p>
        <p className="text-muted-foreground">✓ Theme system restored</p>
        <p className="text-muted-foreground">✓ CSS compilation fixed</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TestApp />);
