package project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Metodo per cercare un utente tramite il nome utente
    Employee findByUsername(String username);
}
