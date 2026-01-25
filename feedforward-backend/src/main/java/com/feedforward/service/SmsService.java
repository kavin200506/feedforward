package com.feedforward.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    // Twilio Configuration
    @Value("${twilio.account.sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth.token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone.number:}")
    private String twilioPhoneNumber;

    @Value("${twilio.enabled:true}")
    private boolean twilioEnabled;

    // Fast2SMS Configuration (Legacy - kept for backward compatibility)
    @Value("${fast2sms.api.key:}")
    private String fast2smsApiKey;

    @Value("${fast2sms.api.url:}")
    private String fast2smsApiUrl;

    @Value("${fast2sms.sender.id:FDFWRD}")
    private String fast2smsSenderId;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostConstruct
    public void init() {
        // Initialize Twilio if credentials are provided
        if (twilioEnabled && twilioAccountSid != null && !twilioAccountSid.isEmpty() 
            && twilioAuthToken != null && !twilioAuthToken.isEmpty()) {
            try {
                Twilio.init(twilioAccountSid, twilioAuthToken);
                logger.info("✅ Twilio initialized successfully with Account SID: {}...{}", 
                    twilioAccountSid.substring(0, Math.min(8, twilioAccountSid.length())),
                    twilioAccountSid.length() > 8 ? "..." : "");
                logger.info("📱 Twilio Phone Number: {}", twilioPhoneNumber);
            } catch (Exception e) {
                logger.error("❌ Failed to initialize Twilio: {}", e.getMessage());
                twilioEnabled = false;
            }
        } else {
            logger.warn("⚠️ Twilio not configured. Account SID or Auth Token missing.");
            twilioEnabled = false;
        }
    }

    /**
     * Send SMS using Twilio API (preferred) or Fast2SMS (fallback)
     * @param phoneNumbers List of phone numbers
     * @param message SMS text content
     * @return true if sent successfully
     */
    public boolean sendSms(List<String> phoneNumbers, String message) {
        if (twilioEnabled && twilioAccountSid != null && !twilioAccountSid.isEmpty()) {
            return sendSmsViaTwilio(phoneNumbers, message);
        } else {
            logger.warn("⚠️ Twilio not enabled, falling back to Fast2SMS");
            return sendSmsViaFast2SMS(phoneNumbers, message);
        }
    }

    /**
     * Send SMS using Twilio API
     */
    private boolean sendSmsViaTwilio(List<String> phoneNumbers, String message) {
        try {
            logger.info("📱 Attempting to send SMS via Twilio to {} phone numbers", phoneNumbers.size());
            logger.info("📱 Original phone numbers: {}", phoneNumbers);

            // Clean and format phone numbers for Twilio (E.164 format: +[country code][number])
            List<String> formattedNumbers = phoneNumbers.stream()
                    .map(this::formatPhoneNumberForTwilio)
                    .filter(num -> num != null && !num.isEmpty())
                    .distinct()
                    .collect(Collectors.toList());

            logger.info("📱 Formatted phone numbers for Twilio: {}", formattedNumbers);

            if (formattedNumbers.isEmpty()) {
                logger.warn("⚠️ No valid phone numbers to send SMS via Twilio");
                return false;
            }

            if (twilioPhoneNumber == null || twilioPhoneNumber.isEmpty()) {
                logger.error("❌ Twilio phone number (FROM) is not configured!");
                return false;
            }

            int successCount = 0;
            int failureCount = 0;

            // Twilio requires individual API calls for each number
            for (String toNumber : formattedNumbers) {
                try {
                    logger.info("📱 Sending SMS via Twilio from {} to {}", twilioPhoneNumber, toNumber);

                    Message twilioMessage = Message.creator(
                            new PhoneNumber(toNumber),      // To
                            new PhoneNumber(twilioPhoneNumber), // From
                            message                         // Message body
                    ).create();

                    String messageSid = twilioMessage.getSid();
                    String status = twilioMessage.getStatus().toString();

                    logger.info("✅ Twilio SMS sent successfully! SID: {}, Status: {}, To: {}", 
                            messageSid, status, toNumber);
                    successCount++;

                } catch (com.twilio.exception.ApiException e) {
                    // Check if it's a trial account restriction (unverified number)
                    if (e.getCode() == 21608 || e.getMessage().contains("unverified")) {
                        logger.warn("⚠️ Twilio Trial Account: Number {} is unverified. Verify at: https://www.twilio.com/console/phone-numbers/verified", 
                                toNumber);
                        logger.warn("⚠️ Error: {} (Code: {})", e.getMessage(), e.getCode());
                    } else {
                        logger.error("❌ Twilio API error sending to {}: {} (Code: {})", 
                                toNumber, e.getMessage(), e.getCode());
                    }
                    failureCount++;
                } catch (Exception e) {
                    logger.error("❌ Error sending Twilio SMS to {}: {}", toNumber, e.getMessage(), e);
                    failureCount++;
                }
            }

            logger.info("📊 Twilio SMS Summary: {} successful, {} failed out of {} total", 
                    successCount, failureCount, formattedNumbers.size());

            // If all failed due to trial account restrictions, suggest fallback
            if (successCount == 0 && failureCount > 0) {
                logger.warn("⚠️ All SMS failed via Twilio. This might be due to:");
                logger.warn("   1. Trial account - verify numbers at: https://www.twilio.com/console/phone-numbers/verified");
                logger.warn("   2. Insufficient account balance");
                logger.warn("   3. Invalid phone number format");
                logger.warn("💡 Consider enabling Fast2SMS fallback by setting: twilio.enabled=false");
            } else if (successCount > 0 && failureCount > 0) {
                logger.info("✅ Partial success: {} SMS sent successfully, {} failed (likely unverified numbers)", 
                        successCount, failureCount);
                logger.info("💡 To send to all numbers, verify them at: https://www.twilio.com/console/phone-numbers/verified");
            }

            // Return true if at least one message was sent successfully
            return successCount > 0;

        } catch (Exception e) {
            logger.error("❌ Error in Twilio SMS service: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Format phone number for Twilio (E.164 format: +[country code][number])
     * Examples:
     * - "9876543210" (India) -> "+919876543210"
     * - "+919876543210" -> "+919876543210"
     * - "919876543210" -> "+919876543210"
     */
    private String formatPhoneNumberForTwilio(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        // Remove all non-digit characters except +
        String cleaned = phone.replaceAll("[^0-9+]", "");

        // If already starts with +, validate and return
        if (cleaned.startsWith("+")) {
            // Validate E.164 format (should be + followed by country code and number)
            if (cleaned.length() >= 10 && cleaned.length() <= 15) {
                return cleaned;
            } else {
                logger.warn("⚠️ Invalid E.164 format: {}", cleaned);
                return null;
            }
        }

        // If starts with country code (91 for India)
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            return "+" + cleaned;
        }

        // If it's a 10-digit Indian number, add +91
        if (cleaned.length() == 10 && cleaned.matches("^[6-9][0-9]{9}$")) {
            return "+91" + cleaned;
        }

        // If it's 11 digits and starts with 0 (common in India), remove 0 and add +91
        if (cleaned.length() == 11 && cleaned.startsWith("0")) {
            return "+91" + cleaned.substring(1);
        }

        logger.warn("⚠️ Could not format phone number for Twilio: {}", phone);
        return null;
    }

    /**
     * Send SMS using Fast2SMS API (Legacy - fallback)
     */
    private boolean sendSmsViaFast2SMS(List<String> phoneNumbers, String message) {
        try {
            logger.info("📱 Attempting to send SMS via Fast2SMS to {} phone numbers", phoneNumbers.size());
            logger.info("📱 Original phone numbers: {}", phoneNumbers);
            
            // Clean phone numbers (remove +91, spaces, dashes)
            List<String> cleanNumbers = phoneNumbers.stream()
                    .map(this::cleanPhoneNumber)
                    .filter(num -> num.length() == 10) // Only 10-digit numbers
                    .distinct()
                    .collect(Collectors.toList());

            logger.info("📱 Cleaned phone numbers (10 digits): {}", cleanNumbers);
            
            if (cleanNumbers.isEmpty()) {
                logger.warn("⚠️ No valid phone numbers to send SMS. Original: {}, Cleaned: {}", phoneNumbers, cleanNumbers);
                return false;
            }

            // Validate API key
            if (fast2smsApiKey == null || fast2smsApiKey.isBlank()) {
                logger.error("❌ Fast2SMS API key is not configured!");
                return false;
            }
            
            logger.info("📱 Using Fast2SMS API Key: {}...{} (first 10, last 10)", 
                    fast2smsApiKey.length() > 10 ? fast2smsApiKey.substring(0, 10) : fast2smsApiKey,
                    fast2smsApiKey.length() > 10 ? fast2smsApiKey.substring(fast2smsApiKey.length() - 10) : "");

            // Prepare request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("authorization", fast2smsApiKey);

            // Build request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender_id", fast2smsSenderId);
            requestBody.put("message", message);
            requestBody.put("language", "english");
            requestBody.put("route", "q"); // Promotional route
            requestBody.put("numbers", String.join(",", cleanNumbers));

            logger.info("📱 Fast2SMS Request URL: {}", fast2smsApiUrl);
            logger.info("📱 Fast2SMS Request Body: {}", requestBody);
            logger.info("📱 SMS Message (length: {}): {}", message.length(), message);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send request
            logger.info("📱 Sending POST request to Fast2SMS API: {}", fast2smsApiUrl);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    fast2smsApiUrl,
                    HttpMethod.POST,
                    request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {}
            );

            // Check response
            logger.info("📱 Fast2SMS API Response Status: {}", response.getStatusCode());
            logger.info("📱 Fast2SMS API Response Body: {}", response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                if (responseBody != null) {
                    Object returnValue = responseBody.get("return");
                    Object statusValue = responseBody.get("status");
                    Object messageValue = responseBody.get("message");
                    Object requestId = responseBody.get("request_id");
                    
                    logger.info("📱 Fast2SMS return field: {} (type: {})", returnValue, returnValue != null ? returnValue.getClass().getSimpleName() : "null");
                    logger.info("📱 Fast2SMS status field: {}", statusValue);
                    logger.info("📱 Fast2SMS message field: {}", messageValue);
                    logger.info("📱 Fast2SMS request_id: {}", requestId);
                    
                    boolean isSuccess = false;
                    
                    if (returnValue != null) {
                        if (returnValue instanceof Boolean) {
                            isSuccess = (Boolean) returnValue;
                        } else if (returnValue instanceof String) {
                            isSuccess = "true".equalsIgnoreCase((String) returnValue);
                        } else {
                            String returnStr = String.valueOf(returnValue);
                            isSuccess = "true".equalsIgnoreCase(returnStr) || "success".equalsIgnoreCase(returnStr);
                        }
                    }
                    
                    if (!isSuccess && statusValue != null) {
                        String statusStr = String.valueOf(statusValue);
                        isSuccess = "success".equalsIgnoreCase(statusStr) || "ok".equalsIgnoreCase(statusStr);
                    }
                    
                    if (isSuccess) {
                        logger.info("✅ Fast2SMS sent successfully to {} numbers: {}", cleanNumbers.size(), cleanNumbers);
                        if (requestId != null) {
                            logger.info("📱 Fast2SMS Request ID: {}", requestId);
                        }
                        return true;
                    } else {
                        logger.warn("⚠️ Fast2SMS returned non-success status. Return: {}, Status: {}, Message: {}", 
                                returnValue, statusValue, messageValue);
                    }
                } else {
                    logger.error("❌ Fast2SMS response body is null");
                }
            } else {
                logger.error("❌ Fast2SMS API returned non-OK status: {}", response.getStatusCode());
            }

            logger.error("❌ Fast2SMS sending failed. Status: {}, Body: {}", response.getStatusCode(), response.getBody());
            return false;

        } catch (RestClientException e) {
            logger.error("❌ Error sending SMS via Fast2SMS (RestClientException): {}", e.getMessage());
            return false;
        } catch (Exception e) {
            logger.error("❌ Error sending SMS via Fast2SMS: {}", e.getMessage(), e);
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
     * Clean phone number (remove +91, spaces, special chars) - for Fast2SMS
     */
    private String cleanPhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return "";
        }

        // Remove all non-digit characters
        String cleaned = phone.replaceAll("[^0-9]", "");

        // Remove country code if present (91 for India)
        if (cleaned.startsWith("91") && cleaned.length() == 12) {
            cleaned = cleaned.substring(2);
        }
        
        // Remove leading 0 if present (common in Indian numbers)
        if (cleaned.length() == 11 && cleaned.startsWith("0")) {
            cleaned = cleaned.substring(1);
        }

        logger.debug("Phone cleaning: '{}' -> '{}'", phone, cleaned);
        return cleaned;
    }

    /**
     * Validate Indian mobile number
     * Accepts: 10-digit numbers starting with 6-9
     * Also accepts numbers with country code or leading 0
     */
    public boolean isValidIndianMobile(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            logger.debug("Phone number is null or empty");
            return false;
        }
        
        String cleaned = cleanPhoneNumber(phone);
        boolean isValid = cleaned.length() == 10 && cleaned.matches("^[6-9][0-9]{9}$");
        
        logger.debug("Phone validation: original='{}', cleaned='{}', length={}, valid={}", 
                phone, cleaned, cleaned.length(), isValid);
        
        return isValid;
    }
}
