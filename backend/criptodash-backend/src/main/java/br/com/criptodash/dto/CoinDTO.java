package br.com.criptodash.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CoinDTO(
        String id,
        String symbol,
        String name,
        String image,

        @JsonProperty("current_price")
        Double currentPrice,

        @JsonProperty("market_cap")
        Double marketCap,

        @JsonProperty("market_cap_rank")
        Integer marketCapRank,

        @JsonProperty("total_volume")
        Double totalVolume,

        @JsonProperty("price_change_percentage_24h")
        Double priceChangePercentage24h
) {}