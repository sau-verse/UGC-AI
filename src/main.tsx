import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Add a simple test to see if the app is mounting
console.log('App is starting...');

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log('Root element found');
  createRoot(rootElement).render(
    <App />
  );
} else {
  console.error('Root element not found');
}