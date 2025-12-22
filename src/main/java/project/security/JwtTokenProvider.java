package project.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.util.Date;

@Service
public class JwtTokenProvider {

    // La chiave segreta per firmare i token
    private final String SECRET_KEY = "yIu4hK#89j12Nn4!g@#3UtdTk24Jp8Yxz";

    // Metodo per generare il token
    public String generateToken(String username) {
        // Imposta la data di scadenza del token (ad esempio, 1 giorno)
        Date expirationDate = new Date(System.currentTimeMillis() + 86400000); // 1 giorno

        try {
            // Crea i claim del token (dati come nome utente e data di scadenza)
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(username)  // Imposta il nome utente come soggetto del token
                    .issueTime(new Date())  // Imposta la data di emissione
                    .expirationTime(expirationDate)  // Imposta la data di scadenza
                    .build();

            // Crea un JWT firmato usando la chiave segreta
            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),  // Utilizza HS256 come algoritmo di firma
                    claimsSet
            );

            // Firma il JWT con la chiave segreta
            signedJWT.sign(new MACSigner(SECRET_KEY));

            return signedJWT.serialize();  // Restituisci il token firmato come stringa

        } catch (JOSEException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Estrai il nome utente dal token
    public String getUsernameFromToken(String token) {
        try {
            // Decodifica il token firmato
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();

            return claimsSet.getSubject();  // Restituisci il nome utente (subject)
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Verifica se il token è valido
    public boolean validateToken(String token) {
        try {
            // Decodifica il token firmato
            SignedJWT signedJWT = SignedJWT.parse(token);

            // Verifica la firma del token usando MACVerifier
            if (!signedJWT.verify(new MACVerifier(SECRET_KEY))) {
                return false;  // La firma non è valida
            }

            // Verifica la data di scadenza
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            Date expirationDate = claimsSet.getExpirationTime();
            if (expirationDate.before(new Date())) {
                return false;  // Il token è scaduto
            }

            return true;  // Il token è valido

        } catch (ParseException | JOSEException e) {
            e.printStackTrace();
            return false;  // Token non valido
        }
    }

    // Metodo per ottenere la data di scadenza del token
    public Date getExpirationDateFromToken(String token) {
        try {
            // Decodifica il token firmato
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();

            return claimsSet.getExpirationTime();  // Restituisce la data di scadenza del token
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }
}
