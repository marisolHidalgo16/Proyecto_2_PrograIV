package cr.ac.una.backendprogra.config;

import cr.ac.una.backendprogra.security.JwtAuthenticationFilter;
import cr.ac.una.backendprogra.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml",
                                "/v3/api-docs/swagger-config",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/actuator/**"
                        ).permitAll()

                        .requestMatchers("GET", "/api/personas/**").hasAnyRole("ADMINISTRADOR", "VISOR")
                        .requestMatchers("GET", "/api/oficinas/**").hasAnyRole("ADMINISTRADOR", "VISOR")

                        .requestMatchers("POST", "/api/personas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("PUT", "/api/personas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("DELETE", "/api/personas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("POST", "/api/oficinas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("PUT", "/api/oficinas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers("DELETE", "/api/oficinas/**").hasRole("ADMINISTRADOR")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}