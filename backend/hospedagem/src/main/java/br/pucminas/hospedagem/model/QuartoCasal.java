package br.pucminas.hospedagem.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quartos_casal")
@DiscriminatorValue("CASAL")
@Getter @Setter @NoArgsConstructor
public class QuartoCasal extends Quarto {

    private static final double ADICIONAL_CAMA_CASAL = 30.0;
    private static final double ADICIONAL_QUEEN_KING  = 60.0;
    private static final double ADICIONAL_BERCO       = 25.0;

    @Column(nullable = false)
    private String tipoCama = "CASAL";

    @Column(nullable = false)
    private Boolean possuiBerco = false;

    @Override
    public String getTipo() {
        return "CASAL";
    }

    @Override
    public double calcularValorDiaria() {
        double valor = getValorBase();
        switch (tipoCama.toUpperCase()) {
            case "CASAL" -> valor += ADICIONAL_CAMA_CASAL;
            case "QUEEN", "KING" -> valor += ADICIONAL_QUEEN_KING;
        }
        if (Boolean.TRUE.equals(possuiBerco))               valor += ADICIONAL_BERCO;
        if (Boolean.TRUE.equals(getPossuiArCondicionado())) valor += 20.0;
        if (Boolean.TRUE.equals(getPossuiHidromassagem()))  valor += 20.0;
        return valor;
    }
}
