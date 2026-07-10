package com.example.auro.repository;

import com.example.auro.entity.PdfTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PdfTaskRepository extends JpaRepository<PdfTask, Long> {

    List<PdfTask> findAllByOrderByCreatedAtDesc();

    List<PdfTask> findByDepartmentIgnoreCaseOrderByCreatedAtDesc(String department);

    List<PdfTask> findByDepartmentOrAssignedByRoleOrderByCreatedAtDesc(
            String department,
            String assignedByRole
    );

    /*
     * Old service support.
     */
    default List<PdfTask> findByDepartmentOrAssignedByOrderByCreatedAtDesc(
            String department,
            String assignedBy
    ) {
        return findByDepartmentOrAssignedByRoleOrderByCreatedAtDesc(department, assignedBy);
    }

    List<PdfTask> findByAssignedByRoleIgnoreCaseOrderByCreatedAtDesc(String assignedByRole);

    /*
     * Correct query for relation:
     * PdfTask.assigneeEmployee.id
     */
    @Query("""
            SELECT task
            FROM PdfTask task
            WHERE task.assigneeEmployee.id = :assigneeId
            ORDER BY task.createdAt DESC
            """)
    List<PdfTask> findByAssigneeId(@Param("assigneeId") Long assigneeId);

    /*
     * Direct employee code field:
     * PdfTask.assigneeEmployeeId
     */
    List<PdfTask> findByAssigneeEmployeeIdIgnoreCaseOrderByCreatedAtDesc(String assigneeEmployeeId);

    /*
     * Old service support.
     */
    default List<PdfTask> findByAssigneeEmployeeIdIgnoreCase(String assigneeEmployeeId) {
        return findByAssigneeEmployeeIdIgnoreCaseOrderByCreatedAtDesc(assigneeEmployeeId);
    }

    /*
     * Old/new support.
     */
    Optional<PdfTask> findByTaskCodeIgnoreCase(String taskCode);

    default Optional<PdfTask> findByTaskCode(String taskCode) {
        return findByTaskCodeIgnoreCase(taskCode);
    }
}