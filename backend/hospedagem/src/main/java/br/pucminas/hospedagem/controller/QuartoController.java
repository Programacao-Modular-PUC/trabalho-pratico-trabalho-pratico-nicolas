package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.service.QuartoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/quartos")
@RequiredArgsConstructor
public class QuartoController {

    private final QuartoService service;

    @GetMapping
    public List<Quarto> listar() {
        return service.listar();
    }

    @GetMapping("/residencia/{residenciaId}")
    public List<Quarto> listarPorResidencia(@PathVariable Long residenciaId) {
        return service.listarPorResidencia(residenciaId);
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
