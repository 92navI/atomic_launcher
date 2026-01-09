import { useState } from 'react';
import './MainButton.css';

export default function InstallButton() {
  const [version, setVersion] = useState('imp_qop-1.0.1');

  window.ipcRenderer.on('set-profile-ver', (_event, ver) => setVersion(ver));

  const sendPlay = () => {
    window.ipcRenderer.send('play');
  };
  return (
    <button className="button" onClick={sendPlay}>
      <div className="seasonLabel">Imperial</div>
      <div className="version">{version}</div>
    </button>
  );
}
