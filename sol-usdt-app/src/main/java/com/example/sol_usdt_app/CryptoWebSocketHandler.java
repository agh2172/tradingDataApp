package com.example.sol_usdt_app;

import com.example.sol_usdt_app.BinanceDataService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

public class CryptoWebSocketHandler extends TextWebSocketHandler {

    private BinanceDataService binanceDataService = new BinanceDataService();
    private WebSocketSession session;

    @Getter
    @Setter
    private String currentInterval = "15m"; // Default interval

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        this.session = session;
        System.out.println("WebSocket connection established with client!");

        // Fetch historical data on default interval (15-minutes)
        List<List<Object>> historicalData = binanceDataService.fetchHistoricalCandlestickData("SOLUSDT", currentInterval);

        // Format the historical data to be sent as a message
        String formattedHistoricalData = formatHistoricalData(historicalData);

        // Send historical candlestick data to the client
        session.sendMessage(new TextMessage(formattedHistoricalData));

        // Connect to the Binance WebSocket for real-time data
        binanceDataService.connectToBinance(this);
    }

    // Helper method to format historical candlestick data
    public String formatHistoricalData(List<List<Object>> historicalData) {
        StringBuilder sb = new StringBuilder();
        sb.append("{\"type\":\"historical\",\"data\":[");

        for (List<Object> candle : historicalData) {
            sb.append("{\"time\":").append(candle.get(0)) // Open time
                    .append(",\"open\":").append(candle.get(1)) // Open price
                    .append(",\"high\":").append(candle.get(2)) // High price
                    .append(",\"low\":").append(candle.get(3))  // Low price
                    .append(",\"close\":").append(candle.get(4)) // Close price
                    .append("},");
        }

        sb.setLength(sb.length() - 1); // Remove trailing comma
        sb.append("]}");
        return sb.toString();
    }

    // Send messages to the front end
    public void sendMessageToClient(String message, String streamType) throws IOException {
        if (session != null && session.isOpen()) {
            String formattedMessage = String.format("{\"type\": \"%s\", \"data\": %s}", streamType, message);
            session.sendMessage(new TextMessage(formattedMessage));
        }
    }

    // Helper method to format and send real-time order book data
    public synchronized void sendOrderBookDataToClient(String message) throws IOException {
        if (session != null && session.isOpen()) {
            String formattedMessage = String.format("{\"type\": \"orderBook\", \"data\": %s}", message);
            session.sendMessage(new TextMessage(formattedMessage));
        }
    }

    // Helper method to send real-time candlestick data
    public synchronized void sendCandlestickDataToClient(String message) throws IOException {
        if (session != null && session.isOpen()) {
            String formattedMessage = String.format("{\"type\": \"candlestick\", \"data\": %s}", message);
            session.sendMessage(new TextMessage(formattedMessage));
        }
    }

    // Method that handles interval updates from the front end
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("Received message from client: " + message.getPayload());
        // Handle the message to change the interval
        if (message.getPayload().startsWith("{\"type\":\"setInterval\"")) {
            // Parse the JSON message to get the new interval
            String newInterval = parseNewInterval(message.getPayload());
            setCurrentInterval(newInterval); // Update the current interval

            try {
                // Update the interval in BinanceDataService and reconnect
                binanceDataService.updateInterval(newInterval, this); // Reconnect with new interval
            } catch (URISyntaxException e) {
                e.printStackTrace();
            }

            // Fetch the latest candlestick data based on the new interval
            try {
                binanceDataService.fetchAndSendCandlestickData(this); // Send updated data to the client
            } catch (IOException | InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    // Helper method to parse interval update message
    private String parseNewInterval(String jsonMessage) {
        // Use a JSON library (like Jackson) to parse the JSON message
        ObjectMapper objectMapper = new ObjectMapper();
        try {
            JsonNode jsonNode = objectMapper.readTree(jsonMessage);
            return jsonNode.get("interval").asText();
        } catch (JsonProcessingException e) {
            System.err.println("Failed to parse JSON: " + e.getMessage());
            return currentInterval; // Return current interval if parsing fails
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        System.out.println("WebSocket connection closed with client.");
        binanceDataService.closeConnection();
    }
}
