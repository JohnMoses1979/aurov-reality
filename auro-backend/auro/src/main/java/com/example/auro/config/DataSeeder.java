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
            create(authService, "Sales Manager", "SM001", "salesmanager", "sales.manager@aurov.in", "9000000003", "Sales Manager");
            create(authService, "Sales Executive", "SE001", "salesexecutive", "sales.executive@aurov.in", "9000000004", "Sales Executive");
            create(authService, "Marketing Manager", "MM001", "marketingmanager", "marketing.manager@aurov.in", "9000000005", "Marketing Manager");
            create(authService, "Marketing Executive", "ME001", "marketingexecutive", "marketing.executive@aurov.in", "9000000006", "Marketing Executive");
            create(authService, "CRM Manager", "CM001", "crmmanager", "crm.manager@aurov.in", "9000000007", "CRM Manager");
            create(authService, "CRM Executive", "CE001", "crmexecutive", "crm.executive@aurov.in", "9000000008", "CRM Executive");
            create(authService, "Accounts Manager", "AM001", "accountsmanager", "accounts.manager@aurov.in", "9000000009", "Accounts Manager");
            create(authService, "Accounts Executive", "AE001", "accountsexecutive", "accounts.executive@aurov.in", "9000000010", "Accounts Executive");
            create(authService, "HR Manager", "HM001", "hrmanager", "hr.manager@aurov.in", "9000000011", "HR Manager");
            create(authService, "HR Executive", "HE001", "hrexecutive", "hr.executive@aurov.in", "9000000012", "HR Executive");
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
