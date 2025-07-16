import { TopbarLinkProps } from './Topbar.types';
import styles from './Topbar.module.css';

export default function TopbarLink({ title }: TopbarLinkProps) {
  return <div className={styles.topbar_link}>{title}</div>;
}
