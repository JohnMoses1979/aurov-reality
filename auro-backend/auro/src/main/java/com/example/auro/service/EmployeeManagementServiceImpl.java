package com.example.auro.service;

import com.example.auro.config.EmployeeStorageProperties;
import com.example.auro.dto.EmployeeDocumentRequest;
import com.example.auro.dto.EmployeeDocumentResponse;
import com.example.auro.dto.EmployeeManagementPageResponse;
import com.example.auro.dto.EmployeeRequest;
import com.example.auro.dto.EmployeeResponse;
import com.example.auro.entity.Employee;
import com.example.auro.entity.EmployeeDocument;
import com.example.auro.entity.UserAccount;
import com.example.auro.repository.EmployeeDocumentRepository;
import com.example.auro.repository.EmployeeRepository;
import com.example.auro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeManagementServiceImpl implements EmployeeManagementService {

    private static final List<String> SUPER_ROLE_OPTIONS = List.of(
            "Sales Manager",
            "Marketing Manager",
            "CRM Manager",
            "Accounts Manager",
            "HR Manager"
    );

    private final EmployeeRepository employeeRepository;
    private final UserRepository userAccountRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeStorageProperties storageProperties;
    private final CredentialEmailService credentialEmailService;

    @Override
    @Transactional(readOnly = true)
    public EmployeeManagementPageResponse getData(UserAccount currentUser) {
        UserAccount current = requireCurrentUser(currentUser);

        boolean canManage = canManage(current);
        List<String> roleOptions = getCreatableRoles(current);

        List<Employee> employees = isSuperUser(current.getRole())
                ? employeeRepository.findAll()
                : employeeRepository.findByDepartmentIgnoreCaseAndRoleContainingIgnoreCase(current.getDepartment(), "Executive");

        List<EmployeeResponse> employeeResponses = employees.stream()
                .sorted(Comparator.comparing(Employee::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed())
                .map(employee -> EmployeeResponse.from(employee, null))
                .toList();

        return new EmployeeManagementPageResponse(
                canManage,
                current.getRole(),
                current.getDepartment(),
                roleOptions,
                employeeResponses
        );
    }

    @Override
    @Transactional
    public EmployeeResponse create(EmployeeRequest request, List<MultipartFile> files, UserAccount currentUser) {
        UserAccount current = requireCurrentUser(currentUser);

        if (!canManage(current)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to create employees.");
        }

        validateRequest(request, null);
        validateRolePermission(current, request.role(), request.department());

        List<MultipartFile> validFiles = cleanFiles(files);
        int metadataCount = request.documents() == null ? 0 : request.documents().size();
        if (validFiles.size() + metadataCount < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Upload at least 2 employee documents.");
        }

        String normalizedEmail = normalizeEmail(request.email());
        String normalizedMobile = normalizeMobile(request.mobileNumber());

        ensureUnique(null, normalizedEmail, normalizedMobile);

        String plainPassword = StringUtils.hasText(request.password())
                ? request.password().trim()
                : defaultPassword(request.firstName());

        Employee employee = new Employee();
        employee.setFirstName(request.firstName().trim());
        employee.setLastName(normalizeOptional(request.lastName()));
        employee.setName(fullName(request.firstName(), request.lastName()));
        employee.setEmail(normalizedEmail);
        employee.setMobileNumber(normalizedMobile);
        employee.setAddress(request.address());
        employee.setDepartment(request.department().trim());
        employee.setRole(request.role().trim());
        employee.setDesignation(StringUtils.hasText(request.designation()) ? request.designation().trim() : request.role().trim());
        employee.setJoiningDate(request.joiningDate());
        employee.setUsername(generateUsername(request.firstName(), request.lastName()));
        employee.setPassword(passwordEncoder.encode(plainPassword));
        employee.setStatus("Active");
        employee.setCreatedBy(current.displayName());

        Employee saved = employeeRepository.save(employee);
        saved.setEmployeeId("EMP" + String.format(Locale.ROOT, "%05d", saved.getId()));

        saveUploadedDocuments(saved, validFiles);
        saveMetadataDocuments(saved, request.documents());

        Employee finalSaved = employeeRepository.save(saved);
        syncUserAccount(finalSaved, plainPassword, true);
        CredentialEmailService.DeliveryResult emailResult = findLinkedUserAccount(finalSaved)
                .map(account -> credentialEmailService.sendCreatedCredentials(account, plainPassword))
                .orElse(new CredentialEmailService.DeliveryResult(false, "Linked login account was not found."));

        return EmployeeResponse.from(finalSaved, plainPassword, emailResult.sent(), emailResult.message());
    }

    @Override
    @Transactional
    public EmployeeResponse update(Long employeeId, EmployeeRequest request, List<MultipartFile> files, UserAccount currentUser) {
        UserAccount current = requireCurrentUser(currentUser);

        if (!canManage(current)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update employees.");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));

        validateRequest(request, employeeId);
        validateRolePermission(current, request.role(), request.department());

        String normalizedEmail = normalizeEmail(request.email());
        String normalizedMobile = normalizeMobile(request.mobileNumber());
        ensureUnique(employeeId, normalizedEmail, normalizedMobile);

        employee.setFirstName(request.firstName().trim());
        employee.setLastName(normalizeOptional(request.lastName()));
        employee.setName(fullName(request.firstName(), request.lastName()));
        employee.setEmail(normalizedEmail);
        employee.setMobileNumber(normalizedMobile);
        employee.setAddress(request.address());
        employee.setDepartment(request.department().trim());
        employee.setRole(request.role().trim());
        employee.setDesignation(StringUtils.hasText(request.designation()) ? request.designation().trim() : request.role().trim());
        employee.setJoiningDate(request.joiningDate());

        if (StringUtils.hasText(request.status())) {
            employee.setStatus(request.status().trim());
        }

        String plainPassword = null;
        if (StringUtils.hasText(request.password())) {
            plainPassword = request.password().trim();
            employee.setPassword(passwordEncoder.encode(plainPassword));
        }

        if (request.existingDocumentIds() != null) {
            Set<Long> keepIds = new HashSet<>(request.existingDocumentIds());
            employee.getDocuments().removeIf(doc -> doc.getId() != null && !keepIds.contains(doc.getId()));
        }

        saveUploadedDocuments(employee, cleanFiles(files));
        saveMetadataDocuments(employee, request.documents());

        Employee saved = employeeRepository.save(employee);
        syncUserAccount(saved, plainPassword, false);
        if (StringUtils.hasText(plainPassword)) {
            final String updatedPassword = plainPassword;
            findLinkedUserAccount(saved)
                    .ifPresent(account -> credentialEmailService.sendUpdatedCredentials(account, updatedPassword, List.of()));
        }

        return EmployeeResponse.from(saved, plainPassword);
    }

    @Override
    @Transactional
    public void toggleStatus(Long employeeId, UserAccount currentUser) {
        requireManagerPermission(currentUser);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));

        if ("Active".equalsIgnoreCase(employee.getStatus())) {
            employee.setStatus("Inactive");
        } else {
            employee.setStatus("Active");
        }

        Employee saved = employeeRepository.save(employee);
        findLinkedUserAccount(saved).ifPresent(user -> {
            user.setActive("Active".equalsIgnoreCase(saved.getStatus()));
            userAccountRepository.save(user);
        });
    }

    @Override
    @Transactional
    public void delete(Long employeeId, UserAccount currentUser) {
        requireManagerPermission(currentUser);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));

        findLinkedUserAccount(employee).ifPresent(userAccountRepository::delete);
        employeeRepository.delete(employee);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeDocument getDocument(Long employeeId, Long documentId) {
        return employeeDocumentRepository.findByEmployee_IdAndId(employeeId, documentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found."));
    }

    @Override
    public Resource loadDocumentResource(EmployeeDocument document) {
        try {
            Path filePath = resolveDocumentPath(document);
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document file not found.");
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read document.");
        }
    }

    private void validateRequest(EmployeeRequest request, Long editingId) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee data is required.");
        }
        if (!StringUtils.hasText(request.firstName())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "First name is required.");
        }
        if (!StringUtils.hasText(request.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (!StringUtils.hasText(request.mobileNumber())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number is required.");
        }
        if (!StringUtils.hasText(request.address())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address is required.");
        }
        if (!StringUtils.hasText(request.role())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required.");
        }
        if (!StringUtils.hasText(request.department())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department is required.");
        }
        if (!StringUtils.hasText(request.designation())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Designation is required.");
        }
        if (request.joiningDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Joining date is required.");
        }

        employeeRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
                .filter(existing -> !Objects.equals(existing.getId(), editingId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists.");
                });

        employeeRepository.findByMobileNumber(normalizeMobile(request.mobileNumber()))
                .filter(existing -> !Objects.equals(existing.getId(), editingId))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number already exists.");
                });
    }

    private void requireManagerPermission(UserAccount currentUser) {
        UserAccount current = requireCurrentUser(currentUser);
        if (!canManage(current)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission.");
        }
    }

    private UserAccount requireCurrentUser(UserAccount currentUser) {
        if (currentUser == null || !StringUtils.hasText(currentUser.getUsername())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login required.");
        }

        return userAccountRepository.findByUsername(currentUser.getUsername())
                .orElse(currentUser);
    }

    private boolean canManage(UserAccount user) {
        return isSuperUser(user.getRole()) || isManagerRole(user.getRole());
    }

    private boolean isSuperUser(String role) {
        return "Managing Director".equalsIgnoreCase(role)
                || "Operations Head".equalsIgnoreCase(role)
                || "Operational Head".equalsIgnoreCase(role);
    }

    private boolean isManagerRole(String role) {
        return role != null && role.endsWith("Manager");
    }

    private List<String> getCreatableRoles(UserAccount current) {
        if (isSuperUser(current.getRole())) {
            return SUPER_ROLE_OPTIONS;
        }
        if (isManagerRole(current.getRole())) {
            String department = current.getDepartment();
            if (!StringUtils.hasText(department)) {
                return List.of();
            }
            return List.of(department + " Executive");
        }
        return List.of();
    }

    private void validateRolePermission(UserAccount current, String role, String department) {
        List<String> allowedRoles = getCreatableRoles(current);
        if (!allowedRoles.contains(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot create or update this role.");
        }

        if (isManagerRole(current.getRole())) {
            if (!Objects.equals(current.getDepartment(), department)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Managers can manage only their own department.");
            }
            if (role == null || !role.endsWith("Executive")) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Managers can create only executives.");
            }
        }
    }

    private String generateUsername(String firstName, String lastName) {
        String base = ((firstName == null ? "" : firstName) + "." + (lastName == null ? "" : lastName))
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9.]", "")
                .replaceAll("\\.+", ".")
                .replaceAll("^\\.|\\.$", "");

        if (!StringUtils.hasText(base)) {
            base = "employee";
        }

        String username = base;
        int count = 1;
        while (employeeRepository.existsByUsernameIgnoreCase(username)
                || userAccountRepository.existsByUsernameIgnoreCase(username)) {
            username = base + count;
            count++;
        }
        return username;
    }

    private String defaultPassword(String firstName) {
        String name = StringUtils.hasText(firstName) ? firstName.trim() : "Employee";
        return name.substring(0, 1).toUpperCase(Locale.ROOT) + name.substring(1) + "@123";
    }

    private String fullName(String firstName, String lastName) {
        return ((firstName == null ? "" : firstName.trim()) + " " + (lastName == null ? "" : lastName.trim())).trim();
    }

    private List<MultipartFile> cleanFiles(List<MultipartFile> files) {
        if (files == null) {
            return List.of();
        }
        return files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .toList();
    }

    private void saveUploadedDocuments(Employee employee, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        Path root = Paths.get(storageProperties.getEmployeeDocumentsDir()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to create upload directory.");
        }

        for (MultipartFile file : files) {
            String contentType = file.getContentType();
            if (!isAllowedFile(contentType, file.getOriginalFilename())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF, JPG, JPEG, and PNG files are allowed.");
            }

            String originalName = StringUtils.cleanPath(Optional.ofNullable(file.getOriginalFilename()).orElse("document"));
            if (originalName.contains("..")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name.");
            }

            String storedName = System.currentTimeMillis()
                    + "-"
                    + UUID.randomUUID()
                    + "-"
                    + originalName.replaceAll("[^a-zA-Z0-9._-]", "_");

            Path target = root.resolve(storedName).normalize();
            try {
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception exception) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to save document.");
            }

            EmployeeDocument document = EmployeeDocument.builder()
                    .employee(employee)
                    .name(originalName)
                    .fileName(storedName)
                    .type(contentType == null ? "application/octet-stream" : contentType)
                    .size(formatSize(file.getSize()))
                    .url("/uploads/employee-documents/" + storedName)
                    .build();

            employee.getDocuments().add(document);
        }
    }

    private void saveMetadataDocuments(Employee employee, List<EmployeeDocumentRequest> documents) {
        if (documents == null || documents.isEmpty()) {
            return;
        }

        Set<Long> existingIds = employee.getDocuments().stream()
                .map(EmployeeDocument::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        for (EmployeeDocumentRequest request : documents) {
            if (!StringUtils.hasText(request.name())) {
                continue;
            }
            if (request.id() != null && existingIds.contains(request.id())) {
                continue;
            }

            EmployeeDocument document = EmployeeDocument.builder()
                    .employee(employee)
                    .name(request.name())
                    .fileName(extractFileName(request.url()))
                    .size(request.size())
                    .type(request.type())
                    .url(request.url())
                    .build();

            employee.getDocuments().add(document);
        }
    }

    private boolean isAllowedFile(String contentType, String fileName) {
        String name = fileName == null ? "" : fileName.toLowerCase(Locale.ROOT);
        return "application/pdf".equalsIgnoreCase(contentType)
                || "image/jpeg".equalsIgnoreCase(contentType)
                || "image/png".equalsIgnoreCase(contentType)
                || name.endsWith(".pdf")
                || name.endsWith(".jpg")
                || name.endsWith(".jpeg")
                || name.endsWith(".png");
    }

    private String formatSize(long bytes) {
        long kb = Math.max(1, Math.round(bytes / 1024.0));
        return kb + " KB";
    }

    private Path resolveDocumentPath(EmployeeDocument document) {
        String fileName = StringUtils.hasText(document.getFileName())
                ? document.getFileName()
                : extractFileName(document.getUrl());

        if (!StringUtils.hasText(fileName)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document URL is missing.");
        }

        return Paths.get(storageProperties.getEmployeeDocumentsDir())
                .toAbsolutePath()
                .normalize()
                .resolve(fileName)
                .normalize();
    }

    private void ensureUnique(Long editingId, String email, String mobile) {
        if (userAccountRepository.existsByEmailIgnoreCase(email)) {
            findLinkedUserAccountByEmail(email)
                    .filter(account -> !matchesEmployee(editingId, account))
                    .ifPresent(account -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists.");
                    });
        }

        if (userAccountRepository.existsByMobile(mobile)) {
            userAccountRepository.findByMobile(mobile)
                    .filter(account -> !matchesEmployee(editingId, account))
                    .ifPresent(account -> {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number already exists.");
                    });
        }
    }

    private void validateUserAccountUniqueness(Employee employee, Long accountId) {
        Long safeAccountId = accountId == null ? -1L : accountId;

        if (StringUtils.hasText(employee.getUsername())
                && userAccountRepository.existsByUsernameIgnoreCaseAndIdNot(employee.getUsername(), safeAccountId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee username already exists.");
        }

        if (StringUtils.hasText(employee.getEmail())
                && userAccountRepository.existsByEmailIgnoreCaseAndIdNot(employee.getEmail(), safeAccountId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists.");
        }

        if (StringUtils.hasText(employee.getMobileNumber())
                && userAccountRepository.existsByMobileAndIdNot(employee.getMobileNumber(), safeAccountId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number already exists.");
        }

        if (StringUtils.hasText(employee.getEmployeeId())
                && userAccountRepository.existsByEmployeeIdIgnoreCaseAndIdNot(employee.getEmployeeId(), safeAccountId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Employee ID already exists.");
        }
    }

    private Optional<UserAccount> findLinkedUserAccount(Employee employee) {
        if (employee.getEmployeeId() != null && !employee.getEmployeeId().isBlank()) {
            Optional<UserAccount> byEmployeeId = userAccountRepository.findByLoginIdentifier(employee.getEmployeeId());
            if (byEmployeeId.isPresent()) {
                return byEmployeeId;
            }
        }
        if (employee.getEmail() != null && !employee.getEmail().isBlank()) {
            Optional<UserAccount> byEmail = userAccountRepository.findByLoginIdentifier(employee.getEmail());
            if (byEmail.isPresent()) {
                return byEmail;
            }
        }
        if (employee.getUsername() != null && !employee.getUsername().isBlank()) {
            Optional<UserAccount> byUsername = userAccountRepository.findByLoginIdentifier(employee.getUsername());
            if (byUsername.isPresent()) {
                return byUsername;
            }
        }
        if (employee.getMobileNumber() != null && !employee.getMobileNumber().isBlank()) {
            return userAccountRepository.findByLoginIdentifier(employee.getMobileNumber());
        }
        return Optional.empty();
    }

    private Optional<UserAccount> findLinkedUserAccountByEmail(String email) {
        return userAccountRepository.findByEmail(email);
    }

    private boolean matchesEmployee(Long employeeId, UserAccount account) {
        return employeeId != null
                && account.getEmployeeId() != null
                && account.getEmployeeId().equals("EMP" + String.format(Locale.ROOT, "%05d", employeeId));
    }

    private void syncUserAccount(Employee employee, String plainPassword, boolean createIfMissing) {
        Optional<UserAccount> existingAccount = findLinkedUserAccount(employee);
        if (existingAccount.isEmpty() && !createIfMissing) {
            return;
        }

        UserAccount account = existingAccount.orElseGet(UserAccount::new);
        validateUserAccountUniqueness(employee, account.getId());

        account.setFullName(employee.getName());
        account.setEmployeeId(employee.getEmployeeId());
        account.setUsername(employee.getUsername());
        account.setEmail(employee.getEmail());
        account.setMobile(employee.getMobileNumber());
        account.setDepartment(employee.getDepartment());
        account.setRole(employee.getRole());
        account.setAddress(employee.getAddress());
        account.setActive(!"Inactive".equalsIgnoreCase(employee.getStatus()));
        if (StringUtils.hasText(plainPassword)) {
            final String updatedPassword = plainPassword;
            account.setPasswordHash(passwordEncoder.encode(plainPassword));
        }
        userAccountRepository.save(account);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeMobile(String mobileNumber) {
        if (mobileNumber == null) {
            return "";
        }

        String digits = mobileNumber.replaceAll("\\D", "");
        if (digits.length() > 10 && digits.startsWith("91")) {
            digits = digits.substring(digits.length() - 10);
        }
        if (!digits.isBlank() && digits.length() != 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number must be 10 digits.");
        }
        return digits;
    }

    private String normalizeOptional(String value) {
        return value == null ? "" : value.trim();
    }

    private String extractFileName(String url) {
        if (!StringUtils.hasText(url)) {
            return null;
        }
        int index = url.lastIndexOf('/');
        return index >= 0 ? url.substring(index + 1) : url;
    }
}



