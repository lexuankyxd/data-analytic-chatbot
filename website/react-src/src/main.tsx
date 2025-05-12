import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { useEffect } from 'react'
import './styles/index.css'
import App from './app'

try {
  const fetchRefresh = async () => {
    const r = await fetch("http://localhost:3000/account/refresh",
      {
        method: "POST",
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
