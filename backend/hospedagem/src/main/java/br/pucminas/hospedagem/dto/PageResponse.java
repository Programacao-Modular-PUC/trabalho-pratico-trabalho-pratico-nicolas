package br.pucminas.hospedagem.dto;

import org.springframework.data.domain.Page;
import java.util.List;

public record PageResponse<T>(
    List<T> content,
    int page,
    int totalPages,
    long totalElements,
    boolean first,
    boolean last
) {
    public static <T> PageResponse<T> of(Page<T> source) {
        return new PageResponse<>(
            source.getContent(),
            source.getNumber(),
            source.getTotalPages(),
            source.getTotalElements(),
            source.isFirst(),
            source.isLast()
        );
    }
}
