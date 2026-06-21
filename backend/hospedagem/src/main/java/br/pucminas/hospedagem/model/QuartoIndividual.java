package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quartos_individual")
@DiscriminatorValue("INDIVIDUAL")
@Getter @Setter @NoArgsConstructor
public class QuartoIndividual extends Quarto {

    private static final double ADICIONAL_POR_CAMA = 30.0;

    @Column(nullable = false)
    private Integer numeroCamas = 1;

    @Column(nullable = false)
    private Integer limiteHospedes = 1;

    @Override
    public double calcularValorDiaria() {
        double valor = getValorBase();
        if (numeroCamas > 1) {
            valor += ADICIONAL_POR_CAMA * (numeroCamas - 1);
        }
        if (Boolean.TRUE.equals(getPossuiArCondicionado())) valor += 20.0;
        if (Boolean.TRUE.equals(getPossuiHidromassagem()))  valor += 20.0;
        return valor;
    }
}
