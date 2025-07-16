import { Link } from 'react-router-dom';
import { SidebarItemProps } from './Sidebar.types';

export default function SidebarItem({
  icon,
  iconSrc,
  label,
  to,
}: SidebarItemProps) {
  return (
    <Link to={to} className="sidebar-item">
      <div className="sidebar-icon">
        {iconSrc ? (
          <img src={iconSrc} alt={label} className="sidebar-image" />
        ) : (
          icon
        )}
      </div>
      <div className="sidebar-text">{label}</div>
    </Link>
  );
}
