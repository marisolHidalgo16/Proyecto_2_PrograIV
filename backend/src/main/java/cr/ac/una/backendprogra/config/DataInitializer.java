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

                Usuario admin = new Usuario("admin", passwordEncoder.encode("1234"), "ROLE_ADMINISTRADOR");

                Usuario registrador = new Usuario("registrador", passwordEncoder.encode("12345"), "ROLE_REGISTRADOR");

                Usuario visor = new Usuario("visor", passwordEncoder.encode("123456"), "ROLE_VISOR");

                usuarioRepository.save(admin);
                usuarioRepository.save(registrador);
                usuarioRepository.save(visor);

                System.out.println("Usuarios creados:");
                System.out.println("- admin / 1234 (ADMINISTRADOR)");
                System.out.println("- registrador / 12345 (REGISTRADOR)");
                System.out.println("- visor / 123456 (VISOR)");
            }
        };
    }
}