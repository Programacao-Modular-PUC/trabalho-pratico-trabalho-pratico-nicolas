package br.pucminas.hospedagem.exception;

public class DataInvalidaException extends NegocioException {
    public DataInvalidaException(String motivo) {
        super("Data inválida: " + motivo);
    }
}
