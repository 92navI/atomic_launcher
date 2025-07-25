import './index.css';
import { useArrayState } from '../../utils/hooks';
import atomic from '../../assets/atomic.png';
import icon from '../../assets/icon.jpg';

export default function App() {
  const [terminal, { add }] = useArrayState([
    'Launching app.',
    'Cracking launch codes...',
    'Checking for guidance firmware updates...',
  ]);

  console.log('started app');

  window.ipcRenderer.on('update-message', (_event, msg) => {
    add(msg);
  });
  window.ipcRenderer.on('update-error', (_event, _err) => {
    add('A fatal error occured while updating.');
  });
  return (
    <div className="splash-wrapper">
      <img src={icon} className="logo" />
      <img src={atomic} className="text" />
      <div className="shade" />
      <div className="terminal">
        {terminal.map((msg) => (
          <>
            {'> ' + msg}
            <br />
          </>
        ))}
        {'> '}
      </div>
    </div>
  );
}
