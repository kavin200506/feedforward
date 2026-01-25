package com.feedforward.util;

import org.junit.jupiter.api.Test;
import java.util.Properties;
import static org.junit.jupiter.api.Assertions.*;

class RailwayUrlParserTest {

    @Test
    void testConfigureDataSource_WithRailwayUrl() {
        String railwayUrl = "mysql://root:password123@containers-us-west-1.railway.app:5678/railway";
        Properties props = new Properties();
        
        String result = DatabaseConfigUtil.configureDataSource(railwayUrl, props);
        
        assertNotNull(result);
        assertTrue(result.startsWith("jdbc:mysql://"));
        assertTrue(result.contains("containers-us-west-1.railway.app:5678/railway"));
        assertEquals("root", props.getProperty("MYSQLUSER"));
        assertEquals("password123", props.getProperty("MYSQLPASSWORD"));
    }

    @Test
    void testConfigureDataSource_WithJdbcUrl() {
        String jdbcUrl = "jdbc:mysql://localhost:3306/mydb";
        Properties props = new Properties();
        
        String result = DatabaseConfigUtil.configureDataSource(jdbcUrl, props);
        
        assertEquals(jdbcUrl, result);
        assertEquals(jdbcUrl, props.getProperty("SPRING_DATASOURCE_URL"));
    }

    @Test
    void testConfigureDataSource_WithEmptyUrl() {
        Properties props = new Properties();
        assertNull(DatabaseConfigUtil.configureDataSource(null, props));
        assertNull(DatabaseConfigUtil.configureDataSource("", props));
    }
}
