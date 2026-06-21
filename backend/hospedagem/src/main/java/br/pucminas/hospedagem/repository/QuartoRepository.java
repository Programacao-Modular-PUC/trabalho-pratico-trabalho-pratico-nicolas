package br.pucminas.hospedagem.repository;

import br.pucminas.hospedagem.model.Quarto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QuartoRepository extends JpaRepository<Quarto, Long> {

    List<Quarto> findByResidenciaId(Long residenciaId);

    // Verifica se quarto está ocupado no período (regra 3)
    @Query("""
        SELECT COUNT(a) > 0 FROM Aluguel a
        WHERE a.quarto.id = :quartoId
        AND a.dataEntrada < :dataSaida
        AND a.dataSaida > :dataEntrada
    """)
    boolean isQuartoOcupado(
        @Param("quartoId") Long quartoId,
        @Param("dataEntrada") LocalDateTime dataEntrada,
        @Param("dataSaida") LocalDateTime dataSaida
    );
}
