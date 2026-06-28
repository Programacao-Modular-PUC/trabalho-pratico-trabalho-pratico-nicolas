package br.pucminas.hospedagem.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registra o módulo Hibernate6 no Jackson. Sem ele, serializar entidades JPA
 * com associações lazy (ex.: Aluguel.quarto vindo de findAll/findById como proxy)
 * dispara "No serializer found for ByteBuddyInterceptor" → HTTP 500.
 *
 * FORCE_LAZY_LOADING inicializa as associações durante a serialização (open-in-view
 * está ativo), preservando os dados que o frontend consome.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Hibernate6Module hibernate6Module() {
        Hibernate6Module module = new Hibernate6Module();
        module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, true);
        return module;
    }
}
