package br.com.criptodash.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.net.URI;

@RestController
@RequestMapping("/api/cg")
public class CoinGeckoProxyController {

    private final RestClient restClient;
    private final String baseUrl;

    public CoinGeckoProxyController(RestClient coinGeckoRestClient,
                                    @Value("${coingecko.base-url}") String baseUrl) {
        this.restClient = coinGeckoRestClient;
        this.baseUrl = baseUrl;
    }

    @GetMapping("/**")
    public ResponseEntity<String> proxy(HttpServletRequest request) {
        String path = request.getRequestURI().substring("/api/cg".length());

        boolean permitido = path.startsWith("/coins")
                || path.equals("/search")
                || path.equals("/global");
        if (!permitido) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        String query = request.getQueryString();
        URI destino = URI.create(baseUrl + path + (query != null ? "?" + query : ""));

        try {
            String body = restClient.get().uri(destino).retrieve().body(String.class);
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(body);
        } catch (RestClientResponseException e) {
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        }
    }
}