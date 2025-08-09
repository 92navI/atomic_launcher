import { useState } from 'react';
import PlayButton from '../components/main-buttons/PlayButton';
import Topbar from '../components/Topbar/Topbar';
import styles from './Play.module.css';

export default function Play() {
  const [version, setVersion] = useState('unknown');

  window.ipcRenderer.on('set-profile-ver', (_event, ver) => setVersion(ver));

  return (
    <div className={styles.main}>
      <Topbar />
      <div className={styles.content}>
        <div className={styles.seasonLabel}>Imperial SMP</div>
      </div>
      <div className={styles.footer}>
        <PlayButton />
        Latest Patch: {version}
      </div>
    </div>
  );
}
