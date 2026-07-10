package com.example.auro.repository;

 
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.Venture;

public interface VentureRepository extends JpaRepository<Venture, Long> {
}
