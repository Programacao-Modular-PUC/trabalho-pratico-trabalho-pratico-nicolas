package br.pucminas.hospedagem.dto;

public record LoginResponse(String token, String username, String role, Long clienteId) {}
