package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "residencias")
@Getter @Setter @NoArgsConstructor
public class Residencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String endereco;

    @Column(nullable = false)
    private String numero;

    @Column(nullable = false)
    private String bairro;

    @Column(nullable = false, length = 9)
    private String cep;

    @Column(nullable = false)
    private String telefone;

    @Column(nullable = false)
    private String email;

    @OneToMany(mappedBy = "residencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Quarto> quartos = new ArrayList<>();

    @OneToMany(mappedBy = "residencia", cascade = CascadeType.ALL)
    private List<Aluguel> historico = new ArrayList<>();

    public void adicionarQuarto(Quarto quarto) {
        quarto.setResidencia(this);
        quartos.add(quarto);
    }

    public void adicionarAluguel(Aluguel aluguel) {
        historico.add(aluguel);
    }
}
