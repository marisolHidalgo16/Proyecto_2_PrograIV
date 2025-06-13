package cr.ac.una.backendprogra.config;

import cr.ac.una.backendprogra.security.JwtAuthenticationFilter;
import cr.ac.una.backendprogra.service.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

                        // === ENDPOINTS PÚBLICOS ===
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

                        .requestMatchers(HttpMethod.GET, "/api/personas/**").hasAnyRole("ADMINISTRADOR", "VISOR")

                        .requestMatchers(HttpMethod.POST, "/api/personas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/personas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/personas/**").hasRole("ADMINISTRADOR")

                        .requestMatchers(HttpMethod.GET, "/api/oficinas/**").hasAnyRole("ADMINISTRADOR", "VISOR")

                        .requestMatchers(HttpMethod.POST, "/api/oficinas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/oficinas/**").hasRole("ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/oficinas/**").hasRole("ADMINISTRADOR")

                        .requestMatchers(HttpMethod.GET, "/api/registros/**").hasAnyRole("ADMINISTRADOR", "VISOR", "REGISTRADOR")

                        .requestMatchers(HttpMethod.POST, "/api/registros/**").hasAnyRole("ADMINISTRADOR", "REGISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/registros/**").hasAnyRole("ADMINISTRADOR", "REGISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/registros/**").hasRole("ADMINISTRADOR")

                        .requestMatchers("/api/estadisticas/**").hasAnyRole("ADMINISTRADOR", "VISOR")

                        .requestMatchers("/api/reportes/**").hasAnyRole("ADMINISTRADOR", "VISOR")

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