import TopbarLink from './TopbarLink';
import styles from './Topbar.module.css';

export default function Topbar() {
  return (
    <div className={styles.topbar}>
      <TopbarLink title="Play" page="play" />
      <TopbarLink title="FAQ" page="play" />
      <TopbarLink title="Version" page="play" />
    </div>
  );
}
