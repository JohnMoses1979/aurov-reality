package com.example.auro.config;

import com.example.auro.security.JwtAuthenticationFilter;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/uploads/**", "/api/auth/**", "/api/public/**", "/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customer/book-property").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/bookings").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/home").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/site-visit-options").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customer/site-visits").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/site-visits").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/contact-options").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customer/contact-requests").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/customer/properties-page").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/razorpay/create-order").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/razorpay/verify").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/site-visits", "/api/property-reservations", "/api/complaints/customer").permitAll()
                        .requestMatchers("/api/admin/**").hasAnyAuthority("Managing Director", "Operational Head")
                        .requestMatchers("/api/sales/pdf-tasks/**").hasAuthority("Sales Manager")
                        .requestMatchers("/api/submitted-works/**").authenticated()
                        .requestMatchers("/api/mail/**").authenticated()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
