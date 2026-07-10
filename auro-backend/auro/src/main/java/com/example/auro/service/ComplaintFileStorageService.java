package com.example.auro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.entity.ComplaintAttachment;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ComplaintFileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public ComplaintAttachment saveAttachment(MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return null;
            }

            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";

            int dot = originalName.lastIndexOf(".");

            if (dot >= 0) {
                extension = originalName.substring(dot);
            }

            String fileIdentifier = UUID.randomUUID().toString();
            String fileName = fileIdentifier + extension;

            Path folderPath = Paths.get(uploadDir, "complaints")
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(folderPath);

            Path targetPath = folderPath.resolve(fileName);

            Files.copy(
                    file.getInputStream(),
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            String contentType = file.getContentType();
            String resolvedType = (contentType == null || contentType.isBlank())
                    ? extension.replace(".", "").toLowerCase()
                    : contentType;

            return ComplaintAttachment.builder()
                    .name(originalName)
                    .contentType(contentType)
                    .sizeBytes(file.getSize())
                    .type(resolvedType)
                    .filePath(targetPath.toString())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Unable to save complaint attachment", e);
        }
    }
}
