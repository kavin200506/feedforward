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
        // Load .env file (only for local development)
        // On Railway, environment variables are set directly and will take precedence
        io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
            .ignoreIfMissing()
            .load();
        
        // Set system properties from .env only if not already set as environment variables
        // This allows Railway env vars to override .env file values
        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            // Only set if not already present as environment variable
            if (System.getenv(key) == null && System.getProperty(key) == null) {
                System.setProperty(key, entry.getValue());
            }
        });

        // Convert Railway's MYSQL_URL to JDBC format if present
        String mysqlUrl = System.getenv("MYSQL_URL");
        if (mysqlUrl == null || mysqlUrl.isEmpty()) {
            mysqlUrl = System.getProperty("MYSQL_URL");
        }
        
        if (mysqlUrl != null && !mysqlUrl.isEmpty()) {
            com.feedforward.util.DatabaseConfigUtil.configureDataSource(mysqlUrl, System.getProperties());
        }

        SpringApplication.run(FeedForwardApplication.class, args);
        System.out.println("🍽️ FeedForward Backend is running on port 8080!");
    }
}


