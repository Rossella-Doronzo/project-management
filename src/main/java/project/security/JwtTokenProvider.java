package project.security;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;
import project.model.Employee;

import java.text.ParseException;
import java.util.Date;

@Service
public class JwtTokenProvider {

    private final String SECRET_KEY = "yIu4hK#89j12Nn4!g@#3UtdTk24Jp8Yxz";

    // Genera il token, passa anche il ruolo come parametro
    public String generateToken(Employee employee) {
        Date expirationDate = new Date(System.currentTimeMillis() + 86400000); // 1 giorno

        try {
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(employee.getUsername())
                    .claim("role", employee.getRole().name())
                    .claim("id", employee.getId())
                    .issueTime(new Date())
                    .expirationTime(expirationDate)
                    .build();

            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );

            signedJWT.sign(new MACSigner(SECRET_KEY));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            e.printStackTrace();
            return null;
        }
    }


    // Estrai il nome utente dal token
    public String getUsernameFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Estrai il ruolo dal token
    public String getRoleFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return (String) signedJWT.getJWTClaimsSet().getClaim("role");
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }

    // Verifica se il token è valido
    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(new MACVerifier(SECRET_KEY))) {
                return false;
            }
            JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
            return !claimsSet.getExpirationTime().before(new Date());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Restituisce la data di scadenza
    public Date getExpirationDateFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getExpirationTime();
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }
}

