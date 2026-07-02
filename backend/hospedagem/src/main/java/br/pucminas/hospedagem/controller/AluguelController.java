package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Aluguel;
import br.pucminas.hospedagem.model.Usuario;
import br.pucminas.hospedagem.service.AluguelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/alugueis")
@RequiredArgsConstructor
public class AluguelController {

    private final AluguelService service;

    @GetMapping
    public PageResponse<Aluguel> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Usuario usuario) {

        var pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // CLIENTE só vê os próprios aluguéis
        if ("ROLE_CLIENTE".equals(usuario.getRole()) && usuario.getClienteId() != null) {
            return service.listarPorCliente(usuario.getClienteId(), pageable);
        }
        return service.listar(pageable);
    }

    @GetMapping("/{id}")
    public Aluguel buscar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        Aluguel aluguel = service.buscarPorId(id);
        if ("ROLE_CLIENTE".equals(usuario.getRole())) {
            if (aluguel.getCliente() == null || !aluguel.getCliente().getId().equals(usuario.getClienteId())) {
                throw new NegocioException("Você só pode acessar os seus próprios aluguéis.");
            }
        }
        return aluguel;
    }

    @GetMapping("/residencia/{residenciaId}")
    public List<Aluguel> listarPorResidencia(@PathVariable Long residenciaId) {
        return service.listarPorResidencia(residenciaId);
    }

    @GetMapping("/cliente/{clienteId}")
    public PageResponse<Aluguel> listarPorCliente(
            @PathVariable Long clienteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal Usuario usuario) {

        // CLIENTE só pode consultar os próprios aluguéis
        if ("ROLE_CLIENTE".equals(usuario.getRole()) && !clienteId.equals(usuario.getClienteId())) {
            throw new NegocioException("Você não tem permissão para acessar os aluguéis de outro cliente.");
        }

        var pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return service.listarPorCliente(clienteId, pageable);
    }

    @PostMapping("/residencia/{residenciaId}/quarto/{quartoId}/cliente/{clienteId}")
    public ResponseEntity<Aluguel> realizar(
            @PathVariable Long residenciaId,
            @PathVariable Long quartoId,
            @PathVariable Long clienteId,
            @RequestBody Aluguel dados,
            @AuthenticationPrincipal Usuario usuario) {

        // CLIENTE só pode criar aluguel para si mesmo
        if ("ROLE_CLIENTE".equals(usuario.getRole()) && !clienteId.equals(usuario.getClienteId())) {
            throw new NegocioException("Você só pode criar aluguéis para sua própria conta.");
        }

        return ResponseEntity.status(201).body(
            service.realizar(residenciaId, quartoId, clienteId, dados)
        );
    }

    @PatchMapping("/{id}/cancelar")
    public Aluguel cancelar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuario) {
        // CLIENTE só pode cancelar o próprio aluguel
        if ("ROLE_CLIENTE".equals(usuario.getRole())) {
            Aluguel aluguel = service.buscarPorId(id);
            if (aluguel.getCliente() == null || !aluguel.getCliente().getId().equals(usuario.getClienteId())) {
                throw new NegocioException("Você só pode cancelar seus próprios aluguéis.");
            }
        }
        return service.cancelar(id);
    }
}
