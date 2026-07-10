package com.example.auro.service;

 
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Service
public class ManagerTaskFileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public StoredPdf savePdf(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("Assignment PDF is required");
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename());

            if (
                    file.getContentType() == null ||
                    !file.getContentType().equalsIgnoreCase("application/pdf")
            ) {
                if (!originalName.toLowerCase().endsWith(".pdf")) {
                    throw new RuntimeException("Only PDF files are allowed");
                }
            }

            String fileName = UUID.randomUUID() + ".pdf";

            Path folderPath = Paths.get(uploadDir, "manager-tasks")
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(folderPath);

            Path targetPath = folderPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return StoredPdf.builder()
                    .originalName(originalName)
                    .contentType("application/pdf")
                    .size(file.getSize())
                    .storagePath(targetPath.toString())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Unable to save assignment PDF: " + e.getMessage(), e);
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StoredPdf {
        private String originalName;
        private String contentType;
        private Long size;
        private String storagePath;
    }
}
