package com.example.auro.repository;

import com.example.auro.entity.SubmittedWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SubmittedWorkRepository extends JpaRepository<SubmittedWork, Long> {

    /*
     * Leadership / MD / Operational Head
     */
    List<SubmittedWork> findAllByOrderByCreatedAtDesc();

    /*
     * Manager own submitted works
     */
    List<SubmittedWork> findByManagerUsernameOrderByCreatedAtDesc(String managerUsername);

    /*
     * Employee based filtering
     */
    List<SubmittedWork> findByEmployeeIdOrderByCreatedAtDesc(String employeeId);

    List<SubmittedWork> findByEmployeeEmailOrderByCreatedAtDesc(String employeeEmail);

    /*
     * Department filtering
     */
    List<SubmittedWork> findByDepartmentOrderByCreatedAtDesc(String department);

    /*
     * Date based filtering
     */
    List<SubmittedWork> findBySubmissionDate(LocalDate submissionDate);

    List<SubmittedWork> findBySubmissionDateOrderByCreatedAtDesc(LocalDate submissionDate);

    /*
     * Department + date reports
     */
    List<SubmittedWork> findByDepartmentAndSubmissionDateOrderByCreatedAtDesc(
            String department,
            LocalDate submissionDate
    );

    /*
     * Manager + date reports
     */
    List<SubmittedWork> findByManagerUsernameAndSubmissionDateOrderByCreatedAtDesc(
            String managerUsername,
            LocalDate submissionDate
    );

    /*
     * Status filtering
     */
    List<SubmittedWork> findByStatusOrderByCreatedAtDesc(String status);

    List<SubmittedWork> findByDepartmentAndStatusOrderByCreatedAtDesc(
            String department,
            String status
    );
}