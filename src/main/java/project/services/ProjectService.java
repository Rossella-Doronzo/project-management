package project.services;

import project.model.Project;

import java.util.List;
import java.util.Optional;

public interface ProjectService {

    Project createProject(Project project);

    List<Project> getAllProjects();

    Optional<Project> getProjectById(Long id);

    Project updateProject(Long id, Project project);

    boolean deleteProject(Long id);
}