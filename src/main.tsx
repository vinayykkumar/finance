import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global error handler to send errors to the server
window.onerror = function (message, source, lineno, colno, error) {
    fetch('http://localhost:3000/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, source, lineno, colno, error }),
    });
};

window.addEventListener('unhandledrejection', function (event) {
    fetch('http://localhost:3000/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: event.reason }),
    });
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
