package com.example.auro.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ComplaintAttachmentSchemaFix {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureComplaintAttachmentIdentity() {
        try {
            String extra = jdbcTemplate.query(
                    "SELECT EXTRA FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'complaint_attachments' AND column_name = 'attachments_id'",
                    rs -> rs.next() ? rs.getString("EXTRA") : null
            );

            if (extra == null) {
                return;
            }

            if (!extra.toLowerCase().contains("auto_increment")) {
                jdbcTemplate.execute(
                        "ALTER TABLE complaint_attachments MODIFY attachments_id BIGINT NOT NULL AUTO_INCREMENT"
                );
            }
        } catch (Exception ignored) {
            // Keep startup resilient; if the table is already correct or the DB denies
            // the alter, normal application startup should still continue.
        }
    }
}
