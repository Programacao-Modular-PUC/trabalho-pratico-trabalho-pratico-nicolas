package br.pucminas.hospedagem.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidacao(MethodArgumentNotValidException ex) {
        String mensagem = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining("; "));
        return build(HttpStatus.BAD_REQUEST, mensagem.isBlank() ? "Dados inválidos." : mensagem);
    }

    @ExceptionHandler(QuartoIndisponivelException.class)
    public ResponseEntity<Map<String, Object>> handleIndisponivel(QuartoIndisponivelException ex) {
        return build(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(CapacidadeExcedidaException.class)
    public ResponseEntity<Map<String, Object>> handleCapacidade(CapacidadeExcedidaException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
    }

    @ExceptionHandler(DataInvalidaException.class)
    public ResponseEntity<Map<String, Object>> handleDataInvalida(DataInvalidaException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(RecursoNaoPermitidoException.class)
    public ResponseEntity<Map<String, Object>> handleRecurso(RecursoNaoPermitidoException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<Map<String, Object>> handleNegocio(NegocioException ex) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenerico(Exception ex) {
        log.error("Erro não tratado na requisição", ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Erro interno: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status", status.value(),
            "erro", mensagem
        ));
    }
}
