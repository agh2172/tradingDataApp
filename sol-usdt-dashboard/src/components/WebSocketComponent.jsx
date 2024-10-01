import React, { useEffect, useState, useRef } from 'react';
import CandlestickChart from './CandlestickChart';
import OrderBook from './OrderBook';
import './WebSocketComponent.css';

const WebSocketComponent = () => {
    const [candlestickData, setCandlestickData] = useState([]);
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [interval, setIntervalState] = useState('15m'); // Default interval
    const wsRef = useRef(null); // Reference for the WebSocket connection
    const intervalRef = useRef(null); // Reference for the setInterval

    useEffect(() => {
        // Open WebSocket connection
        wsRef.current = new WebSocket("ws://localhost:8080/ws/crypto");

        wsRef.current.onopen = () => {
            console.log("WebSocket connection established.");

            // Send initial interval request when WebSocket opens
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'setInterval', interval: '15m' })); // Default to '15m'
                console.log("Sent initial interval request: 15m");
            }
        };

        wsRef.current.onmessage = (event) => {
            console.log("Raw data received:", event.data);
            try {
                const parsedData = JSON.parse(event.data);
                console.log("Parsed data:", parsedData);

                // Handle candlestick data
                if (parsedData.type === "candlestick" || parsedData.type === "historical") {
                    if (Array.isArray(parsedData.data.data)) {
                        setCandlestickData(parsedData.data.data); // Trigger chart re-render with real data
                    } else {
                        console.error("Expected an array for candlestick data, but got:", parsedData.data.data);
                    }
                }

                // Handle order book data (depth)
                if (parsedData.type === "orderBook") {
                    const { b: newBids, a: newAsks } = parsedData.data;
                    setBids(newBids || []);
                    setAsks(newAsks || []);
                }
            } catch (error) {
                console.error("Failed to parse JSON:", error);
            }
        };

        wsRef.current.onerror = (error) => {
            console.error("WebSocket error observed:", error);
        };

        wsRef.current.onclose = (event) => {
            console.log("WebSocket connection closed:", event);
        };

        intervalRef.current = setInterval(() => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'setInterval', interval }));
                console.log("Sent interval update:", interval);
            }
        }, 60000); // Send message every 60 seconds

        // Cleanup WebSocket and intervals when the component unmounts
        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [interval]);

    // Handle interval change
    const handleIntervalChange = (newInterval) => {
        setIntervalState(newInterval);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'setInterval', interval: newInterval }));
        }
    };

    return (
        <div>
            <div>
                <h4>Current Interval: {interval}</h4>
            </div>
            <div>
            </div>
            <CandlestickChart data={candlestickData} />
            <div className="buttons-container">
                            <button onClick={() => handleIntervalChange('1m')}>1m</button>
                            <button onClick={() => handleIntervalChange('5m')}>5m</button>
                            <button onClick={() => handleIntervalChange('15m')}>15m</button>
                            <button onClick={() => handleIntervalChange('30m')}>30m</button>
                            <button onClick={() => handleIntervalChange('1h')}>1h</button>
                            <button onClick={() => handleIntervalChange('1d')}>1d</button>
                            <button onClick={() => handleIntervalChange('1w')}>1w</button>
                            <button onClick={() => handleIntervalChange('1M')}>1M</button>
                        </div>
            <OrderBook bids={bids} asks={asks} />
        </div>
    );
};

export default WebSocketComponent;
