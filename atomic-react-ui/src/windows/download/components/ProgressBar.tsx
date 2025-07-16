import { useEffect, useState } from 'react';
import './ProgressBar.css';

export default function ProgressBar() {
  const [percent, setPercent] = useState('0');
  const [stage, setStage] = useState('Starting Download');
  const [file, setFile] = useState('/');
  useEffect(() => {
    window.ipcRenderer.on('download-progress', (_event, data) => {
      const percent = ((data.done / data.total) * 100).toFixed(1) + '%';

      setPercent(percent);
      setStage(data.stage);
      setFile(data.filename);
    });
  }, []);
  return (
    <>
      <p className="download-stage">{stage}</p>
      <div className="filename">File: {file}</div>

      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${percent}` }}>
          <div className="percent">{percent}</div>
        </div>
      </div>
    </>
  );
}
