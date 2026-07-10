package com.example.auro.repository;

 
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.CustomerSiteVisit;

public interface CustomerSiteVisitRepository extends JpaRepository<CustomerSiteVisit, Long> {
}
