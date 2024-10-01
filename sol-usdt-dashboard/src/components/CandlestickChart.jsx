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

        // Ensure the min and max for Y-axis are dynamically scaled
        const minY = formattedData.length === 1
            ? formattedData[0].l - 1 // Subtract 1 for better visibility
            : Math.min(...formattedData.map(c => c.l)) * 0.99;

        const maxY = formattedData.length === 1
            ? formattedData[0].h + 1 // Add 1 for better visibility
            : Math.max(...formattedData.map(c => c.h)) * 1.01;

        const minX = new Date(Math.min(...formattedData.map(c => c.x)));
        const maxX = new Date(Math.max(...formattedData.map(c => c.x)));

        // Add padding to the x-axis
        const padding = 10 * 60 * 1000; // 10 minutes in milliseconds
        const expandedMinX = new Date(minX.getTime() - padding);
        const expandedMaxX = new Date(maxX.getTime() + padding);


        console.log("Min Y:", minY, "Max Y:", maxY);

        chartInstanceRef.current = new Chart(ctx, {
            type: 'candlestick',
            data: {
                datasets: [
                    {
                        label: 'SOL/USDT Candlestick',
                        data: formattedData,
                        barThickness: 'flex', // Increase bar thickness to make single candlestick more visible
                        backgroundColor: 'rgba(0, 255, 0, 0.5)', // Optional: color for better visibility
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Disable aspect ratio maintenance
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            tooltipFormat: 'HH:mm', // Format tooltips as HH:mm
                        },
                        title: {
                            display: true,
                            text: 'Time (minutes)',
                        },
                        min: expandedMinX, // Use expanded min value
                        max: expandedMaxX, // Use expanded max value
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 12, // Show a maximum of 12 ticks to avoid crowding
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Price (USDT)',
                        },
                        min: minY,  // Set dynamic min value for the Y-axis
                        max: maxY,  // Set dynamic max value for the Y-axis
                    },
                },
                elements: {
                    candlestick: {
                        barThickness: 'flex', // Increase bar thickness to make single candlestick more visible
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