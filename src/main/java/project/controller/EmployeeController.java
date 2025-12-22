package project.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.model.Employee;
import project.services.EmployeeService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class EmployeeController {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/createEmployee")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        try {
            LOGGER.info("Creating new employee: {}", employee);
            Employee newUser = employeeService.createEmployee(employee);
            LOGGER.info("Employee created successfully with ID: {}", newUser.getId());
            return new ResponseEntity<>(newUser, HttpStatus.CREATED);
        } catch (Exception e) {
            LOGGER.error("Error occurred while creating employee: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getAllEmployees")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        try {
            LOGGER.info("Retrieving all employees");
            List<Employee> users = employeeService.getAllEmployees();
            LOGGER.info("Found {} employees", users.size());
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving all employees: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/getEmployeeById")
    public ResponseEntity<Employee> getEmployeeById(@RequestParam Long id) {
        try {
            LOGGER.info("Retrieving employee with ID: {}", id);
            Optional<Employee> user = employeeService.getEmployeeById(id);
            if (user.isPresent()) {
                LOGGER.info("Employee found: {}", user.get());
                return new ResponseEntity<>(user.get(), HttpStatus.OK);
            } else {
                LOGGER.warn("Employee with ID {} not found", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving employee by ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/updateEmployee")
    public ResponseEntity<Employee> updateEmployee(@RequestBody Employee employee) {
        try {
            if (employee.getId() != null) {
                LOGGER.info("Updating employee with ID: {}", employee.getId());
                Employee updatedEmployee = employeeService.updateEmployee(employee.getId(), employee);
                if (updatedEmployee != null) {
                    LOGGER.info("Employee updated successfully with ID: {}", updatedEmployee.getId());
                    return new ResponseEntity<>(updatedEmployee, HttpStatus.OK);
                } else {
                    LOGGER.warn("Employee with ID {} not found for update", employee.getId());
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                LOGGER.warn("Employee ID is null, cannot update employee");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while updating employee with ID {}: {}", employee.getId(), e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/deleteEmployee")
    public ResponseEntity<String> deleteEmployee(@RequestParam("id") Long id) {
        try {
            LOGGER.info("Delete request for employee ID: {}", id);

            if (id == null || id <= 0) {
                LOGGER.warn("Invalid employee ID: {}", id);
                return ResponseEntity.badRequest().body("ID non valido");
            }

            boolean isDeleted = employeeService.deleteEmployee(id);

            if (isDeleted) {
                LOGGER.info("Employee with ID {} deleted OK", id);
                return ResponseEntity.ok("Employee ID " + id + " successfully deleted!");
            } else {
                LOGGER.warn("Employee with ID {} not found", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            LOGGER.error("Delete error ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Errore: " + e.getMessage());
        }
    }


}
