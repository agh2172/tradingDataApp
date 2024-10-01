import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

Chart.register(...registerables);
Chart.register(CandlestickController, CandlestickElement);

const CandlestickChart = ({ data }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        if (data.length === 0) {
            console.log("No data available for the chart.");
            return;
        }

        const ctx = chartRef.current.getContext("2d");

        // Destroy the previous chart instance if it exists
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Properly format the data for Chart.js
        const formattedData = data.map(candle => ({
            x: new Date(candle.time), // Ensure the time is a Date object
            o: parseFloat(candle.open),
            h: parseFloat(candle.high),
            l: parseFloat(candle.low),
            c: parseFloat(candle.close)
        }));

        console.log("Formatted data for chart:", formattedData);

        chartInstanceRef.current = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'SOL/USDT',
                    data: formattedData,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        title: {
                            display: true,
                            text: 'Time',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (USDT)',
                        },
                    },
                },
            },
        });

        // Cleanup the chart when component unmounts or data changes
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data]); // Ensure this effect runs when data changes


    return (
        <div style={{ height: '400px', width: '95%' }}>
            <canvas ref={chartRef} style={{ height: '100%', width: '100%' }} />
        </div>
    );
};

export default CandlestickChart;
