package com.example.auro.service;

 
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String folderName) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";

            int dotIndex = originalName.lastIndexOf(".");
            if (dotIndex >= 0) {
                extension = originalName.substring(dotIndex);
            }

            String fileName = UUID.randomUUID() + extension;

            Path folderPath = Paths.get(uploadDir, folderName)
                    .toAbsolutePath()
                    .normalize();

            Files.createDirectories(folderPath);

            Path targetPath = folderPath.resolve(fileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + folderName + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file: " + file.getOriginalFilename(), ex);
        }
    }
}
