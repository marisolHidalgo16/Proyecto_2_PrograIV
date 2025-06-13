package cr.ac.una.backendprogra.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "registro_entrada_salida")
public class RegistroEntradaSalida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "persona_id", nullable = false)
    private Persona persona;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "oficina_id", nullable = false)
    private Oficina oficina;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipoMovimiento;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "observaciones")
    private String observaciones;

    @Column(name = "usuario_registro")
    private String usuarioRegistro; // Quien registró el movimiento

    public enum TipoMovimiento {
        ENTRADA, SALIDA
    }

    public RegistroEntradaSalida() {}

    public RegistroEntradaSalida(Persona persona, Oficina oficina, TipoMovimiento tipoMovimiento, String usuarioRegistro) {
        this.persona = persona;
        this.oficina = oficina;
        this.tipoMovimiento = tipoMovimiento;
        this.fechaHora = LocalDateTime.now();
        this.usuarioRegistro = usuarioRegistro;
    }

    public RegistroEntradaSalida(Persona persona, Oficina oficina, TipoMovimiento tipoMovimiento,
                                 LocalDateTime fechaHora, String observaciones, String usuarioRegistro) {
        this.persona = persona;
        this.oficina = oficina;
        this.tipoMovimiento = tipoMovimiento;
        this.fechaHora = fechaHora != null ? fechaHora : LocalDateTime.now();
        this.observaciones = observaciones;
        this.usuarioRegistro = usuarioRegistro;
    }
}
