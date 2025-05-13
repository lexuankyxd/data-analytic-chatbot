// File: src/App.js
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import InfoCard from './components/InfoCard';
// import { BASE_WEBSOCKET_URL } from './config/config';
import Auth from "./pages/Auth";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <Auth>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Auth>
    </Router>
  );
}
export default App;
