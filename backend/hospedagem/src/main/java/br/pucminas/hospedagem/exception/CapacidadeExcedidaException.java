package br.pucminas.hospedagem.exception;

public class CapacidadeExcedidaException extends NegocioException {
    public CapacidadeExcedidaException(int atual, int maximo) {
        super("Número de hóspedes (" + atual + ") excede a capacidade máxima (" + maximo + ").");
    }
}
