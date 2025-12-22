package project.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.model.Project;
import project.services.ProjectService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ProjectController {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectController.class);

    @Autowired
    private ProjectService projectService;

    // Creazione di un nuovo progetto
    @PostMapping ("/createProject")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        try {
            LOGGER.info("Creating new project: {}", project);
            Project newProject = projectService.createProject(project);
            LOGGER.info("Project created successfully with ID: {}", newProject.getId());
            return new ResponseEntity<>(newProject, HttpStatus.CREATED);
        } catch (Exception e) {
            LOGGER.error("Error occurred while creating project: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recupero di tutti i progetti
    @GetMapping("/getAllProjects")
    public ResponseEntity<List<Project>> getAllProjects() {
        try {
            LOGGER.info("Retrieving all projects");
            List<Project> projects = projectService.getAllProjects();
            LOGGER.info("Found {} projects", projects.size());
            return new ResponseEntity<>(projects, HttpStatus.OK);
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving all projects: {}", e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Recupero di un progetto per ID
    @GetMapping("/getProjectById")
    public ResponseEntity<Project> getProjectById(@RequestParam Long id) {
        try {
            LOGGER.info("Retrieving project with ID: {}", id);
            Optional<Project> project = projectService.getProjectById(id);
            if (project.isPresent()) {
                LOGGER.info("Project found: {}", project.get());
                return new ResponseEntity<>(project.get(), HttpStatus.OK);
            } else {
                LOGGER.warn("Project with ID {} not found", id);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving project by ID {}: {}", id, e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Aggiornamento di un progetto (ID passato nel body)
    @PutMapping("/updateProject")
    public ResponseEntity<Project> updateProject(@RequestBody Project project) {
        try {
            if (project.getId() != null) {
                LOGGER.info("Updating project with ID: {}", project.getId());
                Project updatedProject = projectService.updateProject(project.getId(), project);
                if (updatedProject != null) {
                    LOGGER.info("Project updated successfully with ID: {}", updatedProject.getId());
                    return new ResponseEntity<>(updatedProject, HttpStatus.OK);
                } else {
                    LOGGER.warn("Project with ID {} not found for update", project.getId());
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                }
            } else {
                LOGGER.warn("Project ID is null, cannot update project");
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            LOGGER.error("Error occurred while updating project with ID {}: {}", project.getId(), e.getMessage());
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Eliminazione di un progetto (ID passato nel body)
    @DeleteMapping("/deleteProject")
    public ResponseEntity<String> deleteProject(@RequestParam("id") Long id) {
        try {
            LOGGER.info("Delete request for project ID: {}", id);

            if (id == null || id <= 0) {
                LOGGER.warn("Invalid project ID: {}", id);
                return ResponseEntity.badRequest().body("Invalid ID");
            }

            boolean isDeleted = projectService.deleteProject(id);

            if (isDeleted) {
                LOGGER.info("Project with ID {} successfully deleted", id);
                return ResponseEntity.ok("Project with ID " + id + " successfully deleted");
            } else {
                LOGGER.warn("Project with ID {} not found", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            LOGGER.error("Delete error ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }

}
