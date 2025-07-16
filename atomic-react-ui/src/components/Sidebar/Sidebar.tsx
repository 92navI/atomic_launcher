import './Sidebar.css';
import { FaCompass, FaCog, FaBook } from 'react-icons/fa';
import imperial from '../../assets/icon.jpg';
import SidebarItem from './SidebarItem';

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-section">
          {[...Array(5)].map((_, i) => (
            <SidebarItem
              to={`/profile${i + 1}`}
              key={i}
              iconSrc={imperial}
              label={`Profile ${i + 1}`}
            />
          ))}
          <SidebarDivider />
          <SidebarItem to="/library" icon={<FaBook />} label="My Library" />
        </div>
      </div>

      <div className="sidebar-bottom">
        <SidebarItem to="/explore" icon={<FaCompass />} label="Explore" />
        <SidebarItem to="/settings" icon={<FaCog />} label="Settings" />
      </div>
    </div>
  );
}

function SidebarDivider() {
  return <div className="sidebar-divider" />;
}
