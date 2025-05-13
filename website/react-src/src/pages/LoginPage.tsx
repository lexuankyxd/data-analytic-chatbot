import { useState } from 'react';
import { BASE_URL } from '../config/config';
import { MouseEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  try {
    const validateToken = async () => {
      const r = await fetch(BASE_URL + "/account/validate",
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'  // ngrok specific header to bypass warning page
          },
          body: JSON.stringify({ access_token: localStorage.getItem("authToken") })
        })
      const data = await r.json();
      if ("message" in data && data.message == "Token valid") {
        navigate("/")
      }
    }
    if (localStorage.getItem("authToken"))
      validateToken()
  } catch (err) {
    console.error(err)
  }

  const handleLogin = async (e: MouseEvent<HTMLButtonElement> | null = null) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter both email and password');
    } else if (password.length < 8) {
      setLoginError("Password length is not valid")
    } else {
      const response = await fetch(BASE_URL + "/account/login", {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if ("access_token" in data) {
        localStorage.setItem('authToken', data["access_token"]);
        localStorage.setItem('email', email)
        navigate("/")

        const intervalId = setInterval(async () => {
          const response = await fetch(BASE_URL + "/account/refresh", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          const data = await response.json();
          if ("access_token" in data) {
            localStorage.setItem('authToken', data["access_token"]);
            setLoginError('');
          } else {
            navigate("/")
          }

        }, 1000 * 60 * 14);
        localStorage.setItem("rIntervalId", "" + intervalId);
        setLoginError('');
      } else {
        setLoginError(data["message"])
      }
    }
  };

  // Handle Enter key in chat input
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-2xl">
        {loginError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {loginError}
          </div>
        )}

        <div
          className="space-y-6"
          onKeyDown={handleKeyPress}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              onClick={handleLogin}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
