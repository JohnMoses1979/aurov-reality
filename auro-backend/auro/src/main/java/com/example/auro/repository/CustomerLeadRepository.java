package com.example.auro.repository;

import com.example.auro.entity.CustomerLead;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerLeadRepository extends JpaRepository<CustomerLead, Long> {

    List<CustomerLead> findAllByOrderByCreatedAtDesc();

    List<CustomerLead> findByPhoneOrderByCreatedAtDesc(String phone);
}
