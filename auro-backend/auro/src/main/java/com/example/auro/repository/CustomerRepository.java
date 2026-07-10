package com.example.auro.repository;

import com.example.auro.entity.CustomerEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<CustomerEntity, Long> {
    Optional<CustomerEntity> findByMobileNumber(String mobileNumber);
    Optional<CustomerEntity> findByEmail(String email);
}
