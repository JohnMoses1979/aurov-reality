package com.example.auro.service;

import com.example.auro.dto.SubmittedWorkPdfDto;
import com.example.auro.dto.SubmittedWorkResponseDto;
import com.example.auro.entity.AppUser;
import com.example.auro.entity.SubmittedWork;
import com.example.auro.repository.AppUserRepository;
import com.example.auro.repository.SubmittedWorkRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class SalesSubmitWorkServiceImpl implements SalesSubmitWorkService {

    private static final String ROLE = "Sales Manager";
    private static final String DEPARTMENT = "Sales";

    @Value("${app.upload.manager-work-dir:uploads/manager-work}")
    private String uploadDir;

    private final SubmittedWorkRepository submittedWorkRepository;
    private final AppUserRepository userRepository;

    public SalesSubmitWorkServiceImpl(
            SubmittedWorkRepository submittedWorkRepository,
            AppUserRepository userRepository
    ) {
        this.submittedWorkRepository = submittedWorkRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<SubmittedWorkResponseDto> getMySubmissions(String email) {
        AppUser user = getUser(email);

        return submittedWorkRepository
                .findByManagerUsernameOrderByCreatedAtDesc(user.getEmail())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public SubmittedWorkResponseDto submitWork(
            String email,
            String title,
            String description,
            LocalDate submissionDate,
            MultipartFile file
    ) {
        AppUser user = getUser(email);

        validateSalesManager(user);
        validate(title, description, submissionDate, file);

        StoredPdf storedPdf = savePdf(file);

        SubmittedWork work = new SubmittedWork();
        work.setTitle(title.trim());
        work.setDescription(description.trim());
        work.setSubmissionDate(submissionDate);
        work.setDepartment(DEPARTMENT);
        work.setManagerName(user.getName() == null ? ROLE : user.getName());
        work.setManagerUsername(user.getEmail());
        work.setManagerRole(ROLE);
        work.setEmployeeId(user.getEmployeeId());
        work.setPdfOriginalName(storedPdf.originalName());
        work.setPdfContentType(storedPdf.contentType());
        work.setPdfSize(storedPdf.size());
        work.setPdfStoragePath(storedPdf.path().toString());
        work.setCreatedBy(user.getEmail());
        work.setStatus("Submitted");

        SubmittedWork saved = submittedWorkRepository.save(work);
        saved.setSubmissionCode("SW-" + saved.getId());

        SubmittedWork finalSaved = submittedWorkRepository.save(saved);

        return toDto(finalSaved);
    }

    @Override
    public Resource getPdfResource(String email, Long workId) {
        AppUser user = getUser(email);

        SubmittedWork work = submittedWorkRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Submitted work not found"));

        if (!canAccess(user, work)) {
            throw new RuntimeException("You are not allowed to access this PDF");
        }

        try {
            Resource resource = new UrlResource(Path.of(work.getPdfStoragePath()).normalize().toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("PDF file not found");
            }

            return resource;
        } catch (Exception error) {
            throw new RuntimeException("Unable to read PDF file", error);
        }
    }

    @Override
    public String getPdfName(Long workId) {
        SubmittedWork work = submittedWorkRepository.findById(workId)
                .orElseThrow(() -> new RuntimeException("Submitted work not found"));

        return work.getPdfOriginalName() == null ? "SubmittedWork.pdf" : work.getPdfOriginalName();
    }

    private void validateSalesManager(AppUser user) {
        String role = String.valueOf(user.getRole()).replace("_", " ");

        if (!ROLE.equalsIgnoreCase(role)) {
            throw new RuntimeException("Only Sales Manager can submit Sales work from this page");
        }
    }

    private boolean canAccess(AppUser user, SubmittedWork work) {
        String role = String.valueOf(user.getRole()).replace("_", " ");

        if ("Managing Director".equalsIgnoreCase(role) || "Operations Head".equalsIgnoreCase(role)) {
            return true;
        }

        return user.getEmail() != null && user.getEmail().equalsIgnoreCase(work.getManagerUsername());
    }

    private void validate(
            String title,
            String description,
            LocalDate submissionDate,
            MultipartFile file
    ) {
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Work title is required");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new RuntimeException("Work description is required");
        }

        if (submissionDate == null) {
            throw new RuntimeException("Submission date is required");
        }

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("PDF file is required");
        }

        String name = file.getOriginalFilename() == null
                ? ""
                : file.getOriginalFilename().toLowerCase(Locale.ROOT);

        String type = file.getContentType() == null
                ? ""
                : file.getContentType().toLowerCase(Locale.ROOT);

        boolean valid = type.equals("application/pdf")
                || name.endsWith(".pdf");

        if (!valid) {
            throw new RuntimeException("Only PDF files are allowed");
        }
    }

    private StoredPdf savePdf(MultipartFile file) {
        try {
            Files.createDirectories(Path.of(uploadDir));

            String originalName = StringUtils.cleanPath(
                    file.getOriginalFilename() == null
                            ? "SubmittedWork.pdf"
                            : file.getOriginalFilename()
            );

            String storageName = UUID.randomUUID() + ".pdf";
            Path target = Path.of(uploadDir).resolve(storageName).normalize();

            file.transferTo(target);

            return new StoredPdf(
                    originalName,
                    file.getContentType(),
                    file.getSize(),
                    target
            );
        } catch (Exception error) {
            throw new RuntimeException("Unable to save PDF file");
        }
    }

    private SubmittedWorkResponseDto toDto(SubmittedWork work) {
        return new SubmittedWorkResponseDto(
                work.getSubmissionCode() != null ? work.getSubmissionCode() : "SW-" + work.getId(),
                work.getId(),
                work.getTitle(),
                work.getDescription(),
                work.getSubmissionDate(),
                work.getDepartment(),
                work.getManagerName(),
                work.getManagerRole(),
                work.getEmployeeId(),
                work.getManagerUsername(),
                work.getPdfOriginalName() == null
                        ? null
                        : new SubmittedWorkPdfDto(work.getPdfOriginalName(), "pdf"),
                formatStatus(work.getStatus()),
                work.getRemarks(),
                work.getCreatedAt()
        );
    }

    private String formatStatus(String status) {
        if (status == null || status.isBlank()) {
            return "Submitted";
        }

        String cleaned = status.replace("_", " ").toLowerCase(Locale.ROOT);
        return cleaned.substring(0, 1).toUpperCase() + cleaned.substring(1);
    }

    private AppUser getUser(String principalName) {
        try {
            return userRepository.findById(Long.parseLong(principalName))
                    .orElseGet(() -> userRepository.findByEmail(principalName)
                            .orElseThrow(() -> new RuntimeException("Logged-in user not found")));
        } catch (NumberFormatException ex) {
            return userRepository.findByEmail(principalName)
                    .orElseThrow(() -> new RuntimeException("Logged-in user not found"));
        }
    }

    private record StoredPdf(
            String originalName,
            String contentType,
            long size,
            Path path
    ) {
    }
}


