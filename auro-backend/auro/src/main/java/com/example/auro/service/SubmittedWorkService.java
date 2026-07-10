package com.example.auro.service;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.ReviewSubmittedWorkRequest;
import com.example.auro.dto.SubmittedWorkResponse;
import com.example.auro.entity.AppUser;
import com.example.auro.entity.SubmittedWork;
import com.example.auro.repository.AppUserRepository;
import com.example.auro.repository.SubmittedWorkRepository;
import com.example.auro.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmittedWorkService {

    private final SubmittedWorkRepository repository;
    private final SubmittedWorkFileStorageService fileStorageService;
    private final AppUserRepository appUserRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    /*
     * OLD CONTROLLER SUPPORT:
     * Manager submits work using multipart form.
     */
    @Transactional
    public SubmittedWorkResponse submitWork(
            String title,
            String description,
            String submissionDate,
            String department,
            MultipartFile pdf,
            Authentication authentication
    ) {
        SubmittedWork saved = createSubmittedWork(
                title,
                description,
                department,
                submissionDate,
                pdf,
                authentication.getName()
        );

        return SubmittedWorkResponse.fromEntity(saved);
    }

    /*
     * NEW CONTROLLER SUPPORT:
     * Manager submits work and returns frontend-friendly Map.
     */
    @Transactional
    public Map<String, Object> submitWork(
            String title,
            String description,
            String department,
            String submissionDate,
            MultipartFile pdf,
            String username
    ) {
        SubmittedWork saved = createSubmittedWork(
                title,
                description,
                department,
                submissionDate,
                pdf,
                username
        );

        return workMap(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmittedWorkResponse> getMySubmissions(Authentication authentication) {
        AppUser user = getUser(authentication.getName());

        return repository.findByManagerUsernameOrderByCreatedAtDesc(user.getEmail())
                .stream()
                .map(SubmittedWorkResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMySubmittedWorks(String username) {
        AppUser user = getUser(username);

        return repository.findByManagerUsernameOrderByCreatedAtDesc(user.getEmail())
                .stream()
                .map(this::workMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubmittedWorkResponse> getAllWorks(
            String department,
            String status,
            String manager,
            String date,
            String search
    ) {
        return repository.findAll()
                .stream()
                .filter(work -> department == null || department.equalsIgnoreCase("All") || department.equalsIgnoreCase(valueOrDefault(work.getDepartment(), "")))
                .filter(work -> status == null || status.equalsIgnoreCase("All") || status.equalsIgnoreCase(valueOrDefault(work.getStatus(), "")))
                .filter(work -> manager == null || manager.equalsIgnoreCase("All") || manager.equalsIgnoreCase(valueOrDefault(work.getManagerName(), "")))
                .filter(work -> date == null || date.isBlank() || sameDate(work, date))
                .filter(work -> search == null || search.isBlank() || containsSearch(work, search))
                .map(SubmittedWorkResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLeadershipSubmittedWorks(String username) {
        AppUser user = getUser(username);
        if (!isLeadership(user)) {
            throw new AccessDeniedException("Only MD/OH can access submitted work list.");
        }

        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::workMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllWorks() {
        return repository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::workMap)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubmittedWorkResponse getById(Long id, Authentication authentication) {
        SubmittedWork work = findWork(id);
        checkAccess(work, authentication.getName(), authentication);
        return SubmittedWorkResponse.fromEntity(work);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(Long id, String username) {
        SubmittedWork work = findWork(id);
        checkAccess(work, username, null);
        return workMap(work);
    }

    @Transactional
    public SubmittedWorkResponse updateWork(
            Long id,
            String title,
            String description,
            String submissionDate,
            String department,
            MultipartFile pdf,
            Authentication authentication
    ) {
        SubmittedWork saved = updateWorkInternal(
                id,
                title,
                description,
                department,
                submissionDate,
                pdf,
                authentication.getName()
        );

        return SubmittedWorkResponse.fromEntity(saved);
    }

    @Transactional
    public Map<String, Object> updateWork(
            Long id,
            String title,
            String description,
            String department,
            String submissionDate,
            MultipartFile pdf,
            String username
    ) {
        SubmittedWork saved = updateWorkInternal(
                id,
                title,
                description,
                department,
                submissionDate,
                pdf,
                username
        );

        return workMap(saved);
    }

    @Transactional
    public SubmittedWorkResponse reviewWork(
            Long id,
            ReviewSubmittedWorkRequest request,
            Authentication authentication
    ) {
        SubmittedWork saved = reviewWorkInternal(id, request.getStatus(), request.getRemarks(), authentication.getName());
        return SubmittedWorkResponse.fromEntity(saved);
    }

    @Transactional
    public Map<String, Object> reviewWork(Long id, ReviewSubmittedWorkRequest request, String username) {
        SubmittedWork saved = reviewWorkInternal(id, request.getStatus(), request.getRemarks(), username);
        return workMap(saved);
    }

    @Transactional
    public Map<String, Object> reviewWork(Long id, String status, String remarks, String username) {
        SubmittedWork saved = reviewWorkInternal(id, status, remarks, username);
        return workMap(saved);
    }

    @Transactional
    public void deleteWork(Long id, Authentication authentication) {
        deleteWork(id, authentication.getName());
    }

    @Transactional
    public void deleteWork(Long id, String username) {
        SubmittedWork work = findWork(id);
        AppUser user = getUser(username);

        if (!isLeadership(user)) {
            checkManagerOwner(work, user);
        }

        repository.delete(work);
    }

    @Transactional(readOnly = true)
    public Resource getPdfResource(Long id, Authentication authentication) {
        return getPdfResource(id, authentication.getName());
    }

    @Transactional(readOnly = true)
    public Resource getPdfResource(Long id, String username) {
        SubmittedWork work = findWork(id);
        checkAccess(work, username, null);

        if (work.getPdfStoragePath() != null && !work.getPdfStoragePath().isBlank()) {
            try {
                Path path = Path.of(work.getPdfStoragePath());
                Resource resource = new UrlResource(path.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            } catch (Exception ignored) {
            }
        }

        if (work.getData() != null) {
            return new ByteArrayResource(work.getData());
        }

        throw new RuntimeException("Unable to read PDF file");
    }

    @Transactional(readOnly = true)
    public SubmittedWork getPdfInfo(Long id, Authentication authentication) {
        SubmittedWork work = findWork(id);
        checkAccess(work, authentication.getName(), authentication);
        return work;
    }

    @Transactional(readOnly = true)
    public List<SubmittedWorkResponse> getByDate(String date) {
        LocalDate parsed = parseDate(date);
        return repository.findBySubmissionDate(parsed)
                .stream()
                .map(SubmittedWorkResponse::fromEntity)
                .toList();
    }

    private SubmittedWork createSubmittedWork(
            String title,
            String description,
            String department,
            String submissionDate,
            MultipartFile pdf,
            String username
    ) {
        AppUser user = getUser(username);
        validateRequired(title, "Work title is required.");
        validateRequired(description, "Work description is required.");
        validateRequired(department, "Department is required.");
        validatePdf(pdf);

        SubmittedWorkFileStorageService.StoredFile storedFile = fileStorageService.savePdf(pdf);

        SubmittedWork work = SubmittedWork.builder()
                .submissionCode(generateSubmissionCode())
                .title(title.trim())
                .description(description.trim())
                .department(department.trim())
                .submissionDate(parseDate(submissionDate))
                .manager(userRepository.findByEmail(user.getEmail()).orElse(null))
                .managerName(valueOrDefault(user.getName(), user.getEmail()))
                .managerUsername(user.getEmail())
                .managerRole(valueOrDefault(user.getRole(), "Manager"))
                .employeeId(valueOrDefault(user.getEmployeeId(), user.getEmail()))
                .employeeEmail(user.getEmail())
                .status("Submitted")
                .fileName(storedFile.getOriginalName())
                .contentType(storedFile.getContentType())
                .fileSizeLabel(String.valueOf(storedFile.getSize()))
                .pdfOriginalName(storedFile.getOriginalName())
                .pdfName(storedFile.getOriginalName())
                .pdfContentType(storedFile.getContentType())
                .pdfSize(storedFile.getSize())
                .pdfSizeBytes(storedFile.getSize())
                .pdfStoragePath(storedFile.getStoragePath())
                .createdBy(user.getEmail())
                .build();

        SubmittedWork saved = repository.save(work);

        notificationService.notifyRoles(
                List.of("Managing Director", "Operational Head"),
                "Submitted Work",
                "New manager work submission",
                work.getManagerName() + " submitted " + work.getTitle() + " for review.",
                "SUBMITTED_WORK",
                String.valueOf(saved.getId())
        );

        return saved;
    }

    private SubmittedWork updateWorkInternal(
            Long id,
            String title,
            String description,
            String department,
            String submissionDate,
            MultipartFile pdf,
            String username
    ) {
        AppUser user = getUser(username);
        SubmittedWork work = findWork(id);
        checkManagerOwner(work, user);

        validateRequired(title, "Work title is required.");
        validateRequired(description, "Work description is required.");
        validateRequired(department, "Department is required.");

        work.setTitle(title.trim());
        work.setDescription(description.trim());
        work.setDepartment(department.trim());
        work.setSubmissionDate(parseDate(submissionDate));
        work.setStatus("Submitted");
        if (work.getSubmissionCode() == null || work.getSubmissionCode().isBlank()) {
            work.setSubmissionCode(generateSubmissionCode());
        }
        work.setRemarks(null);
        work.setReviewedBy(null);
        work.setReviewedAt(null);

        if (pdf != null && !pdf.isEmpty()) {
            validatePdf(pdf);
            SubmittedWorkFileStorageService.StoredFile storedFile = fileStorageService.savePdf(pdf);
            work.setFileName(storedFile.getOriginalName());
            work.setContentType(storedFile.getContentType());
            work.setFileSizeLabel(String.valueOf(storedFile.getSize()));
            work.setPdfOriginalName(storedFile.getOriginalName());
            work.setPdfName(storedFile.getOriginalName());
            work.setPdfContentType(storedFile.getContentType());
            work.setPdfSize(storedFile.getSize());
            work.setPdfSizeBytes(storedFile.getSize());
            work.setPdfStoragePath(storedFile.getStoragePath());
        }

        return repository.save(work);
    }

    private SubmittedWork reviewWorkInternal(Long id, String status, String remarks, String username) {
        SubmittedWork work = findWork(id);
        AppUser user = getUser(username);

        if (!isLeadership(user)) {
            throw new AccessDeniedException("Only MD/OH can review submitted work.");
        }

        if (!"Reviewed".equalsIgnoreCase(status)
                && !"Approved".equalsIgnoreCase(status)
                && !"Rejected".equalsIgnoreCase(status)) {
            throw new RuntimeException("Allowed statuses: Reviewed, Approved, Rejected");
        }

        work.setStatus(status);
        work.setRemarks(remarks);
        work.setReviewedBy(valueOrDefault(user.getEmail(), user.getName()));
        work.setReviewedAt(LocalDateTime.now());
        SubmittedWork saved = repository.save(work);

        notificationService.notifyUserByIdentifier(
                saved.getManagerUsername(),
                "Submitted Work Review",
                "Your submitted work was reviewed",
                saved.getTitle() + " was marked " + status + ".",
                "SUBMITTED_WORK",
                String.valueOf(saved.getId())
        );

        return saved;
    }

    private SubmittedWork findWork(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submitted work not found"));
    }

    private void checkAccess(SubmittedWork work, String username, Authentication authentication) {
        AppUser user = getUser(username);
        if (isLeadership(authentication) || isLeadership(user)) {
            return;
        }
        checkManagerOwner(work, user);
    }

    private void checkManagerOwner(SubmittedWork work, AppUser user) {
        if (user.getEmail() == null || work.getManagerUsername() == null
                || !work.getManagerUsername().equalsIgnoreCase(user.getEmail())) {
            throw new AccessDeniedException("You are not allowed to access this submitted work");
        }
    }

    private boolean isLeadership(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> {
                    String value = authority.getAuthority();
                    return value.equals("Managing Director")
                            || value.equals("Operational Head")
                            || value.equals("Admin")
                            || value.equals("Super Admin")
                            || value.equals("ROLE_MANAGING_DIRECTOR")
                            || value.equals("ROLE_OPERATIONAL_HEAD")
                            || value.equals("ROLE_ADMIN")
                            || value.equals("ROLE_SUPER_ADMIN");
                });
    }

    private boolean isLeadership(AppUser user) {
        if (user == null || user.getRole() == null) {
            return false;
        }

        String role = user.getRole().trim();
        return role.equalsIgnoreCase("Managing Director")
                || role.equalsIgnoreCase("Operational Head")
                || role.equalsIgnoreCase("Admin")
                || role.equalsIgnoreCase("Super Admin")
                || role.equalsIgnoreCase("ROLE_MANAGING_DIRECTOR")
                || role.equalsIgnoreCase("ROLE_OPERATIONAL_HEAD")
                || role.equalsIgnoreCase("ROLE_ADMIN")
                || role.equalsIgnoreCase("ROLE_SUPER_ADMIN");
    }

    private boolean sameDate(SubmittedWork work, String date) {
        return work.getSubmissionDate() != null
                && work.getSubmissionDate().toString().equals(date);
    }

    private boolean containsSearch(SubmittedWork work, String search) {
        String q = search.toLowerCase();
        String content = String.join(" ",
                valueOrDefault(work.getSubmissionCode(), ""),
                valueOrDefault(work.getManagerName(), ""),
                valueOrDefault(work.getManagerUsername(), ""),
                valueOrDefault(work.getEmployeeId(), ""),
                valueOrDefault(work.getEmployeeEmail(), ""),
                valueOrDefault(work.getDepartment(), ""),
                valueOrDefault(work.getTitle(), ""),
                valueOrDefault(work.getDescription(), ""),
                valueOrDefault(work.getStatus(), "")
        ).toLowerCase();
        return content.contains(q);
    }

    private Map<String, Object> workMap(SubmittedWork work) {
        Map<String, Object> map = new LinkedHashMap<>();

        map.put("id", work.getId());
        map.put("submissionCode", valueOrDefault(work.getSubmissionCode(), "SW-" + work.getId()));
        map.put("title", work.getTitle());
        map.put("description", work.getDescription());
        map.put("department", work.getDepartment());
        map.put("managerName", work.getManagerName());
        map.put("managerUsername", work.getManagerUsername());
        map.put("managerRole", work.getManagerRole());
        map.put("employeeId", work.getEmployeeId());
        map.put("employeeEmail", work.getEmployeeEmail());
        map.put("status", work.getStatus());
        map.put("remarks", work.getRemarks());

        map.put("submissionDate", work.getSubmissionDate() == null ? "" : work.getSubmissionDate().toString());
        map.put("createdAt", work.getCreatedAt() == null ? "" : work.getCreatedAt().format(DISPLAY_FORMAT));
        map.put("updatedAt", work.getUpdatedAt() == null ? "" : work.getUpdatedAt().format(DISPLAY_FORMAT));
        map.put("reviewedBy", work.getReviewedBy());
        map.put("reviewedAt", work.getReviewedAt() == null ? "" : work.getReviewedAt().format(DISPLAY_FORMAT));

        Map<String, Object> pdf = new LinkedHashMap<>();
        pdf.put("name", getPdfFileName(work));
        pdf.put("type", valueOrDefault(work.getPdfContentType(), "application/pdf"));
        pdf.put("size", getPdfSize(work));

        map.put("pdf", pdf);

        return map;
    }

    private AppUser getUser(String username) {
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Logged-in user not found.");
        }

        try {
            return appUserRepository.findById(Long.parseLong(username))
                    .orElseGet(() -> appUserRepository.findByEmail(username)
                            .orElseThrow(() -> new RuntimeException("Logged-in user not found.")));
        } catch (NumberFormatException ex) {
            return appUserRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("Logged-in user not found."));
        }
    }

    private String getPdfFileName(SubmittedWork work) {
        if (work.getPdfName() != null && !work.getPdfName().isBlank()) {
            return work.getPdfName();
        }

        if (work.getPdfOriginalName() != null && !work.getPdfOriginalName().isBlank()) {
            return work.getPdfOriginalName();
        }

        if (work.getFileName() != null && !work.getFileName().isBlank()) {
            return work.getFileName();
        }

        return "submitted-work.pdf";
    }

    private Long getPdfSize(SubmittedWork work) {
        if (work.getPdfSizeBytes() != null && work.getPdfSizeBytes() > 0) {
            return work.getPdfSizeBytes();
        }

        if (work.getPdfSize() != null && work.getPdfSize() > 0) {
            return work.getPdfSize();
        }

        if (work.getData() != null) {
            return (long) work.getData().length;
        }

        return 0L;
    }

    private String required(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new RuntimeException(message);
        }

        return value.trim();
    }

    private void validateRequired(String value, String message) {
        required(value, message);
    }

    private void validatePdf(MultipartFile pdf) {
        if (pdf == null || pdf.isEmpty()) {
            throw new RuntimeException("PDF file is required.");
        }

        String name = valueOrDefault(pdf.getOriginalFilename(), "").toLowerCase();
        String type = valueOrDefault(pdf.getContentType(), "").toLowerCase();
        boolean valid = "application/pdf".equals(type) || name.endsWith(".pdf");

        if (!valid) {
            throw new RuntimeException("Only PDF files are allowed.");
        }
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return LocalDate.now();
        }

        return LocalDate.parse(value.trim());
    }

    private String valueOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String generateSubmissionCode() {
    return "SUB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
}
}



