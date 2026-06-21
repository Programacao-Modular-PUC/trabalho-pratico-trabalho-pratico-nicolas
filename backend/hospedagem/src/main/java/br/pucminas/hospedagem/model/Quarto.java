package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo_quarto", discriminatorType = DiscriminatorType.STRING)
@Table(name = "quartos")
@Getter @Setter @NoArgsConstructor
public abstract class Quarto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double valorBase;

    @Column(nullable = false)
    private Boolean possuiArCondicionado = false;

    @Column(nullable = false)
    private Boolean possuiHidromassagem = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residencia_id", nullable = false)
    private Residencia residencia;

    public abstract double calcularValorDiaria();
}
