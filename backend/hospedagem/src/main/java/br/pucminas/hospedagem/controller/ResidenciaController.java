package br.pucminas.hospedagem.controller;

import br.pucminas.hospedagem.model.Aluguel;
import br.pucminas.hospedagem.model.Residencia;
import br.pucminas.hospedagem.service.AluguelService;
import br.pucminas.hospedagem.service.ResidenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/residencias")
@RequiredArgsConstructor
public class ResidenciaController {

    private final ResidenciaService service;
    private final AluguelService aluguelService;

    @GetMapping
    public List<Residencia> listar() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Residencia buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ResponseEntity<Residencia> criar(@RequestBody Residencia residencia) {
        return ResponseEntity.status(201).body(service.salvar(residencia));
    }

    @PutMapping("/{id}")
    public Residencia atualizar(@PathVariable Long id, @RequestBody Residencia dados) {
        return service.atualizar(id, dados);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/historico")
    public List<Aluguel> historico(@PathVariable Long id) {
        return aluguelService.listarPorResidencia(id);
    }
}
