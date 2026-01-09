// import { useState } from 'react';
import PlayButton from '../components/main-buttons/PlayButton';
// import Topbar from '../components/Topbar/Topbar';
import './Play.css';
import bg from '../assets/images/main_image.jpg';

export default function Play() {
  return (
    <>
      <div className="list">
        {/* <Topbar /> */}
        <div className="frosted-box">
          <img src={bg} alt="" />
          <div className="border-overlay"></div>
          <PlayButton />
        </div>
      </div>
    </>
  );
}
