package com.example.auro.repository;

 
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.PropertyReservation;

public interface PropertyReservationRepository extends JpaRepository<PropertyReservation, Long> {
}
