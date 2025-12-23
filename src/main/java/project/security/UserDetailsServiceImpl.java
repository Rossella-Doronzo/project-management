package project.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import project.model.Employee;
import project.repositories.EmployeeRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements org.springframework.security.core.userdetails.UserDetailsService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Cerca l'employee nel database
        Employee employee = employeeRepository.findByUsername(username);

        if (employee == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        // Restituisce un oggetto User di Spring Security (non confondere con la classe Employee)
        return new User(
                employee.getUsername(),
                employee.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + employee.getRole().name()))
        );
    }
}
