import styles from './Sidebar.module.css';

export default function SidebarUser({ name }: { name: string }) {
  const pfpLink = `https://minotar.net/helm/${name}/32`;
  return (
    <div className={styles.user_section}>
      <img src={pfpLink} alt="head" />
      <div>
        <strong>{name}</strong>
        <br />
        <small>Atomic account</small>
      </div>
    </div>
  );
}
