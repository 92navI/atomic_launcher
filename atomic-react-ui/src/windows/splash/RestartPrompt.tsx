import { useEffect, useState } from 'react';
import './RestartPrompt.css';
import { Visibility } from './RestartPrompt.types';

export default function RestartPrompt({
  visibility,
}: {
  visibility: Visibility;
}) {
  const [selected, setSelected] = useState(0);
  const [noText, setNoText] = useState('NO');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setSelected((prev) => (prev === 0 ? 1 : 0));
        if (selected == 1) setNoText('YES');
        else setNoText('NO');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="restart-container" style={{ visibility }}>
      <div className="restart-buttons">
        <button
          key="0"
          className={`restart-button ${selected === 0 ? 'selected' : ''}`}
          onMouseEnter={() => setSelected(0)}
          onClick={() => window.ipcRenderer.send('splash-restart')}
        >
          YES
        </button>
        <button
          key="1"
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
