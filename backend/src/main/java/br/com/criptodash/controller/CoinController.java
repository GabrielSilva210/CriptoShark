package br.com.criptodash.controller;

import br.com.criptodash.dto.CoinDTO;
import br.com.criptodash.service.CoinGeckoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coins")
@CrossOrigin(origins = "http://localhost:5173")
public class CoinController {

    private final CoinGeckoService coinGeckoService;

    public CoinController(CoinGeckoService coinGeckoService) {
        this.coinGeckoService = coinGeckoService;
    }

    @GetMapping
    public List<CoinDTO> getCoins(
            @RequestParam(defaultValue = "brl") String currency) {

        return coinGeckoService.getCoins(currency);
    }
}