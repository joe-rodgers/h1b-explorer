import { useState } from 'react';

export default function ExperimentalContainer() {
  const [count, setCount] = useState(0);
  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
      <h3>Experimental Container</h3>
      <p>Counter: {count}</p>
      <button onClick={() => setCount((c) => c + 1)}>Increment</button>
    </div>
  );
}
