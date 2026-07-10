package com.example.auro.security;

 
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.auro.entity.Employee;
import com.example.auro.repository.EmployeeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Employee not found"));

        String role = employee.getRole()
                .toUpperCase()
                .replace(" ", "_");

        return new User(
                employee.getUsername(),
                employee.getPassword(),
                "Active".equalsIgnoreCase(employee.getStatus()),
                true,
                true,
                true,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
    }
}
