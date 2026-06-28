package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.*;
import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.repository.AluguelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AluguelService {

    private final AluguelRepository repository;
    private final ResidenciaService residenciaService;
    private final QuartoService quartoService;
    private final ClienteService clienteService;

    public PageResponse<Aluguel> listar(Pageable pageable) {
        return PageResponse.of(repository.findAll(pageable));
    }

    public List<Aluguel> listarPorResidencia(Long residenciaId) {
        return repository.findByResidenciaId(residenciaId);
    }

    public PageResponse<Aluguel> listarPorCliente(Long clienteId, Pageable pageable) {
        clienteService.buscarPorId(clienteId);
        return PageResponse.of(repository.findByClienteId(clienteId, pageable));
    }

    public Aluguel buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Aluguel não encontrado: " + id));
    }

    @Transactional
    public Aluguel realizar(Long residenciaId, Long quartoId, Long clienteId, Aluguel dados) {

        validarDatas(dados.getDataEntrada(), dados.getDataSaida());

        Residencia residencia = residenciaService.buscarPorId(residenciaId);
        Quarto quarto = quartoService.buscarPorId(quartoId);
        Cliente cliente = clienteService.buscarPorId(clienteId);

        if (!quartoService.isDisponivel(quartoId, dados.getDataEntrada(), dados.getDataSaida())) {
            throw new QuartoIndisponivelException(quartoId);
        }

        dados.setResidencia(residencia);
        dados.setQuarto(quarto);
        dados.setCliente(cliente);
        dados.setStatus("ATIVO");

        int diarias = dados.calcularDiarias();
        dados.setQuantidadeDiarias(diarias);
        dados.setValorFinal(quarto.calcularValorDiaria() * diarias);

        Pagamento pagamento = new Pagamento();
        pagamento.setAluguel(dados);
        pagamento.setValorPago(dados.getValorFinal());
        pagamento.setStatus("PENDENTE");
        dados.setPagamento(pagamento);

        Aluguel salvo = repository.save(dados);
        residencia.adicionarAluguel(salvo);

        log.info(salvo.imprimirFormulario());

        return salvo;
    }

    @Transactional
    public Aluguel cancelar(Long id) {
        Aluguel aluguel = buscarPorId(id);
        if ("CANCELADO".equals(aluguel.getStatus())) {
            throw new NegocioException("Aluguel já está cancelado.");
        }
        if (LocalDateTime.now().isAfter(aluguel.getDataSaida())) {
            throw new NegocioException("Não é possível cancelar um aluguel já encerrado.");
        }
        aluguel.setStatus("CANCELADO");
        if (aluguel.getPagamento() != null) {
            aluguel.getPagamento().setStatus("CANCELADO");
        }
        return repository.save(aluguel);
    }

    private void validarDatas(LocalDateTime entrada, LocalDateTime saida) {
        if (entrada == null || saida == null) {
            throw new DataInvalidaException("as datas de entrada e saída são obrigatórias.");
        }
        if (!saida.isAfter(entrada)) {
            throw new DataInvalidaException("a data de saída deve ser posterior à data de entrada.");
        }
    }
}
