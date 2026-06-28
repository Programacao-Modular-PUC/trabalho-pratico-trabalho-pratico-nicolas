package br.pucminas.hospedagem.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Ocupação de um quarto ao longo de um período, para a grade de Disponibilidade.
 * Cada dia tem status: DISPONIVEL, OCUPADO, RESERVADO ou MANUTENCAO.
 */
public record DisponibilidadeQuarto(
    Long quartoId,
    String tipo,
    String status,
    List<DiaStatus> dias
) {
    public record DiaStatus(LocalDate dia, String status) {}
}
