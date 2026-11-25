package br.com.criptodash.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class CoinGeckoConfig {

    @Value("${coingecko.base-url}")
    private String baseUrl;

    @Value("${coingecko.api-key:}")
    private String apiKey;

    @Bean
    public RestClient coinGeckoRestClient() {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl(baseUrl);

        if (apiKey != null && !apiKey.isBlank()) {
            builder.defaultHeader("x-cg-demo-api-key", apiKey);
        }

        return builder.build();
    }
}