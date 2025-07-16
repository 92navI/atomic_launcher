import InstallButton from '../components/main-buttons/InstallButton';
import PlayButton from '../components/main-buttons/PlayButton';
import Topbar from '../components/Topbar/Topbar';
import styles from './Play.module.css';

export default function Play() {
  // const version = 'imp_hotw_5-1.7';
  const version = 'dummy_version';
  return (
    <div className={styles.main}>
      <Topbar />
      <div className={styles.content} />
      <div className={styles.footer}>
        <PlayButton />
        <InstallButton />
        {/* <button className="main-button" id="install-button">
          Install
        </button>
        <button className="main-button" id="play-button">
          Play
        </button>
        <button className="main-button hidden" id="update-button">
          Update
        </button> */}
        Latest Patch: {version}
      </div>
    </div>
  );
}
