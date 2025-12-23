package project.services;

import project.model.Task;

import java.util.List;
import java.util.Optional;

public interface TaskService {

    Task createTask(Task task);

    List<Task> getAllTasks();

    List<Task> getTasksByEmployeeId(Long employeeId);

    Optional<Task> getTaskById(Long id);

    Task updateTask(Long id, Task task);

    boolean deleteTask(Long id);
}
