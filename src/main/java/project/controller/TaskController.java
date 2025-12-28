package project.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import project.model.Task;
import project.services.TaskService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class TaskController {

    private static final Logger LOGGER = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    // Creazione di un nuovo task
    @PreAuthorize("hasRole('PM')")
    @PostMapping("/createTask")
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        try {
            LOGGER.info("Creating new task: {}", task);
            Task newTask = taskService.createTask(task);
            LOGGER.info("Task created successfully with ID: {}", newTask.getId());
            return new ResponseEntity<>(newTask, HttpStatus.CREATED);
        } catch (Exception e) {
            LOGGER.error("Error occurred while creating task: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recupero di tutti i task
    @PreAuthorize("hasRole('PM')")
    @GetMapping("/getAllTasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        try {
            LOGGER.info("Retrieving all tasks");
            List<Task> tasks = taskService.getAllTasks();
            LOGGER.info("Found {} tasks", tasks.size());
            return new ResponseEntity<>(tasks, HttpStatus.OK);
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving all tasks: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/getTasksByEmployee")
    public ResponseEntity<List<Task>> getTasksByEmployee(@RequestParam Long employeeId) {
        try {
            LOGGER.info("Retrieving tasks for employee ID: {}", employeeId);
            List<Task> tasks = taskService.getTasksByEmployeeId(employeeId);
            return new ResponseEntity<>(tasks, HttpStatus.OK);
        } catch (Exception e) {
            LOGGER.error("Error retrieving tasks for employee {}: {}", employeeId, e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    // Recupero di un task per ID (passato nel body)
    @PreAuthorize("hasRole('PM')")
    @GetMapping("/getTaskById")
    public ResponseEntity<Task> getTaskById(@RequestParam Long id) {
        try {
            LOGGER.info("Retrieving task with ID: {}", id);
            Optional<Task> task = taskService.getTaskById(id);
            if (task.isPresent()) {
                LOGGER.info("Task found: {}", task.get());
                return new ResponseEntity<>(task.get(), HttpStatus.OK);
            } else {
                LOGGER.warn("Task with ID {} not found", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving task with ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Aggiornamento di un task (passando l'ID nel body)
    @PreAuthorize("hasRole('PM') or hasRole('EMPLOYEE')")
    @PutMapping("/updateTask")
    public ResponseEntity<Task> updateTask(@RequestBody Task task) {
        try {
            if (task.getId() != null) {
                LOGGER.info("Updating task with ID: {}", task.getId());
                Task updatedTask = taskService.updateTask(task.getId(), task);
                if (updatedTask != null) {
                    LOGGER.info("Task updated successfully with ID: {}", updatedTask.getId());
                    return new ResponseEntity<>(updatedTask, HttpStatus.OK);
                } else {
                    LOGGER.warn("Task with ID {} not found for update", task.getId());
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                LOGGER.warn("Task ID is null, cannot update task");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while updating task with ID {}: {}", task.getId(), e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminazione di un task (passando l'ID nel body)
    @PreAuthorize("hasRole('PM')")
    @DeleteMapping("/deleteTask")
    public ResponseEntity<String> deleteTask(@RequestParam("id") Long id) {
        try {
            LOGGER.info("Delete request for task ID: {}", id);
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest().body("Invalid ID");
            }

            boolean isDeleted = taskService.deleteTask(id);
            if (isDeleted) {
                return ResponseEntity.ok("Task with ID " + id + " successfully deleted");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            LOGGER.error("Delete error ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

}
