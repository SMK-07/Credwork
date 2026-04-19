import React from 'react'
import ReactDOM from 'react-content'
// Wait, react base vite template is standard. I'll just write main.jsx
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
