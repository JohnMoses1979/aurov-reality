package com.example.auro.service;

import com.example.auro.entity.UserAccount;
import com.example.auro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userAccountRepository;

    @Override
    public UserAccount loadUserByUsername(String username) throws UsernameNotFoundException {
        return userAccountRepository.findByLoginIdentifier(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
