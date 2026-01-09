import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import Titlebar from './components/Titlebar/Titlebar';
import './index.css';

export default function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <Titlebar />
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}
