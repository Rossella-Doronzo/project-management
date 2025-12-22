package project.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import project.model.Task;


public interface TaskRepository extends JpaRepository<Task, Long> {

    @Modifying
    @Query("DELETE FROM Task t WHERE t.employee.id = :employeeId")

    void deleteByEmployeeId(@Param("employeeId") Long employeeId);
}
