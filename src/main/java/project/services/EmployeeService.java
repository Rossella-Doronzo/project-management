package project.services;

import project.model.Employee;
import java.util.List;
import java.util.Optional;

public interface EmployeeService {

    Employee createEmployee(Employee employee);

    List<Employee> getAllEmployees();

    Optional<Employee> getEmployeeById(Long id);

    Employee updateEmployee(Long id, Employee employee);

    boolean deleteEmployee(Long id);
}
