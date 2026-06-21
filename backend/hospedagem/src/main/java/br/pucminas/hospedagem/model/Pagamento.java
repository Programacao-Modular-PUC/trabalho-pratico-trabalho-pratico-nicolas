package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagamentos")
@Getter @Setter @NoArgsConstructor
public class Pagamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluguel_id", nullable = false)
    private Aluguel aluguel;

    @Column(nullable = false)
    private Double valorPago;

    private LocalDateTime dataPagamento;

    @Column(nullable = false)
    private String status = "PENDENTE"; // "PENDENTE" ou "CONFIRMADO"

    public void confirmarPagamento() {
        this.status = "CONFIRMADO";
        this.dataPagamento = LocalDateTime.now();
    }
}
