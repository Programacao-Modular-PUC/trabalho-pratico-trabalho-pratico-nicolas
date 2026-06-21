package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "alugueis")
@Getter @Setter @NoArgsConstructor
public class Aluguel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residencia_id", nullable = false)
    private Residencia residencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false)
    private LocalDateTime dataEntrada;

    @Column(nullable = false)
    private LocalDateTime dataSaida;

    @Column(nullable = false)
    private Integer quantidadeDiarias;

    @Column(nullable = false)
    private Double valorFinal;

    @OneToOne(mappedBy = "aluguel", cascade = CascadeType.ALL)
    private Pagamento pagamento;

    /**
     * Regra: diárias iniciam às 12h.
     * Entrada após 12h → conta diária completa.
     * Saída após 12h  → adiciona nova diária.
     */
    public int calcularDiarias() {
        long dias = ChronoUnit.DAYS.between(dataEntrada.toLocalDate(), dataSaida.toLocalDate());
        if (dataEntrada.getHour() >= 12) dias++;
        if (dataSaida.getHour() >= 12)   dias++;
        return (int) dias;
    }

    public double calcularValorFinal() {
        return quarto.calcularValorDiaria() * quantidadeDiarias;
    }

    public String imprimirFormulario() {
        return """
                ========== FORMULÁRIO DE ALUGUEL ==========
                Data e horário de entrada : %s
                Data e horário de saída   : %s
                Número de diárias         : %d
                Total a pagar             : R$ %.2f
                ============================================
                """.formatted(dataEntrada, dataSaida, quantidadeDiarias, valorFinal);
    }
}
