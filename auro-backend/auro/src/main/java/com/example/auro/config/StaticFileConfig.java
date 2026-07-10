package com.example.auro.config;

 
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@RequiredArgsConstructor
public class StaticFileConfig implements WebMvcConfigurer {

    private final EmployeeStorageProperties storageProperties;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(storageProperties.getEmployeeDocumentsDir())
                .toAbsolutePath()
                .normalize();

        String location = "file:" + uploadPath.toString().replace("\\", "/") + "/";

        registry.addResourceHandler("/uploads/employee-documents/**")
                .addResourceLocations(location);
    }
}
