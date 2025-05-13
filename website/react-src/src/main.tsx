import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import { useEffect } from 'react'
import './styles/index.css'
import App from './app'
import { BASE_URL } from './config/config'

try {
  const fetchRefresh = async () => {
    const r = await fetch(BASE_URL + "/account/refresh",
      {
        method: "POST",
        headers: {
          'ngrok-skip-browser-warning': 'true'  // ngrok specific header to bypass warning page
        },
        credentials: 'include'
      })
    const data = await r.json();
    if ("access_token" in data) {
      localStorage.setItem('authToken', data["access_token"]);
    }
  }
  fetchRefresh()
} catch (err) {
  console.error(err)
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
