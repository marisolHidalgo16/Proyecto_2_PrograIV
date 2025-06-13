package cr.ac.una.backendprogra.controller;

import cr.ac.una.backendprogra.entity.Usuario;
import cr.ac.una.backendprogra.repository.UsuarioRepository;
import cr.ac.una.backendprogra.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        Optional<Usuario> user = usuarioRepository.findByUsername(usuario.getUsername());

        if (user.isPresent() && passwordEncoder.matches(usuario.getPassword(), user.get().getPassword())) {
            String token = jwtService.generateToken(usuario.getUsername(), user.get().getRole());

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.get().getUsername());
            response.put("role", user.get().getRole());

            return ResponseEntity.ok(response);
        }

        Map<String, String> error = new HashMap<>();
        error.put("error", "Credenciales incorrectas");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}