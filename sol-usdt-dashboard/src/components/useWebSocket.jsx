// useWebSocket.js
import { useEffect, useRef, useState } from 'react';

const useWebSocket = (url, interval) => {
  const [candlestickData, setCandlestickData] = useState([]);
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const wsRef = useRef(null); // Reference for the WebSocket connection
  const intervalTimerRef = useRef(null); // Reference for the setInterval

  // Ref to hold the latest value of interval
  const intervalStateRef = useRef(interval);

  // Update intervalStateRef whenever interval changes
  useEffect(() => {
    intervalStateRef.current = interval;
  }, [interval]);

  // Establish WebSocket connection
  useEffect(() => {
    // Open WebSocket connection
    wsRef.current = new WebSocket(url);

    wsRef.current.onopen = () => {
      console.log('WebSocket connection established.');

      //Send initial interval request when WebSocket opens
      wsRef.current.send(
        JSON.stringify({ type: 'setInterval', interval: intervalStateRef.current })
      );
      console.log('Sent initial interval request:', intervalStateRef.current);
    };

    wsRef.current.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        // Handle candlestick data
        if (parsedData.type === 'candlestick' || parsedData.type === 'historical') {
          handleCandlestickData(parsedData.data);
        }

        // Handle order book data (depth)
        else if (parsedData.type === 'orderBook') {
          handleOrderBookData(parsedData.data);
        } else {
          console.warn('Unhandled message type:', parsedData.type);
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error observed:', error);
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    //Send 'setInterval' message every 60 seconds
    intervalTimerRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: 'setInterval', interval: intervalStateRef.current })
        );
        console.log('Sent interval update:', intervalStateRef.current);
      }
    }, 60000); // Send message every 60 seconds

    // Cleanup WebSocket and intervals when the component unmounts
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
    };
  }, [url]);

  // Function to handle candlestick data
  const handleCandlestickData = (data) => {
    if (Array.isArray(data.data)) {
      setCandlestickData(data.data);
    } else {
      console.error('Expected an array for candlestick data');
    }
  };

  // Function to handle order book data
  const handleOrderBookData = (data) => {
    const { b: newBids, a: newAsks } = data;
    setBids(newBids || []);
    setAsks(newAsks || []);
  };

  // Function to send interval updates
  const sendIntervalUpdate = (newInterval) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'setInterval', interval: newInterval }));
      console.log('Sent interval change to server:', newInterval);
    }
  };

  return {
    candlestickData,
    bids,
    asks,
    sendIntervalUpdate,
  };
};

export default useWebSocket;
