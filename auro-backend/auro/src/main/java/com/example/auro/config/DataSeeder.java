package com.example.auro.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.auro.dto.CreateEmployeeRequest;
import com.example.auro.service.AuthService;

@Configuration
public class DataSeeder {
    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Bean
    CommandLineRunner seedUsers(com.example.auro.repository.UserRepository userRepository, AuthService authService) {
        return args -> {
            if (!seedEnabled || userRepository.count() > 0) {
                return;
            }

            create(authService, "Managing Director", "MD001", "md", "md@aurov.in", "9000000001", "Aurov Managing Director");
            create(authService, "Operational Head", "OH001", "oh", "operations@aurov.in", "9000000002", "Aurov Operational Head");
        };
    }

    private void create(AuthService authService, String role, String employeeId, String username, String email, String mobile, String name) {
        CreateEmployeeRequest req = new CreateEmployeeRequest();
        req.setRole(role);
        req.setEmployeeId(employeeId);
        req.setUsername(username);
        req.setEmail(email);
        req.setMobile(mobile);
        req.setFullName(name);
        req.setPassword("123456");
        authService.createEmployee(req);
    }
}
