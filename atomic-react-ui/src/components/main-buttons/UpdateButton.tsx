import styles from './MainButton.module.css';

export default function InstallButton() {
  const sendUpdate = () => {
    window.ipcRenderer.send('update');
  };
  return (
    <button className={styles.button} onClick={sendUpdate}>
      Update
    </button>
  );
}
