package project.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import project.model.Employee;
import project.repositories.EmployeeRepository;
import project.security.JwtTokenProvider;
import project.services.EmployeeService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmployeeRepository employeeRepository;

    // Autenticazione e generazione del token JWT
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestParam String username, @RequestParam String password) {
        try {
            LOGGER.info("Attempting login for username: {}", username);

            // Cerca l'utente nel database
            Employee employee = employeeRepository.findByUsername(username);

            // Verifica che l'utente esista
            if (employee == null) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid credentials");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }

            // Verifica la password usando BCryptPasswordEncoder
            if (!passwordEncoder.matches(password, employee.getPassword())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid credentials");
                return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
            }

            // Genera il token JWT passando l'oggetto Employee
            String token = jwtTokenProvider.generateToken(employee);
            LOGGER.info("Login successful for username: {}", username);

            // Crea una mappa con il token
            Map<String, String> response = new HashMap<>();
            response.put("token", token);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            LOGGER.error("Error occurred during login for username: {}", username, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid credentials");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
    }

    // Registrazione di un nuovo dipendente
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Employee employee) {
        try {
            LOGGER.info("Attempting to register new employee: {}", employee.getUsername());

            // Verifica che username non esista già
            if(employeeRepository.findByUsername(employee.getUsername()) != null){
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Username already exists");
            }

            // Cripta la password
            String encryptedPassword = passwordEncoder.encode(employee.getPassword());
            employee.setPassword(encryptedPassword);

            // Salva il nuovo dipendente
            Employee savedEmployee = employeeService.createEmployee(employee);
            LOGGER.info("Employee registered successfully with username: {}", employee.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body("Employee registered successfully");
        } catch (Exception e) {
            LOGGER.error("Error during registration of employee: {}", employee.getUsername(), e);
            return new ResponseEntity<>("Error during registration", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}