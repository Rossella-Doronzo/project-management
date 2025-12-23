package project.services.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.enums.RoleEmployeeEnum;
import project.enums.RoleEnum;
import project.model.Employee;
import project.repositories.EmployeeRepository;
import project.repositories.TaskRepository;
import project.services.EmployeeService;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmployeeServiceImpl.class);

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public Employee createEmployee(Employee employee) {
        try {
            LOGGER.info("Attempting to create employee: {}", employee);

            if (employee.getUsername() == null || employee.getUsername().isEmpty()) {
                throw new IllegalArgumentException("Username cannot be null or empty");
            }
            if (employee.getRole() == null) {
                employee.setRole(RoleEnum.EMPLOYEE);
            }
            if (employee.getRoleEmployee() == null) {
                employee.setRoleEmployee(RoleEmployeeEnum.JUNIOR_DEVELOPER);
            }
            Employee newEmployee = employeeRepository.save(employee);
            LOGGER.info("Employee created successfully with ID: {}", newEmployee.getId());
            return newEmployee;
        } catch (Exception e) {
            LOGGER.error("Error occurred while creating employee: {}", e.getMessage(), e);
            throw new RuntimeException("Error creating employee", e);
        }
    }

    @Override
    public List<Employee> getAllEmployees() {
        try {
            LOGGER.info("Fetching all employees");
            List<Employee> employees = employeeRepository.findAll();
            LOGGER.info("Found {} employees", employees.size());
            return employees;
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving all employees: {}", e.getMessage(), e);
            throw new RuntimeException("Error fetching employees", e);
        }
    }

    @Override
    public Optional<Employee> getEmployeeById(Long id) {
        try {
            LOGGER.info("Fetching employee with ID: {}", id);
            Optional<Employee> employee = employeeRepository.findById(id);
            if (employee.isPresent()) {
                LOGGER.info("Employee found: {}", employee.get());
            } else {
                LOGGER.warn("Employee with ID {} not found", id);
            }
            return employee;
        } catch (Exception e) {
            LOGGER.error("Error occurred while fetching employee with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error fetching employee by ID", e);
        }
    }

    @Override
    public Employee updateEmployee(Long id, Employee updateData) {
        try {
            LOGGER.info("Attempting to update employee with ID: {}", id);
            Employee existing = employeeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (updateData.getName() != null) {
                existing.setName(updateData.getName());
            }

            if (updateData.getUsername() != null) {
                existing.setUsername(updateData.getUsername());
            }

            if (updateData.getRoleEmployee() != null) existing.setRoleEmployee(updateData.getRoleEmployee());

            Employee updatedEmployee = employeeRepository.save(existing);
            LOGGER.info("Employee updated successfully with ID: {}", updatedEmployee.getId());
            return updatedEmployee;
        } catch (Exception e) {
            LOGGER.error("Error occurred while updating employee with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Error updating employee", e);
        }
    }


    @Override
    @Transactional
    public boolean deleteEmployee(Long id) {
        try {
            LOGGER.info("Attempting to delete employee with ID: {}", id);

            Optional<Employee> employee = employeeRepository.findById(id);
            if (employee.isPresent() && employee.get().getRole() == RoleEnum.PM) {
                throw new IllegalArgumentException("Cannot delete a PM");
            }

            taskRepository.deleteByEmployeeId(id);

            if (employeeRepository.existsById(id)) {
                employeeRepository.deleteById(id);
                LOGGER.info("Employee with ID {} deleted successfully", id);
                return true;
            } else {
                LOGGER.warn("Employee with ID {} not found for deletion", id);
                return false;
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while deleting employee with ID {}: {}", id, e.getMessage(), e);
            throw new RuntimeException("Error deleting employee", e);
        }
    }
}
