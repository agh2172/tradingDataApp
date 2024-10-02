import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial';

Chart.register(...registerables);
Chart.register(CandlestickController, CandlestickElement);

const CandlestickChart = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  // Initialize the chart
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'SOL/USDT Candlestick',
            data: [],
            barThickness: 'flex',
            backgroundColor: 'rgba(0, 255, 0, 0.5)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            title: {
              color: 'white',
              display: true,
              text: 'Time',
            },
            border: {
              color: 'white',
            },
          },
          y: {
            title: {
              color: 'white',
              display: true,
              text: 'Price (USDT)',
            },
            border: {
              color: 'white',
            },
            grid: {
              color: 'black',
            },
          },
        },
      },
    });

    //Cleanup the chart when the component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, []); //Empty dependency array ensures this runs only once on mount

  // Update the chart data when `data` prop changes
  useEffect(() => {
    if (data.length === 0) {
      console.log('No data available for the chart.');
      return;
    }

    // Format the data
    const formattedData = data.map((candle) => ({
      x: new Date(candle.time),
      o: parseFloat(candle.open),
      h: parseFloat(candle.high),
      l: parseFloat(candle.low),
      c: parseFloat(candle.close),
    }));

    // Update chart data and scales
    if (chartInstanceRef.current) {
      chartInstanceRef.current.data.datasets[0].data = formattedData;

      // Update Y-axis scale
      chartInstanceRef.current.options.scales.y.min = Math.min(
        ...formattedData.map((c) => c.l)
      );
      chartInstanceRef.current.options.scales.y.max = Math.max(
        ...formattedData.map((c) => c.h)
      );

      // Update X-axis scale with padding
      const minX = new Date(Math.min(...formattedData.map((c) => c.x)));
      const maxX = new Date(Math.max(...formattedData.map((c) => c.x)));

      // Calculate time range and padding
      const timeRange = maxX.getTime() - minX.getTime();
      const padding = timeRange * 0.01; // 1% padding

      const expandedMinX = new Date(minX.getTime() - padding);
      const expandedMaxX = new Date(maxX.getTime() + padding);

      chartInstanceRef.current.options.scales.x.min = expandedMinX;
      chartInstanceRef.current.options.scales.x.max = expandedMaxX;

      // Update the chart
      chartInstanceRef.current.update();
    }
  }, [data]); // This effect runs whenever `data` changes

  return (
    <div style={{ height: '400px', width: '95%' }}>
      <canvas
        ref={chartRef}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
};

export default CandlestickChart;
