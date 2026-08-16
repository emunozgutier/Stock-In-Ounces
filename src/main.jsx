import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import './store/index'; // registers all Zustand stores with the browser devtools extension
import App from './App.jsx'

createRoot(document.getElementById('root')).render(<App />)
