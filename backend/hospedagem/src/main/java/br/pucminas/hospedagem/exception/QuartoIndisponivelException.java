package br.pucminas.hospedagem.exception;

public class QuartoIndisponivelException extends NegocioException {
    public QuartoIndisponivelException(Long quartoId) {
        super("Quarto " + quartoId + " não está disponível no período informado.");
    }
}
