package com.example.auro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.ComplaintAttachment;

public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, Long> {

    Optional<ComplaintAttachment> findByIdAndComplaintId(Long id, Long complaintId);
}
