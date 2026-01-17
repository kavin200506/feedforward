package com.feedforward;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class FeedForwardApplication {

    public static void main(String[] args) {
        SpringApplication.run(FeedForwardApplication.class, args);
        System.out.println("🍽️ FeedForward Backend is running on port 8080!");
    }
}


