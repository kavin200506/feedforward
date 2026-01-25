package com.feedforward.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${spring.mail.enabled:true}")
    private boolean emailEnabled;

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send email to a single recipient using JavaMailSender (Gmail SMTP)
     * @param toEmail Recipient email address
     * @param subject Email subject
     * @param message Email message content
     * @param recipientName Optional recipient name
     * @return true if sent successfully
     */
    public boolean sendEmail(String toEmail, String subject, String message, String recipientName) {
        logger.info("📧 EmailService.sendEmail called for: {}", toEmail);
        
        if (!emailEnabled) {
            logger.warn("⚠️ Email is disabled (spring.mail.enabled=false)");
            return false;
        }
        
        if (fromEmail == null || fromEmail.isEmpty()) {
            logger.error("❌ Sender email (spring.mail.username) not configured!");
            return false;
        }

        if (toEmail == null || toEmail.isEmpty() || !isValidEmail(toEmail)) {
            logger.warn("⚠️ Invalid email address: {}", toEmail);
            return false;
        }

        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(fromEmail);
            email.setTo(toEmail);
            email.setSubject(subject);
            email.setText(message);
            
            // Set reply-to if needed
            email.setReplyTo("noreply@feedforward.com");

            logger.info("📧 Sending email via Gmail SMTP to: {}", toEmail);
            logger.debug("📧 Email subject: {}", subject);
            
            mailSender.send(email);
            
            logger.info("✅ Email sent successfully to: {}", toEmail);
            return true;

        } catch (Exception e) {
            logger.error("❌ Failed to send email to {}: {}", toEmail, e.getMessage());
            logger.debug("📧 Exception details: ", e);
            // Don't throw - just return false so it doesn't break the main flow
            return false;
        }
    }

    /**
     * Send emails to multiple recipients
     * @param emailAddresses List of email addresses
     * @param subject Email subject
     * @param message Email message content
     * @param recipientNames Optional list of recipient names (can be null or shorter than email list)
     * @return Number of successfully sent emails
     */
    public int sendBulkEmails(List<String> emailAddresses, String subject, String message, List<String> recipientNames) {
        if (emailAddresses == null || emailAddresses.isEmpty()) {
            return 0;
        }

        int successCount = 0;
        for (int i = 0; i < emailAddresses.size(); i++) {
            String email = emailAddresses.get(i);
            String name = (recipientNames != null && i < recipientNames.size()) 
                    ? recipientNames.get(i) 
                    : null;
            
            if (sendEmail(email, subject, message, name)) {
                successCount++;
            }
        }

        logger.info("📧 Bulk email result: {}/{} emails sent successfully", successCount, emailAddresses.size());
        return successCount;
    }

    /**
     * Simple email validation
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }
}
