package com.example.auro.repository;

 
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.auro.entity.ManagerTask;

public interface ManagerTaskRepository extends JpaRepository<ManagerTask, Long> {

    List<ManagerTask> findAllByOrderByCreatedAtDesc();

    List<ManagerTask> findByAssigneeUsernameOrderByCreatedAtDesc(String assigneeUsername);
}
