package com.feedforward.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    @Value("${fast2sms.api.key}")
    private String apiKey;

    @Value("${fast2sms.api.url}")
    private String apiUrl;

    @Value("${fast2sms.sender.id}")
    private String senderId;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send SMS using Fast2SMS API
     * @param phoneNumbers List of phone numbers (without +91)
     * @param message SMS text content
     * @return true if sent successfully
     */
    public boolean sendSms(List<String> phoneNumbers, String message) {
        try {
            // Clean phone numbers (remove +91, spaces, dashes)
            List<String> cleanNumbers = phoneNumbers.stream()
                    .map(this::cleanPhoneNumber)
                    .filter(num -> num.length() == 10) // Only 10-digit numbers
                    .distinct()
                    .collect(Collectors.toList());

            if (cleanNumbers.isEmpty()) {
                logger.warn("No valid phone numbers to send SMS");
                return false;
            }

            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authorization", apiKey);

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender_id", senderId);
            requestBody.put("message", message);
            requestBody.put("language", "english");
            requestBody.put("route", "q"); // Promotional route
            requestBody.put("numbers", String.join(",", cleanNumbers));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send request
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            // Check response
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null) {
                    Object returnValue = responseBody.get("return");
                    if (Boolean.TRUE.equals(returnValue) || "true".equals(String.valueOf(returnValue))) {
                        logger.info("SMS sent successfully to {} numbers", cleanNumbers.size());
                        return true;
                    }
                }
            }

            logger.error("SMS sending failed: {}", response.getBody());
            return false;

        } catch (RestClientException e) {
            logger.error("Error sending SMS (RestClientException): {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("Error sending SMS: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send SMS to single phone number
     */
    public boolean sendSms(String phoneNumber, String message) {
        return sendSms(List.of(phoneNumber), message);
    }

    /**
     * Clean phone number (remove +91, spaces, special chars)
     */
    private String cleanPhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "";
        }

        // Remove all non-digit characters
        String cleaned = phone.replaceAll("[^0-9]", "");

        // Remove country code if present
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        }

        return cleaned;
    }

    /**
     * Validate Indian mobile number
     */
    public boolean isValidIndianMobile(String phone) {
        String cleaned = cleanPhoneNumber(phone);
        return cleaned.length() == 10 && cleaned.matches("^[6-9][0-9]{9}$");
    }
}

