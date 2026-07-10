package com.example.auro.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.Complaint;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByOrderByCreatedAtDesc();

    List<Complaint> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);

    List<Complaint> findByDepartmentOrderByCreatedAtDesc(String department);
}
