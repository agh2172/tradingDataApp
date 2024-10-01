import React from 'react';
import './OrderBook.css'; // Import the CSS for styling the table

const OrderBook = ({ bids = [], asks = [] }) => {
    return (
        <div>
            <h2>Order Book (SOL/USDT)</h2>
            <div className="orderbook-container"> {/* Add container for scrolling */}
                <table>
                    <thead>
                        <tr>
                            <th colSpan="2">Bids</th>
                            <th colSpan="2">Asks</th>
                        </tr>
                        <tr>
                            <th>Price (USDT)</th>
                            <th>Amount (SOL)</th>
                            <th>Price (USDT)</th>
                            <th>Amount (SOL)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bids.length > 0 || asks.length > 0 ? (
                            // Show up to 30 rows, with a scrollbar if there are more
                            bids.map((bid, index) => (
                                <tr key={index}>
                                    <td>{parseFloat(bid[0]).toFixed(2)}</td>
                                    <td>{parseFloat(bid[1]).toFixed(4)}</td>
                                    <td>{asks[index] ? parseFloat(asks[index][0]).toFixed(2) : ''}</td>
                                    <td>{asks[index] ? parseFloat(asks[index][1]).toFixed(4) : ''}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4">No bids or asks available</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderBook;
