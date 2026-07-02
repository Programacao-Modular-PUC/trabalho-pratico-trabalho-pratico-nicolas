package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Cliente;
import br.pucminas.hospedagem.model.Usuario;
import br.pucminas.hospedagem.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService service;

    @GetMapping
    public PageResponse<Cliente> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return service.listar(PageRequest.of(page, size));
    }

    // ----- Próprio cliente logado (tela "Minha Conta") -----
    @GetMapping("/me")
    public Cliente meusDados(@AuthenticationPrincipal Usuario usuario) {
        return service.buscarPorId(clienteIdDe(usuario));
    }

    @PutMapping("/me")
    public Cliente atualizarMeusDados(@AuthenticationPrincipal Usuario usuario, @RequestBody Cliente dados) {
        return service.atualizar(clienteIdDe(usuario), dados);
    }

    private Long clienteIdDe(Usuario usuario) {
        Long id = usuario.getClienteId();
        if (id == null) {
            throw new NegocioException("Este usuário não possui um cadastro de cliente vinculado.");
        }
        return id;
    }

    @GetMapping("/{id}")
    public Cliente buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Cliente> criar(@RequestBody Cliente cliente) {
        return ResponseEntity.status(201).body(service.salvar(cliente));
    }

    @PutMapping("/{id}")
    public Cliente atualizar(@PathVariable Long id, @RequestBody Cliente dados) {
        return service.atualizar(id, dados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
