package br.pucminas.hospedagem.repository;

import br.pucminas.hospedagem.model.Quarto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {

    // Usado para dropdown no frontend (não paginado)
    List<Quarto> findByResidenciaId(Long residenciaId);

    // Usado para listar por tipo com paginação
    @Query("SELECT q FROM Quarto q WHERE TYPE(q) = :clazz")
    Page<Quarto> findByType(@Param("clazz") Class<?> clazz, Pageable pageable);

    @Query("""
        SELECT COUNT(a) > 0 FROM Aluguel a
        WHERE a.quarto.id = :quartoId
        AND a.dataEntrada < :dataSaida
        AND a.dataSaida > :dataEntrada
        AND a.status <> 'CANCELADO'
    """)
    boolean isQuartoOcupado(
        @Param("quartoId") Long quartoId,
        @Param("dataEntrada") LocalDateTime dataEntrada,
        @Param("dataSaida") LocalDateTime dataSaida
    );

    // IDs dos quartos com aluguel ativo cobrindo o momento informado (para o status "Ocupado")
    @Query("""
        SELECT DISTINCT a.quarto.id FROM Aluguel a
        WHERE a.status <> 'CANCELADO'
        AND a.dataEntrada <= :momento AND a.dataSaida >= :momento
    """)
    List<Long> idsOcupadosNoMomento(@Param("momento") LocalDateTime momento);
}
