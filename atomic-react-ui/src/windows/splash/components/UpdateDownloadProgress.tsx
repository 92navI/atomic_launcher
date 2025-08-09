import { useEffect, useState } from 'react';
import './UpdateDownloadProgress.css';

export default function UpdateDownloadProgress() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const handler = (_: unknown, p: number) => {
      setPercent(p);
    };

    window.ipcRenderer.on('splash-download-progress', handler);
    return () => {
      window.ipcRenderer.off('splash-download-progress', handler);
    };
  }, []);

  return (
    <div>
      Downloading update... {percent.toFixed(1)}%
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
