package com.example.auro.repository;

 
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.SiteVisit;

public interface SiteVisitRepository extends JpaRepository<SiteVisit, Long> {

    List<SiteVisit> findAllByOrderByCreatedAtDesc();

    List<SiteVisit> findByPhoneOrderByCreatedAtDesc(String phone);
}
