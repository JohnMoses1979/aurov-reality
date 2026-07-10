package com.example.auro.config;

 
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.storage")
@Getter
@Setter
public class EmployeeStorageProperties {

    private String employeeDocumentsDir = "uploads/employee-documents";
}
