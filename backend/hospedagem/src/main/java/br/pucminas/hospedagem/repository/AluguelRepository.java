package br.pucminas.hospedagem.repository;

import br.pucminas.hospedagem.model.Aluguel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AluguelRepository extends JpaRepository<Aluguel, Long> {
    List<Aluguel> findByResidenciaId(Long residenciaId);
    Page<Aluguel> findByClienteId(Long clienteId, Pageable pageable);
    boolean existsByQuartoIdAndStatusNot(Long quartoId, String status);
    boolean existsByResidenciaIdAndStatusNot(Long residenciaId, String status);

    // Aluguéis (não cancelados) que se sobrepõem ao período — usado na Disponibilidade
    @Query("""
        SELECT a FROM Aluguel a
        WHERE a.status <> 'CANCELADO'
        AND a.dataEntrada <= :fim AND a.dataSaida >= :inicio
    """)
    List<Aluguel> buscarNoPeriodo(@Param("inicio") LocalDateTime inicio, @Param("fim") LocalDateTime fim);
}
