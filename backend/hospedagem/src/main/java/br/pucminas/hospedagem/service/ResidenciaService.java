package br.pucminas.hospedagem.service;

import br.pucminas.hospedagem.exception.NegocioException;
import br.pucminas.hospedagem.model.Residencia;
import br.pucminas.hospedagem.repository.ResidenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResidenciaService {

    private final ResidenciaRepository repository;

    public List<Residencia> listar() {
        return repository.findAll();
    }

    public Residencia buscarPorId(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new NegocioException("Residência não encontrada: " + id));
    }

    @Transactional
    public Residencia salvar(Residencia residencia) {
        return repository.save(residencia);
    }

    @Transactional
    public Residencia atualizar(Long id, Residencia dados) {
        Residencia existente = buscarPorId(id);
        existente.setEndereco(dados.getEndereco());
        existente.setNumero(dados.getNumero());
        existente.setBairro(dados.getBairro());
        existente.setCep(dados.getCep());
        existente.setTelefone(dados.getTelefone());
        existente.setEmail(dados.getEmail());
        return repository.save(existente);
    }

    @Transactional
    public void deletar(Long id) {
        buscarPorId(id);
        repository.deleteById(id);
    }
}
