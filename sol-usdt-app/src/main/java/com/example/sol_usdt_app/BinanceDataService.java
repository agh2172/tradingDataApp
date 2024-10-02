package com.example.sol_usdt_app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.util.ArrayList;
import java.util.List;

//Data service for binance
public class BinanceDataService {

    private com.example.sol_usdt_app.BinanceWebSocketClient depthClient;
    private com.example.sol_usdt_app.BinanceWebSocketClient candlestickClient;
    private String currentInterval = "15m"; //default interval

    public BinanceDataService() {
    }

    // Fetch historical candlestick data using Binance REST API
    public List<List<Object>> fetchHistoricalCandlestickData(String symbol, String interval) throws IOException, InterruptedException {
        String baseUrl = "https://api.binance.com";
        String endpoint = "/api/v3/klines";
        String url = String.format("%s%s?symbol=%s&interval=%s&limit=100", baseUrl, endpoint, symbol, interval);
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();

        ObjectMapper mapper = new ObjectMapper();
        JsonNode rootNode = mapper.readTree(responseBody);

        List<List<Object>> historicalData = new ArrayList<>();

        //Format into JSON as expected by front end
        for (JsonNode kline : rootNode) {
            List<Object> candle = new ArrayList<>();
            candle.add(kline.get(0).asLong());   // Open time
            candle.add(kline.get(1).asText());   // Open price
            candle.add(kline.get(2).asText());   // High price
            candle.add(kline.get(3).asText());   // Low price
            candle.add(kline.get(4).asText());   // Close price
            historicalData.add(candle);
        }

        return historicalData;
    }

    // Connect to Binance WebSocket streams for depth and candlestick data
    public void connectToBinance(CryptoWebSocketHandler handler) throws URISyntaxException {
        // For depth (order book) data
        String depthStreamUrl = "wss://stream.binance.com:9443/ws/solusdt@depth";
        depthClient = new BinanceWebSocketClient(depthStreamUrl, handler, "depth");
        depthClient.connect();

        // For candlestick data
        String candlestickStreamUrl = String.format("wss://stream.binance.com:9443/ws/solusdt@kline_%s", currentInterval);
        candlestickClient = new BinanceWebSocketClient(candlestickStreamUrl, handler, "candlestick");
        candlestickClient.connect();
    }

    // Fetch and send the latest candlestick data to the front end
    public void fetchAndSendCandlestickData(CryptoWebSocketHandler handler) throws IOException, InterruptedException {
        // Fetch the latest candlestick data
        List<List<Object>> historicalData = fetchHistoricalCandlestickData("SOLUSDT", currentInterval);

        // Format the historical data to be sent as a message
        String formattedHistoricalData = handler.formatHistoricalData(historicalData);

        // Send the formatted data to the client
        handler.sendMessageToClient(formattedHistoricalData, "candlestick");
    }

    // Close the WebSocket connections
    public void closeConnection() {
        if (depthClient != null && depthClient.isOpen()) {
            depthClient.close();
        }
        if (candlestickClient != null && candlestickClient.isOpen()) {
            candlestickClient.close();
        }
    }

    // Update the interval for candlestick data and reconnect to the candlestick stream
    public void updateInterval(String newInterval, CryptoWebSocketHandler handler) throws URISyntaxException {
        this.currentInterval = newInterval;

        // Close the existing candlestick client if it's connected
        if (candlestickClient != null && candlestickClient.isOpen()) {
            candlestickClient.close();
        }

        // Reconnect to the new candlestick stream with the updated interval
        String candlestickStreamUrl = String.format("wss://stream.binance.com:9443/ws/solusdt@kline_%s", currentInterval);
        candlestickClient = new BinanceWebSocketClient(candlestickStreamUrl, handler, "candlestick");
        candlestickClient.connect();
    }
}
