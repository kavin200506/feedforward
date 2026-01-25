package com.feedforward.util;

import java.net.URI;
import java.util.Properties;

/**
 * Utility class to handle database configuration, specifically converting
 * Railway's MYSQL_URL to JDBC format.
 */
public class DatabaseConfigUtil {

    private DatabaseConfigUtil() {
        // Private constructor to hide the implicit public one
    }

    /**
     * Converts a generic mysql:// URL (like Railway's) to a JDBC URL and sets system properties.
     * 
     * @param mysqlUrl The raw MySQL URL from environment (mysql://user:pass@host:port/db)
     * @param properties The properties object to set the values into (usually System.getProperties())
     * @return The constructed JDBC URL, or null if input was empty/null
     */
    public static String configureDataSource(String mysqlUrl, Properties properties) {
        if (mysqlUrl == null || mysqlUrl.isEmpty()) {
            return null;
        }

        try {
            // If already in JDBC format, use as-is
            if (mysqlUrl.startsWith("jdbc:mysql://")) {
                properties.setProperty("SPRING_DATASOURCE_URL", mysqlUrl);
                return mysqlUrl;
            }

            // Parse mysql://user:password@host:port/database format
            String url = mysqlUrl.replace("mysql://", "http://");
            URI uri = new URI(url);
            
            String host = uri.getHost();
            int port = uri.getPort() == -1 ? 3306 : uri.getPort();
            String path = uri.getPath();
            String database = path.startsWith("/") ? path.substring(1) : path;
            
            // Extract username and password from userInfo
            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] creds = userInfo.split(":", 2);
                properties.setProperty("MYSQLUSER", creds[0]);
                if (creds.length > 1) {
                    properties.setProperty("MYSQLPASSWORD", creds[1]);
                }
            }

            // Build JDBC URL with parameters
            String useSsl = System.getenv("MYSQL_USE_SSL");
            String requireSsl = System.getenv("MYSQL_REQUIRE_SSL");
            boolean ssl = useSsl != null && (useSsl.equals("true") || useSsl.equals("1"));
            boolean requireSslFlag = requireSsl != null && (requireSsl.equals("true") || requireSsl.equals("1"));

            String jdbcUrl = String.format(
                "jdbc:mysql://%s:%d/%s?createDatabaseIfNotExist=true&useSSL=%s&requireSSL=%s&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                host, port, database, ssl, requireSslFlag
            );

            properties.setProperty("SPRING_DATASOURCE_URL", jdbcUrl);
            System.out.println("✅ Converted Railway MYSQL_URL to JDBC format");
            return jdbcUrl;
        } catch (Exception e) {
            System.err.println("⚠️ Failed to convert MYSQL_URL: " + e.getMessage());
            System.err.println("   Using individual MYSQLHOST, MYSQLPORT, etc. instead");
            return null;
        }
    }
}
