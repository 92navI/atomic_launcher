import Play from './pages/Play';
import './index.css';
import { Route, HashRouter as Router, Routes } from 'react-router-dom';
import Layout from './Layout';
import Minigames from './pages/Minigames';
import DummyPage from './pages/DummyPage';

export default function App() {
  return (
    <div className="app">
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Play />} />
            <Route path="/minigames" element={<Minigames />} />
            <Route path="/news" element={<DummyPage name="news" />} />
            <Route path="/explore" element={<DummyPage name="explore" />} />
            <Route path="/settings" element={<DummyPage name="settings" />} />
            <Route path="/library" element={<DummyPage name="library" />} />
            <Route path="/profile1" element={<DummyPage name="profile1" />} />
            <Route path="/profile2" element={<DummyPage name="profile2" />} />
            <Route path="/profile3" element={<DummyPage name="profile3" />} />
            <Route path="/profile4" element={<DummyPage name="profile4" />} />
            <Route path="/profile5" element={<DummyPage name="profile5" />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
