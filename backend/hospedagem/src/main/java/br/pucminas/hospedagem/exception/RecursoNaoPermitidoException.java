package br.pucminas.hospedagem.exception;

public class RecursoNaoPermitidoException extends NegocioException {
    public RecursoNaoPermitidoException(String recurso, String tipoQuarto) {
        super("Recurso '" + recurso + "' não é permitido para quarto do tipo " + tipoQuarto + ".");
    }
}
