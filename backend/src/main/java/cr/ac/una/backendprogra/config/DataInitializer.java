package cr.ac.una.backendprogra.config;

import cr.ac.una.backendprogra.entity.Usuario;
import cr.ac.una.backendprogra.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            if (usuarioRepository.count() == 0) {
                Usuario admin = new Usuario("admin", passwordEncoder.encode("1234"), "ROLE_ADMIN");
                Usuario user = new Usuario("user", passwordEncoder.encode("1234"), "ROLE_USER");
                usuarioRepository.save(admin);
                usuarioRepository.save(user);
                System.out.println("Usuarios iniciales creados con contraseñas encriptadas");
            }
        };
    }
}