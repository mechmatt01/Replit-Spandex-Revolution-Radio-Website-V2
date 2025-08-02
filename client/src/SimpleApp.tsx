import { useState } from "react";

export default function SimpleApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Spandex Salvation Radio</h1>
      <p>The application is starting...</p>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      <div style={{ marginTop: '20px' }}>
        <p>✅ React is working</p>
        <p>✅ TypeScript is working</p>
        <p>🔄 Loading full application...</p>
      </div>
    </div>
  );
}