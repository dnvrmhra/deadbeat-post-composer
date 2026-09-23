package com.example.demo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController
public class Application {

    private final Environment environment;

    public Application(Environment environment) {
        this.environment = environment;
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @GetMapping("/api/health")
    public String healthCheck() {
        return "Spring Boot environment is running inside Docker!";
    }

    // Endpoint to inspect and verify currently active Spring Profile
    @GetMapping("/api/profile")
    public Map<String, Object> getActiveProfile() {
        Map<String, Object> profileInfo = new HashMap<>();
        String[] activeProfiles = environment.getActiveProfiles();
        profileInfo.put("activeProfiles", activeProfiles.length > 0 ? activeProfiles : environment.getDefaultProfiles());
        profileInfo.put("serverPort", environment.getProperty("server.port"));
        profileInfo.put("h2ConsoleEnabled", environment.getProperty("spring.h2.console.enabled"));
        profileInfo.put("jpaShowSql", environment.getProperty("spring.jpa.show-sql"));
        return profileInfo;
    }
}
