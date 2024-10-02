package com.example.sol_usdt_app;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

public class BinanceWebSocketClient extends WebSocketClient {

    private final com.example.sol_usdt_app.CryptoWebSocketHandler handler;
    private final String streamType; // 'depth' or 'candlestick' to distinguish the streams

    public BinanceWebSocketClient(String url, com.example.sol_usdt_app.CryptoWebSocketHandler handler, String streamType) throws URISyntaxException {
        super(new URI(url));
        this.handler = handler;
        this.streamType = streamType;
    }

    @Override
    public void onOpen(ServerHandshake handshake) {
        System.out.println("Connected to Binance WebSocket for " + streamType + " data");
    }

    // Recieves data from binance and passes to the front end web socket handler
    @Override
    public void onMessage(String message) {
        //System.out.println("Received message from Binance (" + streamType + "): " + message);

        try {
            // Forward the message to the appropriate method in CryptoWebSocketHandler
            if ("depth".equals(streamType)) {
                handler.sendOrderBookDataToClient(message);
            } else if ("candlestick".equals(streamType)) {
                handler.sendCandlestickDataToClient(message);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("Connection closed: " + reason);
    }

    @Override
    public void onError(Exception ex) {
        ex.printStackTrace();
    }
}