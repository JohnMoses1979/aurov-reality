package com.example.auro.service;

import com.example.auro.dto.EmployeeManagementPageResponse;
import com.example.auro.dto.EmployeeRequest;
import com.example.auro.dto.EmployeeResponse;
import com.example.auro.entity.EmployeeDocument;
import com.example.auro.entity.UserAccount;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EmployeeManagementService {

    EmployeeManagementPageResponse getData(UserAccount currentUser);

    EmployeeResponse create(EmployeeRequest request, List<MultipartFile> documents, UserAccount currentUser);

    EmployeeResponse update(Long employeeId, EmployeeRequest request, List<MultipartFile> documents, UserAccount currentUser);

    void toggleStatus(Long employeeId, UserAccount currentUser);

    void delete(Long employeeId, UserAccount currentUser);

    EmployeeDocument getDocument(Long employeeId, Long documentId);

    Resource loadDocumentResource(EmployeeDocument document);
}
