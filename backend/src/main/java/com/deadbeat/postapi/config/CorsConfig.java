package com.deadbeat.postapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

/**
 * Experiment 2.1.1 — CORS Configuration
 *
 * CORS (Cross-Origin Resource Sharing) is a browser security mechanism that
 * blocks requests from a different origin (protocol + domain + port) unless
 * the server explicitly permits them.
 *
 * The React frontend runs on http://localhost:5173 (Vite dev server) or
 * the Netlify domain. Without this config, every fetch() call from the frontend
 * would be blocked by the browser with a CORS error.
 *
 * Configuration applied:
 *  - Allowed origins: Vite dev server + Netlify production URL
 *  - Allowed methods: GET, POST, PUT, DELETE, OPTIONS
 *  - Allowed headers: all (*)
 *  - Exposed headers: X-Correlation-ID (so the frontend can read it from responses)
 *  - Allow credentials: true
 *  - Max age: 3600s — preflight OPTIONS responses are cached for 1 hour
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://deadbeat-post-composer.netlify.app"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("X-Correlation-ID"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
