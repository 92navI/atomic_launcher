import styles from './MainButton.module.css';

export default function InstallButton() {
  const sendPlay = () => {
    window.ipcRenderer.invoke('play');
  };
  return (
    <button className={styles.button} onClick={sendPlay}>
      Play
    </button>
  );
}
