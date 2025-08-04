import InstallButton from '../components/main-buttons/InstallButton';
import PlayButton from '../components/main-buttons/PlayButton';
// import UpdateButton from '../components/main-buttons/UpdateButton';
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
        {/* <UpdateButton /> */}
        Latest Patch: {version}
      </div>
    </div>
  );
}
