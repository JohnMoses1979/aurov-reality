package com.example.auro.repository;

import com.example.auro.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    Optional<EmployeeDocument> findByEmployee_IdAndId(Long employeeId, Long documentId);
}
