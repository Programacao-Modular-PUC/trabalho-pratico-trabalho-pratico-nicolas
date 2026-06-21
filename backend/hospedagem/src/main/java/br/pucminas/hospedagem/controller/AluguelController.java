package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.model.Aluguel;
import br.pucminas.hospedagem.service.AluguelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/alugueis")
@RequiredArgsConstructor
public class AluguelController {

    private final AluguelService service;

    @GetMapping
    public List<Aluguel> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Aluguel buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/residencia/{residenciaId}")
    public List<Aluguel> listarPorResidencia(@PathVariable Long residenciaId) {
        return service.listarPorResidencia(residenciaId);
    }

    @PostMapping("/residencia/{residenciaId}/quarto/{quartoId}/cliente/{clienteId}")
    public ResponseEntity<Aluguel> realizar(
            @PathVariable Long residenciaId,
            @PathVariable Long quartoId,
            @PathVariable Long clienteId,
            @RequestBody Aluguel dados) {
        return ResponseEntity.status(201).body(
            service.realizar(residenciaId, quartoId, clienteId, dados)
        );
    }
}
