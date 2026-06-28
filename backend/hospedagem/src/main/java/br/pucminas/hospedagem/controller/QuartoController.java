package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.dto.DisponibilidadeQuarto;
import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.service.QuartoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/quartos")
@RequiredArgsConstructor
public class QuartoController {

    private final QuartoService service;

    @GetMapping
    public PageResponse<Quarto> listar(
            @RequestParam(required = false) String tipo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        var pageable = PageRequest.of(page, size);
        if (tipo != null && !tipo.isBlank()) return service.listarPorTipo(tipo, pageable);
        return service.listar(pageable);
    }

    // Sem paginação — alimenta dropdown do formulário de aluguel
    @GetMapping("/residencia/{residenciaId}")
    public List<Quarto> listarPorResidencia(@PathVariable Long residenciaId) {
        return service.listarPorResidencia(residenciaId);
    }

    // Grade de ocupação (quarto × dia) para a tela de Disponibilidade
    @GetMapping("/disponibilidade")
    public List<DisponibilidadeQuarto> disponibilidade(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return service.disponibilidade(inicio, fim);
    }

    @PatchMapping("/{id}/status")
    public Quarto alterarStatus(@PathVariable Long id, @RequestParam String valor) {
        return service.alterarStatus(id, valor);
    }

    @GetMapping("/{id}")
    public Quarto buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping("/individual/{residenciaId}")
    public ResponseEntity<Quarto> criarIndividual(@PathVariable Long residenciaId,
                                                   @RequestBody QuartoIndividual quarto) {
        return ResponseEntity.status(201).body(service.salvar(residenciaId, quarto));
    }

    @PostMapping("/casal/{residenciaId}")
    public ResponseEntity<Quarto> criarCasal(@PathVariable Long residenciaId,
                                              @RequestBody QuartoCasal quarto) {
        return ResponseEntity.status(201).body(service.salvar(residenciaId, quarto));
    }

    @PostMapping("/familia/{residenciaId}")
    public ResponseEntity<Quarto> criarFamilia(@PathVariable Long residenciaId,
                                                @RequestBody QuartoFamilia quarto) {
        return ResponseEntity.status(201).body(service.salvar(residenciaId, quarto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
