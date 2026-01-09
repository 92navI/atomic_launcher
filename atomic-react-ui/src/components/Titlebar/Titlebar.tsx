import { useState } from 'react';
import './Titlebar.css';
import menu from '../../assets/icons/menu-button.png';

export default function Topbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="topbar">
      <div
        className="menu-wrapper"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="label" onClick={() => setOpen(!open)}>
          <img src={menu} alt="" className="icon" />
          Atomic ▾
        </div>

        {open && (
          <div className="dropdown">
            <div className="dropdown-item">Settings</div>
            <div className="dropdown-item">Check for updates</div>
            <div className="dropdown-item">About</div>
            <div className="dropdown-separator" />
            <div className="dropdown-item danger">Exit</div>
          </div>
        )}
      </div>
    </div>
  );
}
