package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.repository.QuartoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartoRepository repository;
    private final ResidenciaService residenciaService;

    public List<Quarto> listar() {
        return repository.findAll();
    }

    public List<Quarto> listarPorResidencia(Long residenciaId) {
        return repository.findByResidenciaId(residenciaId);
    }

    public Quarto buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Quarto não encontrado: " + id));
    }

    @Transactional
    public Quarto salvar(Long residenciaId, Quarto quarto) {
        Residencia residencia = residenciaService.buscarPorId(residenciaId);
        quarto.setResidencia(residencia);
        return repository.save(quarto);
    }

    @Transactional
    public void deletar(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }

    public boolean isDisponivel(Long quartoId, LocalDateTime entrada, LocalDateTime saida) {
        return !repository.isQuartoOcupado(quartoId, entrada, saida);
    }
}
