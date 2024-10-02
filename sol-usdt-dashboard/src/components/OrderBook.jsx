import React from 'react';
import './OrderBook.css';

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
                            //Show up to 30 rows, with a scrollbar if there are more
                            bids.map((bid, index) => (
                                <tr key={index}>
                                    {/* Bids row with blue background */}
                                    <td className="bid-row">{parseFloat(bid[0]).toFixed(2)}</td>
                                    <td className="bid-row">{parseFloat(bid[1]).toFixed(4)}</td>

                                    {/* Asks row with red background */}
                                    <td className="ask-row">
                                        {asks[index] ? parseFloat(asks[index][0]).toFixed(2) : ''}
                                    </td>
                                    <td className="ask-row">
                                        {asks[index] ? parseFloat(asks[index][1]).toFixed(4) : ''}
                                    </td>
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
