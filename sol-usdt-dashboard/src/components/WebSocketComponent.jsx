import React, { useEffect, useState, useRef } from 'react';
import CandlestickChart from './CandlestickChart';
import OrderBook from './OrderBook';

const WebSocketComponent = () => {
    const [candlestickData, setCandlestickData] = useState([]);
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [interval, setInterval] = useState('15m'); // Default interval
    const wsRef = useRef(null); // Reference for the WebSocket connection

    useEffect(() => {
        wsRef.current = new WebSocket("ws://localhost:8080/ws/crypto");

        wsRef.current.onopen = () => {
            console.log("WebSocket connection established.");
        };

        wsRef.current.onmessage = (event) => {
            console.log("Raw data received:", event.data);
            try {
                const parsedData = JSON.parse(event.data);
                console.log("Parsed data:", parsedData); // Log the parsed data

                // Handle candlestick data
                if (parsedData.type === "candlestick" || parsedData.type === "historical") {
                    if (Array.isArray(parsedData.data.data)) { // Adjust this line
                        console.log("Updating candlestick data:", parsedData.data.data); // Log the updated data
                        setCandlestickData(parsedData.data.data); // Trigger chart re-render
                    } else {
                        console.error("Expected an array for candlestick data, but got:", parsedData.data.data);
                    }
                }

                // Handle order book data (depth)
                if (parsedData.type === "orderBook") {
                    const { b: newBids, a: newAsks } = parsedData.data;
                    setBids(newBids || []); // Ensure bids are set
                    setAsks(newAsks || []); // Ensure asks are set
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

        // Cleanup on component unmount
        return () => {
            console.log("Closing WebSocket connection...");
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Define the function to handle interval changes
    const handleIntervalChange = (newInterval) => {
        setInterval(newInterval);
        // Log the new interval
        console.log("Interval changed to:", newInterval);
        
        // Send the new interval to the server
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'setInterval', interval: newInterval }));
        }
    };

    return (
        <div>
            <div>
                <button onClick={() => handleIntervalChange('1m')}>1M</button>
                <button onClick={() => handleIntervalChange('5m')}>5M</button>
                <button onClick={() => handleIntervalChange('15m')}>15M</button>
                <button onClick={() => handleIntervalChange('30m')}>30M</button>
                <button onClick={() => handleIntervalChange('1h')}>1H</button>
            </div>
            <div>
                <h4>Current Interval: {interval}</h4> {/* Optional: Displaying the current interval */}
            </div>
            <CandlestickChart data={candlestickData} />
            <OrderBook bids={bids} asks={asks} />
        </div>
    );
};

export default WebSocketComponent;
