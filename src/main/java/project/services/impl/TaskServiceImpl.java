package project.services.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.enums.TaskStatusEnum;
import project.model.Task;
import project.repositories.TaskRepository;
import project.services.TaskService;
import javax.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class TaskServiceImpl implements TaskService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TaskServiceImpl.class);

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public Task createTask(Task task) {
        try {
            if (task.getStatus() == null) {
                task.setStatus(TaskStatusEnum.TO_DO);
            }
            task.setCompleted(false);

            LOGGER.info("Creating new task: {}", task);
            return taskRepository.save(task);
        } catch (Exception e) {
            LOGGER.error("Error occurred while creating task: {}", e.getMessage());
            throw new RuntimeException("Failed to create task", e);
        }
    }


    @Override
    public List<Task> getAllTasks() {
        try {
            LOGGER.info("Retrieving all tasks");
            return taskRepository.findAll();
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving all tasks: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve tasks", e);
        }
    }

    @Override
    public List<Task> getTasksByEmployeeId(Long employeeId) {
        return taskRepository.findByEmployeeId(employeeId);
    }

    @Override
    public Optional<Task> getTaskById(Long id) {
        try {
            LOGGER.info("Retrieving task with ID: {}", id);
            Optional<Task> task = taskRepository.findById(id);
            if (!task.isPresent()) {
                LOGGER.warn("Task with ID {} not found", id);
                throw new EntityNotFoundException("Task with ID " + id + " not found");
            }
            return task;
        } catch (EntityNotFoundException e) {
            LOGGER.error("Error occurred while retrieving task with ID {}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving task with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to retrieve task", e);
        }
    }

    @Override
    @Transactional
    public Task updateTask(Long id, Task updateData) {
        try {
            LOGGER.info("Updating task with ID: {}", id);

            Task existing = taskRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Task not found"));

            if (updateData.getTitle() != null) {
                existing.setTitle(updateData.getTitle());
            }
            if (updateData.getDescription() != null) {
                existing.setDescription(updateData.getDescription());
            }
            if (updateData.getDueDate() != null) {
                existing.setDueDate(updateData.getDueDate());
            }
            if (updateData.getStatus() != null) {
                existing.setStatus(updateData.getStatus());
            }

            LOGGER.info("Task with ID {} updated successfully", id);
            return taskRepository.save(existing);
        } catch (Exception e) {
            LOGGER.error("Error updating task ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Error updating task", e);
        }
    }


    @Override
    public boolean deleteTask(Long id) {
        try {
            if (!taskRepository.existsById(id)) {
                LOGGER.warn("Task with ID {} not found for deletion", id);
                throw new EntityNotFoundException("Task with ID " + id + " not found");
            }
            LOGGER.info("Deleting task with ID: {}", id);
            taskRepository.deleteById(id);
            return true;
        } catch (EntityNotFoundException e) {
            LOGGER.error("Error occurred while deleting task with ID {}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            LOGGER.error("Error occurred while deleting task with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete task", e);
        }
    }
}
