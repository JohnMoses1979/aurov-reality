package com.example.auro.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByActivityDate(LocalDate activityDate);

    List<Booking> findByPhoneOrderByCreatedAtDesc(String phone);
}
