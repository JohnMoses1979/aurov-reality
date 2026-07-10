package com.example.auro.repository;

 
import com.example.auro.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    Optional<PaymentTransaction> findByRazorpayOrderId(String razorpayOrderId);
}
