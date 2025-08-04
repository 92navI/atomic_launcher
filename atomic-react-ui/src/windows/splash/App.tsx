import './index.css';
import { useArrayState } from '../../utils/hooks';
import atomic from '../../assets/atomic.png';
import icon from '../../assets/icon.jpg';
import RestartPrompt from './RestartPrompt';
import { useState } from 'react';
import { Visibility } from './RestartPrompt.types';

export default function App() {
  const [terminal, { add, addMult }] = useArrayState([
    'Launching app.',
    'Cracking launch codes...',
    'Checking for guidance firmware updates...',
  ]);
  const [RestartPromptDisplay, setRestartPromptDisplay] =
    useState<Visibility>('hidden');

  window.ipcRenderer.on('splash-message', (_event, msg) => {
    add(msg);
  });
  window.ipcRenderer.on('splash-prompt-restart', () => {
    addMult(['Confirm restart to install update:', '', '']);
    setRestartPromptDisplay('visible');
  });
  window.ipcRenderer.on('splash-error', (_event, msg) => {
    add(`<div style="color:red">${msg}</div>`);
  });
  return (
    <div className="splash-wrapper">
      <img src={icon} className="logo" />
      <img src={atomic} className="text" />
      <div className="shade" />
      <div className="terminal">
        {terminal.map((msg, i) => (
          <div key={i}>{'> ' + msg}</div>
        ))}
        {'> '}
      </div>
      <RestartPrompt visibility={RestartPromptDisplay} />
    </div>
  );
}
