package com.example.sol_usdt_app;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new CryptoWebSocketHandler(), "/ws/crypto")
                .setAllowedOrigins("*");
    }
}
