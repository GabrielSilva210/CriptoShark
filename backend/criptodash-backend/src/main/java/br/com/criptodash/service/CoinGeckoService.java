package br.com.criptodash.service;

import br.com.criptodash.dto.CoinDTO;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class CoinGeckoService {

    private final RestClient restClient;

    public CoinGeckoService(RestClient coinGeckoRestClient) {
        this.restClient = coinGeckoRestClient;
    }

    public List<CoinDTO> getCoins(String currency) {

        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/coins/markets")
                        .queryParam("vs_currency", currency)
                        .queryParam("order", "market_cap_desc")
                        .queryParam("per_page", 100)
                        .queryParam("page", 1)
                        .queryParam("sparkline", false)
                        .queryParam("price_change_percentage", "24h")
                        .build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<CoinDTO>>() {});
    }
}