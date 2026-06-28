package br.pucminas.hospedagem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
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

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluguel_id", nullable = false)
    private Aluguel aluguel;

    @Column(nullable = false)
    private Double valorPago;

    private LocalDateTime dataPagamento;

    // "PENDENTE", "CONFIRMADO" ou "CANCELADO"
    @Column(nullable = false)
    private String status = "PENDENTE";

    // Como foi pago: "PIX", "CARTAO", "DINHEIRO" (null enquanto pendente)
    @Column(length = 20)
    private String formaPagamento;

    @JsonProperty("aluguelId")
    public Long getAluguelId() {
        return aluguel != null ? aluguel.getId() : null;
    }

    @JsonProperty("clienteNome")
    public String getClienteNome() {
        if (aluguel == null || aluguel.getCliente() == null) return null;
        Cliente c = aluguel.getCliente();
        String nome = c.getNome();
        return (c.getSobrenome() != null && !c.getSobrenome().isBlank())
            ? nome + " " + c.getSobrenome()
            : nome;
    }

    public void confirmarPagamento() {
        this.status = "CONFIRMADO";
        this.dataPagamento = LocalDateTime.now();
    }

    /** Registra o pagamento pelo cliente, com a forma escolhida (Pix, Cartão, etc.). */
    public void pagar(String forma) {
        this.formaPagamento = forma;
        confirmarPagamento();
    }
}
