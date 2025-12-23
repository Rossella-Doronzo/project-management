package project.services.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import project.model.Project;
import project.repositories.ProjectRepository;
import project.services.ProjectService;

import javax.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

@Service
public class ProjectServiceImpl implements ProjectService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ProjectServiceImpl.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public Project createProject(Project project) {
        try {
            LOGGER.info("Creating new project: {}", project);
            // Salvataggio di un nuovo progetto nel DB
            return projectRepository.save(project);
        } catch (Exception e) {
            LOGGER.error("Error occurred while creating project: {}", e.getMessage());
            throw new RuntimeException("Error occurred while creating project", e);
        }
    }

    @Override
    public List<Project> getAllProjects() {
        try {
            LOGGER.info("Retrieving all projects");
            List<Project> projects = projectRepository.findAll();
            LOGGER.info("Found {} projects", projects.size());
            return projects;
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving all projects: {}", e.getMessage());
            throw new RuntimeException("Error occurred while retrieving all projects", e);
        }
    }

    @Override
    public Optional<Project> getProjectById(Long id) {
        try {
            LOGGER.info("Retrieving project with ID: {}", id);
            Optional<Project> project = projectRepository.findById(id);
            if (project.isPresent()) {
                LOGGER.info("Project found: {}", project.get());
            } else {
                LOGGER.warn("Project with ID {} not found", id);
            }
            return project;
        } catch (Exception e) {
            LOGGER.error("Error occurred while retrieving project by ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Error occurred while retrieving project by ID", e);
        }
    }
    @Override
    public List<Project> getProjectsForEmployee(Long employeeId) {
        try {
            return projectRepository.findProjectsByEmployeeId(employeeId);
        } catch (Exception e) {
            LOGGER.error("Error fetching projects for employee {}: {}", employeeId, e.getMessage(), e);
            throw new RuntimeException("Error fetching projects for employee", e);
        }
    }

    @Override
    @Transactional
    public Project updateProject(Long id, Project updateData) {
        try {
            LOGGER.info("Updating project with ID: {}", id);

            Project existing = projectRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Project not found"));

            if (updateData.getName() != null) {
                existing.setName(updateData.getName());
            }
            if (updateData.getDescription() != null) {
                existing.setDescription(updateData.getDescription());
            }
            if (updateData.getStartDate() != null) {
                existing.setStartDate(updateData.getStartDate());
            }
            if (updateData.getEndDate() != null) {
                existing.setEndDate(updateData.getEndDate());
            }
            if (updateData.getStatus() != null) {
                existing.setStatus(updateData.getStatus());
            }

            LOGGER.info("Project with ID {} updated successfully", id);
            return projectRepository.save(existing);
        } catch (Exception e) {
            LOGGER.error("Error updating project ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Error updating project", e);
        }
    }


    @Override
    public boolean deleteProject(Long id) {
        try {
            LOGGER.info("Deleting project with ID: {}", id);

            Optional<Project> project = projectRepository.findById(id);

            if (project.isPresent()) {

                projectRepository.delete(project.get());
                LOGGER.info("Project with ID {} deleted successfully", id);
                return true;
            } else {

                LOGGER.warn("Project with ID {} not found for deletion", id);
                throw new EntityNotFoundException("Project with ID " + id + " not found.");
            }
        } catch (EntityNotFoundException e) {
            LOGGER.error("Error occurred while deleting project with ID {}: {}", id, e.getMessage());
            throw e;
        } catch (Exception e) {
            LOGGER.error("Error occurred while deleting project with ID {}: {}", id, e.getMessage());
            throw new RuntimeException("Error occurred while deleting project", e);
        }
    }
}
