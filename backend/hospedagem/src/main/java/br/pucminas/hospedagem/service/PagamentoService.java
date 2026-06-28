package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.dto.PageResponse;
import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Pagamento;
import br.pucminas.hospedagem.repository.PagamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PagamentoService {

    private final PagamentoRepository repository;

    public PageResponse<Pagamento> listar(Pageable pageable) {
        return PageResponse.of(repository.findAll(pageable));
    }

    public Pagamento buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Pagamento não encontrado: " + id));
    }

    @Transactional
    public Pagamento confirmar(Long id) {
        Pagamento pagamento = validarPagavel(id);
        pagamento.confirmarPagamento();
        return repository.save(pagamento);
    }

    /** Pagamento realizado pelo cliente, com a forma escolhida (PIX, CARTAO, DINHEIRO). */
    @Transactional
    public Pagamento pagar(Long id, String forma) {
        if (forma == null || forma.isBlank()) {
            throw new NegocioException("Selecione a forma de pagamento.");
        }
        String f = forma.toUpperCase();
        if (!f.equals("PIX") && !f.equals("CARTAO") && !f.equals("DINHEIRO")) {
            throw new NegocioException("Forma de pagamento inválida. Use PIX, CARTAO ou DINHEIRO.");
        }
        Pagamento pagamento = validarPagavel(id);
        pagamento.pagar(f);
        return repository.save(pagamento);
    }

    private Pagamento validarPagavel(Long id) {
        Pagamento pagamento = buscarPorId(id);
        if ("CANCELADO".equals(pagamento.getStatus())) {
            throw new NegocioException("Não é possível pagar um aluguel cancelado.");
        }
        if ("CONFIRMADO".equals(pagamento.getStatus())) {
            throw new NegocioException("Este pagamento já foi confirmado.");
        }
        return pagamento;
    }
}
