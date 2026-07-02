package br.pucminas.hospedagem.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

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

    /** Derivado (não persistido): há aluguel ativo cobrindo o momento atual. */
    @Transient
    @JsonIgnore
    private boolean ocupado = false;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residencia_id", nullable = false)
    private Residencia residencia;

    /** URLs das fotos do quarto (galeria). Tabela: quarto_imagens. */
    @ElementCollection
    @CollectionTable(name = "quarto_imagens", joinColumns = @JoinColumn(name = "quarto_id"))
    @Column(name = "url", length = 500)
    @OrderColumn(name = "ordem")
    private List<String> imagens = new ArrayList<>();

    public abstract double calcularValorDiaria();

    /** Identifica o tipo do quarto no JSON (INDIVIDUAL, CASAL ou FAMILIA). */
    @JsonProperty("tipo")
    public abstract String getTipo();

    /** Valor da diária já calculado (base + adicionais), exposto para o frontend. */
    @JsonProperty("valorDiaria")
    public double getValorDiaria() {
        return calcularValorDiaria();
    }

    /** Status exibido: OCUPADO se há aluguel ativo agora, senão DISPONIVEL. */
    @JsonProperty("statusAtual")
    public String getStatusAtual() {
        return ocupado ? "OCUPADO" : "DISPONIVEL";
    }

    // Métodos nomeados com "obter..." (não JavaBean) de propósito: um getter
    // getResidenciaId() faria o Spring Data interpretar findByResidenciaId como
    // a propriedade 'residenciaId' (inexistente) em vez de navegar residencia.id.
    @JsonProperty("residenciaId")
    public Long obterResidenciaId() {
        return residencia != null ? residencia.getId() : null;
    }

    @JsonProperty("residenciaEndereco")
    public String obterResidenciaEndereco() {
        return residencia != null ? residencia.getEndereco() + ", " + residencia.getNumero() : null;
    }

    @JsonProperty("residenciaBairro")
    public String obterResidenciaBairro() {
        return residencia != null ? residencia.getBairro() : null;
    }
}
