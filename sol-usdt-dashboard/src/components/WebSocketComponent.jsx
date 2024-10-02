// WebSocketComponent.js
import React, { useState } from 'react';
import CandlestickChart from './CandlestickChart';
import OrderBook from './OrderBook';
import useWebSocket from './useWebSocket';
import './WebSocketComponent.css';

const WebSocketComponent = () => {
  const [interval, setIntervalState] = useState('15m'); // Default interval
  const { candlestickData, bids, asks, sendIntervalUpdate } = useWebSocket(
    'ws://localhost:8080/ws/crypto',
    interval
  );

  // Handle interval change
  const handleIntervalChange = (newInterval) => {
    setIntervalState(newInterval);
    sendIntervalUpdate(newInterval);
  };

  //Array of intervals for buttons
  const intervals = ['1m', '5m', '15m', '30m', '1h', '1d', '1w', '1M'];

  return (
    <div>
      <div>
        <h4>Current Interval: {interval}</h4>
      </div>
      <CandlestickChart data={candlestickData} />
      <div className="buttons-container">
        {intervals.map((intvl) => (
          <button key={intvl} onClick={() => handleIntervalChange(intvl)}>
            {intvl}
          </button>
        ))}
      </div>
      <OrderBook bids={bids} asks={asks} />
    </div>
  );
};

export default WebSocketComponent;
