import styles from './MainButton.module.css';

export default function InstallButton() {
  const sendInstall = () => {
    window.ipcRenderer.send('install');
  };
  return (
    <button className={styles.button} onClick={sendInstall}>
      Install
    </button>
  );
}
