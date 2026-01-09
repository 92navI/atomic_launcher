import './index.css';
import atomic from '../../assets/icons/splash/atomic.png';
import icon from '../../assets/icons/splash/icon.jpg';
import { useEffect, useRef } from 'react';
import { Terminal, TerminalHandle } from './components/Terminal';
import RestartPrompt from './components/RestartPrompt';
import UpdateDownloadProgress from './components/UpdateDownloadProgress';

export default function App() {
  const terminalRef = useRef<TerminalHandle>(null);

  useEffect(() => {
    const onMessage = (_event: unknown, msg: string) => {
      terminalRef.current?.pushLine(msg);
    };

    const onPromptRestart = () => {
      terminalRef.current?.pushLine(<RestartPrompt />);
    };

    const onStartDownload = () => {
      terminalRef.current?.pushLine(<UpdateDownloadProgress />);
    };

    const onError = (_event: unknown, msg: string) => {
      terminalRef.current?.pushLine(
        <span style={{ color: 'red' }}>{msg}</span>
      );
    };

    window.ipcRenderer.on('splash-message', onMessage);
    window.ipcRenderer.on('splash-prompt-restart', onPromptRestart);
    window.ipcRenderer.on('splash-start-download', onStartDownload);
    window.ipcRenderer.on('splash-error', onError);

    // Cleanup to prevent leaks
    return () => {
      window.ipcRenderer.off('splash-message', onMessage);
      window.ipcRenderer.off('splash-prompt-restart', onPromptRestart);
      window.ipcRenderer.off('splash-start-download', onStartDownload);
      window.ipcRenderer.off('splash-error', onError);
    };
  }, []);

  return (
    <div className="splash-wrapper">
      <img src={icon} className="logo" />
      <img src={atomic} className="text" />
      <Terminal ref={terminalRef} />
    </div>
  );
}
