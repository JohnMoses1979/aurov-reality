package com.example.auro.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "complaint_status_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintStatusHistory {

    @Id
    @Column(name = "status_history_id", nullable = false)
    private Long id;

    private String status;

    @Column(length = 2000)
    private String note;

    private String updatedBy;
    private String updatedByRole;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    private Complaint complaint;

    @PrePersist
    public void assignIdIfMissing() {
        if (id == null) {
            id = Math.abs(UUID.randomUUID().getMostSignificantBits());
            if (id == 0L) {
                id = Math.abs(UUID.randomUUID().getLeastSignificantBits());
            }
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
