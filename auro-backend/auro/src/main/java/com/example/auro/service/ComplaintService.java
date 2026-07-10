package com.example.auro.service;

import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.auro.dto.ComplaintResponse;
import com.example.auro.dto.ComplaintStatusUpdateRequest;
import com.example.auro.entity.Complaint;
import com.example.auro.entity.ComplaintAttachment;
import com.example.auro.entity.ComplaintStatusHistory;
import com.example.auro.entity.UserAccount;
import com.example.auro.repository.ComplaintRepository;
import com.example.auro.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private static final String TARGET_MANAGER = "Sales Manager";
    private static final String TARGET_MD = "Managing Director";
    private static final String TARGET_OH = "Operational Head";
    private static final String TARGET_LEADERSHIP = "Leadership";

    private final ComplaintRepository complaintRepository;
    private final ComplaintFileStorageService fileStorageService;
    private final NotificationService notificationService;

    public ComplaintResponse createEmployeeComplaint(
            String target,
            String subject,
            String description,
            String priority,
            String department,
            String employeeId,
            String employeeName,
            String employeeRole,
            List<MultipartFile> attachments,
            Authentication authentication
    ) {
        UserAccount currentUser = currentUser(authentication);
        String createdBy = currentUser != null ? currentUser.displayName() : employeeName;
        String normalizedTarget = normalizeTarget(target, department);
        String targetLabel = targetLabel(normalizedTarget, department);

        Complaint complaint = Complaint.builder()
                .sourceType("EMPLOYEE")
                .target(normalizedTarget)
                .targetLabel(targetLabel)
                .raisedBy(currentUser)
                .department(safeDepartment(department, currentUser))
                .employeeId(firstNonBlank(employeeId, currentUser == null ? null : currentUser.getEmployeeId(), currentUser == null || currentUser.getId() == null ? null : String.valueOf(currentUser.getId())))
                .employeeName(firstNonBlank(employeeName, currentUser == null ? null : currentUser.getFullName(), currentUser == null ? null : currentUser.displayName()))
                .employeeRole(firstNonBlank(employeeRole, currentUser == null ? null : currentUser.getRole()))
                .priority(firstNonBlank(priority, "Medium"))
                .subject(firstNonBlank(subject, "Complaint"))
                .description(firstNonBlank(description, ""))
                .status("Pending")
                .createdBy(createdBy)
                .attachments(saveAttachments(attachments))
                .statusHistory(new ArrayList<>())
                .build();

        attachChildren(complaint);

        Complaint saved = complaintRepository.save(complaint);
        saved.setComplaintCode("CMP" + String.format("%05d", saved.getId()));
        saved = complaintRepository.save(saved);

        notifyComplaintCreated(saved, createdBy);

        return ComplaintResponse.fromEntity(saved);
    }

    public ComplaintResponse createCustomerComplaint(
            String customerName,
            String customerPhone,
            String customerEmail,
            String subject,
            String description,
            String priority,
            List<MultipartFile> attachments
    ) {
        Complaint complaint = Complaint.builder()
                .sourceType("CUSTOMER")
                .target(TARGET_LEADERSHIP)
                .targetLabel("Customer Complaint")
                .department("Customers")
                .customerName(customerName)
                .customerPhone(customerPhone)
                .customerEmail(customerEmail)
                .employeeId("-")
                .employeeName(customerName)
                .employeeRole("Customer")
                .priority(priority)
                .subject(subject)
                .description(description)
                .status("Pending")
                .createdBy(customerName)
                .attachments(saveAttachments(attachments))
                .statusHistory(new ArrayList<>())
                .build();

        attachChildren(complaint);

        Complaint saved = complaintRepository.save(complaint);
        saved.setComplaintCode("CUSCMP" + String.format("%05d", saved.getId()));
        saved = complaintRepository.save(saved);

        notificationService.notifyRoles(
                List.of("Managing Director", "Operational Head"),
                "Complaint",
                "New customer complaint received",
                customerName + " raised a customer complaint: " + subject + ".",
                "COMPLAINT",
                String.valueOf(saved.getId())
        );
        notificationService.notifyCustomerByPhone(
                customerPhone,
                "Complaint",
                "Complaint submitted successfully",
                "Your complaint \"" + subject + "\" has been submitted to leadership.",
                "COMPLAINT",
                String.valueOf(saved.getId())
        );

        return ComplaintResponse.fromEntity(saved);
    }

    public List<ComplaintResponse> getAll(
            String department,
            String status,
            String employeeId,
            String employeeName,
            String fromDate,
            String toDate,
            String search,
            Authentication authentication
    ) {
        return complaintRepository.findAll()
                .stream()
                .filter(item -> canView(item, authentication))
                .filter(item -> department == null || department.isBlank() || department.equalsIgnoreCase(item.getDepartment()))
                .filter(item -> status == null || status.isBlank() || status.equalsIgnoreCase(item.getStatus()))
                .filter(item -> employeeId == null || employeeId.isBlank() || contains(item.getEmployeeId(), employeeId))
                .filter(item -> employeeName == null || employeeName.isBlank() || contains(item.getEmployeeName(), employeeName))
                .filter(item -> dateMatches(item, fromDate, toDate))
                .filter(item -> search == null || search.isBlank() || matchesSearch(item, search))
                .map(ComplaintResponse::fromEntity)
                .toList();
    }

    public ComplaintResponse getById(Long id, Authentication authentication) {
        Complaint complaint = findComplaint(id);

        if (!canView(complaint, authentication)) {
            throw new AccessDeniedException("You cannot view this complaint");
        }

        return ComplaintResponse.fromEntity(complaint);
    }

    public ComplaintResponse updateStatus(
            Long id,
            ComplaintStatusUpdateRequest request,
            Authentication authentication
    ) {
        Complaint complaint = findComplaint(id);

        if (!canUpdateComplaint(complaint, authentication)) {
            throw new AccessDeniedException("You cannot update complaint status");
        }

        String status = request.getStatus();

        if (
                !"Pending".equalsIgnoreCase(status) &&
                !"In Progress".equalsIgnoreCase(status) &&
                !"Resolved".equalsIgnoreCase(status) &&
                !"Closed".equalsIgnoreCase(status)
        ) {
            throw new RuntimeException("Allowed statuses: Pending, In Progress, Resolved, Closed");
        }

        complaint.setStatus(status);
        complaint.setRemarks(request.getNote());

        if ("Resolved".equalsIgnoreCase(status) || "Closed".equalsIgnoreCase(status)) {
            complaint.setResolutionNotes(request.getNote());
        }

        ComplaintStatusHistory statusHistory = history(status, request.getNote(), authentication.getName());
        statusHistory.setComplaint(complaint);
        complaint.getStatusHistory().add(statusHistory);

        Complaint saved = complaintRepository.save(complaint);

        notifyComplaintStatusUpdated(saved, status);

        return ComplaintResponse.fromEntity(saved);
    }

    public void delete(Long id, Authentication authentication) {
        if (!isLeadership(authentication)) {
            throw new AccessDeniedException("Only leadership can delete complaints");
        }

        Complaint complaint = findComplaint(id);
        complaintRepository.delete(complaint);
    }

    public Resource getAttachment(Long complaintId, String attachmentId, Authentication authentication) {
        Complaint complaint = findComplaint(complaintId);

        if (!canView(complaint, authentication)) {
            throw new AccessDeniedException("You cannot view this attachment");
        }

        Long parsedAttachmentId = Long.valueOf(attachmentId);

        ComplaintAttachment attachment = complaint.getAttachments()
                .stream()
                .filter(item -> parsedAttachmentId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        try {
            return new UrlResource(Path.of(attachment.getFilePath()).toUri());
        } catch (Exception e) {
            throw new RuntimeException("Unable to read attachment");
        }
    }

    public ComplaintAttachment getAttachmentInfo(Long complaintId, String attachmentId) {
        Complaint complaint = findComplaint(complaintId);
        Long parsedAttachmentId = Long.valueOf(attachmentId);

        return complaint.getAttachments()
                .stream()
                .filter(item -> parsedAttachmentId.equals(item.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    private Complaint findComplaint(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
    }

    private void attachChildren(Complaint complaint) {
        if (complaint.getAttachments() != null) {
            complaint.getAttachments().forEach(item -> item.setComplaint(complaint));
        }
        if (complaint.getStatusHistory() != null) {
            complaint.getStatusHistory().forEach(item -> item.setComplaint(complaint));
        }
    }

    private List<ComplaintAttachment> saveAttachments(List<MultipartFile> files) {
        List<ComplaintAttachment> saved = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return saved;
        }

        for (MultipartFile file : files) {
            ComplaintAttachment attachment = fileStorageService.saveAttachment(file);

            if (attachment != null) {
                saved.add(attachment);
            }
        }

        return saved;
    }

    private ComplaintStatusHistory history(String status, String note, String updatedBy) {
        return ComplaintStatusHistory.builder()
                .status(status)
                .note(note == null || note.isBlank() ? status : note)
                .updatedBy(updatedBy)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private boolean contains(String value, String query) {
        if (value == null) return false;
        return value.toLowerCase().contains(query.toLowerCase());
    }

    private boolean dateMatches(Complaint item, String fromDate, String toDate) {
        if (item.getCreatedAt() == null) return true;

        LocalDate created = item.getCreatedAt().toLocalDate();

        if (fromDate != null && !fromDate.isBlank() && created.isBefore(LocalDate.parse(fromDate))) {
            return false;
        }

        if (toDate != null && !toDate.isBlank() && created.isAfter(LocalDate.parse(toDate))) {
            return false;
        }

        return true;
    }

    private boolean matchesSearch(Complaint item, String search) {
        String q = search.toLowerCase();

        String content = String.join(" ",
                safe(item.getComplaintCode()),
                safe(item.getEmployeeId()),
                safe(item.getEmployeeName()),
                safe(item.getCustomerName()),
                safe(item.getDepartment()),
                safe(item.getEmployeeRole()),
                safe(item.getSubject()),
                safe(item.getDescription()),
                safe(item.getStatus()),
                safe(item.getTargetLabel()),
                safe(item.getTarget())
        ).toLowerCase();

        return content.contains(q);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private boolean canView(Complaint complaint, Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        UserAccount currentUser = currentUser(authentication);
        String role = currentRole(authentication);
        String normalizedRole = normalizeRole(role);
        String normalizedTarget = normalizeRole(complaint.getTarget());

        if (isLeadership(authentication)) {
            if ("CUSTOMER".equalsIgnoreCase(complaint.getSourceType())) {
                return true;
            }

            if (normalizedRole.contains("MANAGING_DIRECTOR")) {
                return normalizedTarget.equals(normalizeRole(TARGET_MD))
                        || normalizedTarget.equals(normalizeRole(TARGET_LEADERSHIP));
            }

            if (normalizedRole.contains("OPERATIONAL_HEAD")) {
                return normalizedTarget.equals(normalizeRole(TARGET_OH))
                        || normalizedTarget.equals(normalizeRole(TARGET_LEADERSHIP));
            }
        }

        if (isManagerRole(role)) {
            if (currentUser != null
                    && complaint.getRaisedBy() != null
                    && complaint.getRaisedBy().getId() != null
                    && complaint.getRaisedBy().getId().equals(currentUser.getId())) {
                return true;
            }

            return complaint.getDepartment() != null
                    && complaint.getDepartment().equalsIgnoreCase(roleToDepartment(role))
                    && isManagerTargetForRole(complaint, role);
        }

        if (currentUser == null) {
            return false;
        }

        if (complaint.getRaisedBy() != null && complaint.getRaisedBy().getId() != null) {
            return complaint.getRaisedBy().getId().equals(currentUser.getId());
        }

        return matchesIgnoreCase(complaint.getEmployeeId(), currentUser.getEmployeeId())
                || matchesIgnoreCase(complaint.getEmployeeName(), currentUser.getFullName())
                || matchesIgnoreCase(complaint.getEmployeeName(), currentUser.displayName())
                || matchesIgnoreCase(complaint.getCreatedBy(), currentUser.displayName());
    }

    private boolean canUpdateComplaint(Complaint complaint, Authentication authentication) {
        if (authentication == null) {
            return false;
        }

        if (isLeadership(authentication)) {
            return canView(complaint, authentication);
        }

        return isManagerRole(currentRole(authentication)) && canView(complaint, authentication);
    }

    private boolean isLeadership(Authentication authentication) {
        String role = normalizeRole(currentRole(authentication));
        return role.contains("MANAGING_DIRECTOR") || role.contains("OPERATIONAL_HEAD");
    }

    private String roleToDepartment(String role) {
        String normalized = normalizeRole(role);
        if (normalized.contains("SALES")) return "Sales";
        if (normalized.contains("MARKETING")) return "Marketing";
        if (normalized.contains("CRM")) return "CRM";
        if (normalized.contains("ACCOUNTS")) return "Accounts";
        if (normalized.contains("HR")) return "HR";
        return "";
    }

    private UserAccount currentUser(Authentication authentication) {
        if (authentication == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal userPrincipal) {
            return userPrincipal.getUser();
        }
        if (principal instanceof UserAccount userAccount) {
            return userAccount;
        }
        return null;
    }

    private String currentRole(Authentication authentication) {
        if (authentication == null) {
            return "";
        }

        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");
    }

    private boolean isManagerRole(String role) {
        return normalizeRole(role).contains("MANAGER");
    }

    private String normalizeRole(String role) {
        return role == null ? "" : role.trim().toUpperCase().replace(" ", "_");
    }

    private boolean isManagerTargetForRole(Complaint complaint, String role) {
        String normalizedTarget = normalizeRole(complaint.getTarget());
        String normalizedRole = normalizeRole(role);

        if (normalizedTarget.equals(normalizeRole("Manager")) || normalizedTarget.isBlank()) {
            return true;
        }

        return normalizedRole.contains(normalizedTarget)
                || normalizedTarget.equals(normalizeRole(targetManagerForDepartment(complaint.getDepartment())));
    }

    private String normalizeTarget(String target, String department) {
        String normalized = normalizeRole(target);

        if (normalized.isBlank() || normalized.equals(normalizeRole(TARGET_LEADERSHIP))) {
            return TARGET_LEADERSHIP;
        }

        if (normalized.equals(normalizeRole("Manager"))) {
            return targetManagerForDepartment(department);
        }

        if (normalized.contains("MANAGING_DIRECTOR")) {
            return TARGET_MD;
        }

        if (normalized.contains("OPERATIONAL_HEAD") || normalized.contains("OPERATIONS_HEAD")) {
            return TARGET_OH;
        }

        if (normalized.contains("MANAGER")) {
            return targetManagerForDepartment(department);
        }

        return TARGET_LEADERSHIP;
    }

    private String targetLabel(String target, String department) {
        String normalized = normalizeRole(target);

        if (normalized.equals(normalizeRole(TARGET_MD))) {
            return TARGET_MD;
        }

        if (normalized.equals(normalizeRole(TARGET_OH))) {
            return TARGET_OH;
        }

        if (normalized.contains("MANAGER")) {
            return targetManagerForDepartment(department);
        }

        return "Managing Director, Operational Head";
    }

    private String targetManagerForDepartment(String department) {
        String safeDepartment = department == null ? "" : department.trim();
        if (safeDepartment.isBlank()) {
            return "Department Manager";
        }
        return safeDepartment + " Manager";
    }

    private String safeDepartment(String department, UserAccount currentUser) {
        return firstNonBlank(department, currentUser == null ? null : currentUser.getDepartment(), "General");
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }

        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }

        return null;
    }

    private void notifyComplaintCreated(Complaint complaint, String createdBy) {
        String normalizedTarget = normalizeTarget(complaint.getTarget(), complaint.getDepartment());
        String title = "New complaint received";
        String message = createdBy + " raised complaint: " + complaint.getSubject() + ".";

        if (TARGET_LEADERSHIP.equalsIgnoreCase(normalizedTarget)) {
            notificationService.notifyRoles(
                    List.of(TARGET_MD, TARGET_OH),
                    "Complaint",
                    title,
                    message,
                    "COMPLAINT",
                    String.valueOf(complaint.getId())
            );
            return;
        }

        notificationService.notifyRole(
                normalizedTarget,
                "Complaint",
                title,
                message,
                "COMPLAINT",
                String.valueOf(complaint.getId())
        );
    }

    private void notifyComplaintStatusUpdated(Complaint complaint, String status) {
        if ("CUSTOMER".equalsIgnoreCase(complaint.getSourceType())) {
            notificationService.notifyCustomerByPhone(
                    complaint.getCustomerPhone(),
                    "Complaint Update",
                    "Your complaint was updated",
                    complaint.getSubject() + " is now " + status + ".",
                    "COMPLAINT",
                    String.valueOf(complaint.getId())
            );
            return;
        }

        if (complaint.getRaisedBy() != null && complaint.getRaisedBy().getId() != null) {
            notificationService.notifyUserId(
                    complaint.getRaisedBy().getId(),
                    "Complaint Update",
                    "Your complaint was updated",
                    complaint.getSubject() + " is now " + status + ".",
                    "COMPLAINT",
                    String.valueOf(complaint.getId())
            );
            return;
        }

        notificationService.notifyUserByIdentifier(
                complaint.getEmployeeId(),
                "Complaint Update",
                "Your complaint was updated",
                complaint.getSubject() + " is now " + status + ".",
                "COMPLAINT",
                String.valueOf(complaint.getId())
        );
    }

    private boolean matchesIgnoreCase(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }
}
