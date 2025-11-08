import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching from backend:', error);
        setMessage('Failed to connect to backend');
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>Easy ACP - TurboRepo Monorepo</h1>
      <div className="card">
        <h2>Frontend: React + Vite</h2>
        <h3>Backend Status:</h3>
        {loading ? (
          <p>Connecting to backend...</p>
        ) : (
          <p className="message">{message}</p>
        )}
      </div>
      <p className="info">
        Edit <code>apps/web/src/App.tsx</code> or <code>apps/api/src/index.ts</code> to test hot
        reload
      </p>
    </div>
  );
}

export default App;
