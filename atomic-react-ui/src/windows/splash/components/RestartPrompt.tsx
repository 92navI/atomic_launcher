import { useEffect, useState } from 'react';
import './RestartPrompt.css';

export default function RestartPrompt() {
  const [selected, setSelected] = useState(0);

  // Derive noText from selected
  const noText = selected === 1 ? 'YES' : 'NO';
  const yesText = selected === 0 ? 'YES' : 'NO';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setSelected((prev) => (prev === 0 ? 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      Confirm restart to install update:
      <div className="restart-buttons">
        <button
          className={`restart-button ${selected === 0 ? 'selected' : ''}`}
          onMouseEnter={() => setSelected(0)}
          onClick={() => window.ipcRenderer.send('splash-restart')}
        >
          {yesText}
        </button>
        <button
          className={`restart-button ${selected === 1 ? 'selected' : ''}`}
          onMouseEnter={() => setSelected(1)}
          onClick={() => window.ipcRenderer.send('splash-restart')}
        >
          {noText}
        </button>
      </div>
    </div>
  );
}
