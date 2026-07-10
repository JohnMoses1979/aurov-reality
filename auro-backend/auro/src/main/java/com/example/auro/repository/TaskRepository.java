package com.example.auro.repository;

import com.example.auro.entity.TaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<TaskEntity, String> {

    List<TaskEntity> findByAssigneeIdIgnoreCase(String assigneeId);

    List<TaskEntity> findByAssigneeEmployeeIdIgnoreCase(String employeeId);

    List<TaskEntity> findByAssigneeUsernameIgnoreCase(String username);

    List<TaskEntity> findByAssigneeEmailIgnoreCase(String email);
}
