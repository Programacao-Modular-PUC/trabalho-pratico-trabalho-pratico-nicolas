package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.dto.DisponibilidadeQuarto;
import br.pucminas.hospedagem.dto.DisponibilidadeQuarto.DiaStatus;
import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.*;
import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.repository.AluguelRepository;
import br.pucminas.hospedagem.repository.QuartoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuartoService {

    private final QuartoRepository repository;
    private final ResidenciaService residenciaService;
    private final AluguelRepository aluguelRepository;

    public PageResponse<Quarto> listar(Pageable pageable) {
        Page<Quarto> page = repository.findAll(pageable);
        marcarOcupados(page.getContent());
        return PageResponse.of(page);
    }

    // Sem paginação — usado para popular dropdown no frontend
    public List<Quarto> listarPorResidencia(Long residenciaId) {
        List<Quarto> quartos = repository.findByResidenciaId(residenciaId);
        marcarOcupados(quartos);
        return quartos;
    }

    public PageResponse<Quarto> listarPorTipo(String tipo, Pageable pageable) {
        Class<?> clazz = switch (tipo.toUpperCase()) {
            case "INDIVIDUAL" -> QuartoIndividual.class;
            case "CASAL"      -> QuartoCasal.class;
            case "FAMILIA"    -> QuartoFamilia.class;
            default -> throw new NegocioException("Tipo de quarto inválido: " + tipo +
                ". Use INDIVIDUAL, CASAL ou FAMILIA.");
        };
        Page<Quarto> page = repository.findByType(clazz, pageable);
        marcarOcupados(page.getContent());
        return PageResponse.of(page);
    }

    /** Marca como ocupados os quartos com aluguel ativo cobrindo o momento atual. */
    private void marcarOcupados(List<Quarto> quartos) {
        if (quartos.isEmpty()) return;
        Set<Long> ocupados = new HashSet<>(repository.idsOcupadosNoMomento(LocalDateTime.now()));
        quartos.forEach(q -> q.setOcupado(ocupados.contains(q.getId())));
    }

    @Transactional
    public Quarto alterarStatus(Long id, String novoStatus) {
        Quarto quarto = buscarPorId(id);
        if (!"DISPONIVEL".equals(novoStatus) && !"MANUTENCAO".equals(novoStatus)) {
            throw new NegocioException("Status inválido. Use DISPONIVEL ou MANUTENCAO.");
        }
        quarto.setStatus(novoStatus);
        return repository.save(quarto);
    }

    /** Monta a grade de ocupação (quarto × dia) para o período informado. */
    public List<DisponibilidadeQuarto> disponibilidade(LocalDate inicio, LocalDate fim) {
        if (fim.isBefore(inicio)) {
            throw new NegocioException("A data final deve ser igual ou posterior à inicial.");
        }
        List<Quarto> quartos = repository.findAll();
        List<Aluguel> alugueis = aluguelRepository.buscarNoPeriodo(inicio.atStartOfDay(), fim.atTime(23, 59, 59));
        marcarOcupados(quartos);
        LocalDate hoje = LocalDate.now();

        List<DisponibilidadeQuarto> resultado = new ArrayList<>();
        for (Quarto q : quartos) {
            List<DiaStatus> dias = new ArrayList<>();
            for (LocalDate dia = inicio; !dia.isAfter(fim); dia = dia.plusDays(1)) {
                dias.add(new DiaStatus(dia, statusDoDia(q, dia, alugueis, hoje)));
            }
            resultado.add(new DisponibilidadeQuarto(q.getId(), q.getTipo(), q.getStatus(), dias));
        }
        return resultado;
    }

    private String statusDoDia(Quarto quarto, LocalDate dia, List<Aluguel> alugueis, LocalDate hoje) {
        if ("MANUTENCAO".equals(quarto.getStatus())) return "MANUTENCAO";
        for (Aluguel a : alugueis) {
            if (a.getQuarto() == null || !a.getQuarto().getId().equals(quarto.getId())) continue;
            LocalDate entrada = a.getDataEntrada().toLocalDate();
            LocalDate saida = a.getDataSaida().toLocalDate();
            if (!dia.isBefore(entrada) && !dia.isAfter(saida)) {
                return entrada.isAfter(hoje) ? "RESERVADO" : "OCUPADO";
            }
        }
        return "DISPONIVEL";
    }

    public Quarto buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Quarto não encontrado: " + id));
    }

    @Transactional
    public Quarto salvar(Long residenciaId, Quarto quarto) {
        validarQuarto(quarto);
        Residencia residencia = residenciaService.buscarPorId(residenciaId);
        quarto.setResidencia(residencia);
        return repository.save(quarto);
    }

    @Transactional
    public void deletar(Long id) {
        buscarPorId(id);
        if (aluguelRepository.existsByQuartoIdAndStatusNot(id, "CANCELADO")) {
            throw new RecursoNaoPermitidoException("exclusão", "quarto com aluguéis ativos");
        }
        repository.deleteById(id);
    }

    public boolean isDisponivel(Long quartoId, LocalDateTime entrada, LocalDateTime saida) {
        return !repository.isQuartoOcupado(quartoId, entrada, saida);
    }

    private void validarQuarto(Quarto quarto) {
        if (quarto instanceof QuartoFamilia qf) {
            if (qf.getNumeroHospedes() != null && qf.getCapacidadeMaxima() != null
                    && qf.getNumeroHospedes() > qf.getCapacidadeMaxima()) {
                throw new CapacidadeExcedidaException(qf.getNumeroHospedes(), qf.getCapacidadeMaxima());
            }
        }
    }
}
