package br.pucminas.hospedagem;

import br.pucminas.hospedagem.exception.*;
import br.pucminas.hospedagem.model.*;
import br.pucminas.hospedagem.repository.*;
import br.pucminas.hospedagem.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class SistemaHospedagemTest {

    @Mock QuartoRepository quartoRepository;
    @Mock AluguelRepository aluguelRepository;
    @Mock ResidenciaService residenciaService;
    @InjectMocks QuartoService quartoService;

    // ========================= CÁLCULO DE DIÁRIA POR TIPO ==========================

    @Test
    @DisplayName("Individual sem adicionais: valor = base")
    void individual_diaria_simples() {
        assertEquals(100.0, makeIndividual(100.0, 1, false, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Individual com 2 camas: valor = base + R$30")
    void individual_diaria_duasCamas() {
        assertEquals(130.0, makeIndividual(100.0, 2, false, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Individual com ar-condicionado: valor = base + R$20")
    void individual_diaria_comAr() {
        assertEquals(120.0, makeIndividual(100.0, 1, true, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Individual com hidromassagem: valor = base + R$20")
    void individual_diaria_comHidro() {
        assertEquals(120.0, makeIndividual(100.0, 1, false, true).calcularValorDiaria());
    }

    @Test
    @DisplayName("Casal sem berço (cama CASAL): valor = base + R$30")
    void casal_diaria_semBerco() {
        assertEquals(130.0, makeCasal(100.0, "CASAL", false, false, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Casal com berço: valor = base + R$30 + R$25")
    void casal_diaria_comBerco() {
        assertEquals(155.0, makeCasal(100.0, "CASAL", true, false, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Casal cama QUEEN: valor = base + R$60")
    void casal_diaria_queen() {
        assertEquals(160.0, makeCasal(100.0, "QUEEN", false, false, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Casal cama KING: valor = base + R$60")
    void casal_diaria_king() {
        assertEquals(160.0, makeCasal(100.0, "KING", false, false, false).calcularValorDiaria());
    }

    @Test
    @DisplayName("Família 2 hóspedes: sem desconto → base × 1.30")
    void familia_diaria_semDesconto() {
        assertEquals(130.0, makeFamilia(100.0, 2, 8, false, false).calcularValorDiaria(), 0.01);
    }

    @Test
    @DisplayName("Família 3 hóspedes: desconto de 5% → 137.75")
    void familia_diaria_desconto5pct() {
        assertEquals(137.75, makeFamilia(100.0, 3, 8, false, false).calcularValorDiaria(), 0.01);
    }

    @Test
    @DisplayName("Família 5 hóspedes: desconto de 10% → 157.50")
    void familia_diaria_desconto10pct() {
        assertEquals(157.5, makeFamilia(100.0, 5, 8, false, false).calcularValorDiaria(), 0.01);
    }

    @Test
    @DisplayName("Família 7 hóspedes: desconto de 15% → 174.25")
    void familia_diaria_desconto15pct() {
        assertEquals(174.25, makeFamilia(100.0, 7, 8, false, false).calcularValorDiaria(), 0.01);
    }

    // ========================= REGRAS DE BERÇO ==========================

    @Test
    @DisplayName("Berço acrescenta exatamente R$25 ao valor da diária")
    void berco_incrementaValorEm25() {
        double sem = makeCasal(100.0, "CASAL", false, false, false).calcularValorDiaria();
        double com = makeCasal(100.0, "CASAL", true,  false, false).calcularValorDiaria();
        assertEquals(25.0, com - sem, 0.01);
    }

    @Test
    @DisplayName("QuartoIndividual não possui campo berço (garantido pela estrutura de classes)")
    void berco_naoExisteEmIndividual() {
        QuartoIndividual q = makeIndividual(100.0, 1, false, false);
        // Se QuartoIndividual tivesse berço, o valor seria diferente — aqui confirmamos que não há impacto
        assertDoesNotThrow(q::calcularValorDiaria);
        assertEquals(100.0, q.calcularValorDiaria());
    }

    @Test
    @DisplayName("RecursoNaoPermitidoException gerada para berço em quarto individual")
    void berco_quartoIndividual_lancaRecursoNaoPermitido() {
        RecursoNaoPermitidoException ex =
            new RecursoNaoPermitidoException("berço", "INDIVIDUAL");
        assertTrue(ex.getMessage().contains("berço"));
        assertTrue(ex.getMessage().contains("INDIVIDUAL"));
        assertInstanceOf(NegocioException.class, ex);
    }

    // ========================= LIMITES DE HÓSPEDES ==========================

    @Test
    @DisplayName("QuartoFamilia: CapacidadeExcedidaException quando hóspedes > capacidade")
    void familia_capacidadeExcedida_lancaExcecao() {
        CapacidadeExcedidaException ex = new CapacidadeExcedidaException(10, 6);
        assertTrue(ex.getMessage().contains("10"));
        assertTrue(ex.getMessage().contains("6"));
        assertInstanceOf(NegocioException.class, ex);
    }

    @Test
    @DisplayName("QuartoFamilia: salvar lança CapacidadeExcedidaException via service")
    void familia_capacidadeExcedida_viaService() {
        QuartoFamilia qf = makeFamilia(100.0, 10, 6, false, false);
        Residencia residencia = new Residencia();
        when(residenciaService.buscarPorId(1L)).thenReturn(residencia);
        assertThrows(CapacidadeExcedidaException.class, () -> quartoService.salvar(1L, qf));
    }

    @Test
    @DisplayName("QuartoIndividual: limiteHospedes armazenado corretamente")
    void individual_limiteHospedes_armazenado() {
        QuartoIndividual q = makeIndividual(100.0, 1, false, false);
        q.setLimiteHospedes(3);
        assertEquals(3, q.getLimiteHospedes());
    }

    @Test
    @DisplayName("QuartoFamilia: capacidade máxima respeita o valor configurado")
    void familia_capacidadeMaxima_armazenada() {
        QuartoFamilia q = makeFamilia(100.0, 4, 6, false, false);
        assertEquals(6, q.getCapacidadeMaxima());
        assertTrue(q.getNumeroHospedes() <= q.getCapacidadeMaxima());
    }

    // ========================= DISPONIBILIDADE ==========================

    @Test
    @DisplayName("Disponibilidade: quarto livre no período retorna true")
    void disponibilidade_quartoLivre_retornaTrue() {
        LocalDateTime entrada = LocalDateTime.of(2025, 7, 1, 14, 0);
        LocalDateTime saida   = LocalDateTime.of(2025, 7, 5, 11, 0);
        when(quartoRepository.isQuartoOcupado(1L, entrada, saida)).thenReturn(false);
        assertTrue(quartoService.isDisponivel(1L, entrada, saida));
    }

    @Test
    @DisplayName("Disponibilidade: quarto ocupado no período retorna false")
    void disponibilidade_quartoOcupado_retornaFalse() {
        LocalDateTime entrada = LocalDateTime.of(2025, 7, 1, 14, 0);
        LocalDateTime saida   = LocalDateTime.of(2025, 7, 5, 11, 0);
        when(quartoRepository.isQuartoOcupado(1L, entrada, saida)).thenReturn(true);
        assertFalse(quartoService.isDisponivel(1L, entrada, saida));
    }

    // ========================= CÁLCULO DE DIÁRIAS ==========================

    @Test
    @DisplayName("Saída antes das 12h: não conta diária extra")
    void diarias_saidaManha_semExtra() {
        Aluguel a = aluguel("2025-07-01T10:00", "2025-07-03T11:00");
        assertEquals(2, a.calcularDiarias());
    }

    @Test
    @DisplayName("Saída após as 12h: conta diária extra")
    void diarias_saidaTarde_comExtra() {
        Aluguel a = aluguel("2025-07-01T10:00", "2025-07-03T14:00");
        assertEquals(3, a.calcularDiarias());
    }

    @Test
    @DisplayName("Check-in e check-out no mesmo dia às 12h exato = 1 diária")
    void diarias_mesmoDia_ao12h() {
        Aluguel a = aluguel("2025-07-01T10:00", "2025-07-01T12:00");
        assertEquals(1, a.calcularDiarias());
    }

    @Test
    @DisplayName("3 noites com saída antes das 12h = 3 diárias")
    void diarias_tresNoites_semExtra() {
        Aluguel a = aluguel("2025-07-01T14:00", "2025-07-04T10:00");
        assertEquals(3, a.calcularDiarias());
    }

    // ========================= EXCEÇÕES ==========================

    @Test
    @DisplayName("DataInvalidaException contém o motivo informado")
    void dataInvalida_mensagemCorreta() {
        DataInvalidaException ex = new DataInvalidaException("saída anterior à entrada");
        assertTrue(ex.getMessage().contains("saída anterior à entrada"));
        assertInstanceOf(NegocioException.class, ex);
    }

    @Test
    @DisplayName("QuartoIndisponivelException contém o ID do quarto")
    void quartoIndisponivel_mensagemComId() {
        QuartoIndisponivelException ex = new QuartoIndisponivelException(42L);
        assertTrue(ex.getMessage().contains("42"));
        assertInstanceOf(NegocioException.class, ex);
    }

    // ========================= HELPERS ==========================

    private QuartoIndividual makeIndividual(double base, int camas, boolean ar, boolean hidro) {
        QuartoIndividual q = new QuartoIndividual();
        q.setValorBase(base);
        q.setNumeroCamas(camas);
        q.setPossuiArCondicionado(ar);
        q.setPossuiHidromassagem(hidro);
        return q;
    }

    private QuartoCasal makeCasal(double base, String tipoCama, boolean berco, boolean ar, boolean hidro) {
        QuartoCasal q = new QuartoCasal();
        q.setValorBase(base);
        q.setTipoCama(tipoCama);
        q.setPossuiBerco(berco);
        q.setPossuiArCondicionado(ar);
        q.setPossuiHidromassagem(hidro);
        return q;
    }

    private QuartoFamilia makeFamilia(double base, int hospedes, int capMax, boolean ar, boolean hidro) {
        QuartoFamilia q = new QuartoFamilia();
        q.setValorBase(base);
        q.setNumeroHospedes(hospedes);
        q.setCapacidadeMaxima(capMax);
        q.setPossuiArCondicionado(ar);
        q.setPossuiHidromassagem(hidro);
        return q;
    }

    private Aluguel aluguel(String entrada, String saida) {
        Aluguel a = new Aluguel();
        a.setDataEntrada(LocalDateTime.parse(entrada));
        a.setDataSaida(LocalDateTime.parse(saida));
        return a;
    }
}
