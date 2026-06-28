package br.pucminas.hospedagem.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegistroRequest(
    @NotBlank(message = "Nome de usuário é obrigatório") String username,
    @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres") String password,
    @NotBlank(message = "Nome é obrigatório") String nome,
    @NotBlank(message = "Sobrenome é obrigatório") String sobrenome,
    @NotBlank(message = "CPF é obrigatório") String cpf,
    @NotBlank(message = "E-mail é obrigatório") @Email(message = "E-mail inválido") String email,
    @NotBlank(message = "Telefone é obrigatório") String telefone,
    @NotBlank(message = "Endereço é obrigatório") String endereco,
    String cep,
    String dataNascimento
) {}
