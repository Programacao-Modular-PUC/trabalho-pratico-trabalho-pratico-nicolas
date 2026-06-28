package br.pucminas.hospedagem.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    public String gerarToken(UserDetails user) {
        String role = user.getAuthorities().iterator().next().getAuthority();
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey())
                .compact();
    }

    public String extrairUsername(String token) {
        return Jwts.parser().verifyWith(getKey()).build()
                .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isValido(String token, UserDetails user) {
        try {
            String username = extrairUsername(token);
            Date exp = Jwts.parser().verifyWith(getKey()).build()
                    .parseSignedClaims(token).getPayload().getExpiration();
            return username.equals(user.getUsername()) && exp.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }
}
