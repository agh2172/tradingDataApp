// src/App.js
import React from 'react';
import WebSocketComponent from './components/WebSocketComponent';
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary
import './styles.css';

const App = () => {
    return (
        <div className="container">
            <h1>SOL/USDT Dashboard</h1>
            <ErrorBoundary>
                <WebSocketComponent /> {/* Wrap WebSocketComponent in ErrorBoundary */}
            </ErrorBoundary>
        </div>
    );
};

export default App;
