// File: src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import InfoCard from './components/InfoCard';
// import { BASE_WEBSOCKET_URL } from './config/config';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
function App() {
  return (<Router>
    <Routes>
      <Route path="/" element={<ChatPage />} />
      <Route path="/login" element={<LoginPage />} />

    </Routes>
  </Router>);
}
export default App;
