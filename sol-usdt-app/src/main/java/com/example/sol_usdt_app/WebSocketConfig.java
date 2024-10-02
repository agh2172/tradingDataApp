package com.example.sol_usdt_app;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    //websocket for the front end to connect to
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new CryptoWebSocketHandler(), "/ws/crypto")
                .setAllowedOrigins("*"); //all origins allowed for development server
    }
}
