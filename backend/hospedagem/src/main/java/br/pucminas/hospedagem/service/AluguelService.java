package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.repository.AluguelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AluguelService {

    private final AluguelRepository repository;
    private final ResidenciaService residenciaService;
    private final QuartoService quartoService;
    private final ClienteService clienteService;

    public List<Aluguel> listar() {
        return repository.findAll();
    }

    public List<Aluguel> listarPorResidencia(Long residenciaId) {
        return repository.findByResidenciaId(residenciaId);
    }

    public Aluguel buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Aluguel não encontrado: " + id));
    }

    @Transactional
    public Aluguel realizar(Long residenciaId, Long quartoId, Long clienteId,
                            Aluguel dados) {

        Residencia residencia = residenciaService.buscarPorId(residenciaId);
        Quarto quarto = quartoService.buscarPorId(quartoId);
        Cliente cliente = clienteService.buscarPorId(clienteId);

        // Regra 3: quarto não pode estar ocupado no período
        if (!quartoService.isDisponivel(quartoId, dados.getDataEntrada(), dados.getDataSaida())) {
            throw new NegocioException("Quarto já está ocupado no período informado.");
        }

        dados.setResidencia(residencia);
        dados.setQuarto(quarto);
        dados.setCliente(cliente);

        // Calcula diárias e valor conforme regras do enunciado
        int diarias = dados.calcularDiarias();
        dados.setQuantidadeDiarias(diarias);
        dados.setValorFinal(quarto.calcularValorDiaria() * diarias);

        // Regra 5: gera pagamento associado automaticamente
        Pagamento pagamento = new Pagamento();
        pagamento.setAluguel(dados);
        pagamento.setValorPago(dados.getValorFinal());
        pagamento.setStatus("PENDENTE");
        dados.setPagamento(pagamento);

        Aluguel salvo = repository.save(dados);
        residencia.adicionarAluguel(salvo);

        System.out.println(salvo.imprimirFormulario());

        return salvo;
    }
}
