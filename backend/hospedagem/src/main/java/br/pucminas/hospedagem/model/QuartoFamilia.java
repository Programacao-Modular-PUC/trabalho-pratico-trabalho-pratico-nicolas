package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "quartos_familia")
@DiscriminatorValue("FAMILIA")
@Getter @Setter @NoArgsConstructor
public class QuartoFamilia extends Quarto {

    private static final double PERCENTUAL_POR_HOSPEDE = 0.15;
    private static final double DESCONTO_PEQUENO  = 0.05;
    private static final double DESCONTO_MEDIO    = 0.10;
    private static final double DESCONTO_GRANDE   = 0.15;

    @Column(nullable = false)
    private Integer capacidadeMaxima;

    @Column(nullable = false)
    private Integer quantidadeAmbientes = 1;

    @Column(nullable = false)
    private Integer numeroHospedes;

    @ElementCollection
    @CollectionTable(name = "quarto_familia_camas", joinColumns = @JoinColumn(name = "quarto_id"))
    @Column(name = "tipo_cama")
    private List<String> listaCamas;

    @Override
    public double calcularValorDiaria() {
        double valor = getValorBase() * (1 + PERCENTUAL_POR_HOSPEDE * numeroHospedes);
        valor -= valor * calcularDesconto();
        if (Boolean.TRUE.equals(getPossuiArCondicionado())) valor += 20.0;
        if (Boolean.TRUE.equals(getPossuiHidromassagem()))  valor += 20.0;
        return valor;
    }

    public double calcularDesconto() {
        if (numeroHospedes >= 7)      return DESCONTO_GRANDE;
        else if (numeroHospedes >= 5) return DESCONTO_MEDIO;
        else if (numeroHospedes >= 3) return DESCONTO_PEQUENO;
        else                          return 0.0;
    }
}
