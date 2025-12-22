package project.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import project.enums.TaskStatusEnum;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    private TaskStatusEnum status;

    private boolean isCompleted;

    public Task() {}

    public Task(String title, String description, LocalDate dueDate, Project project, Employee employee, TaskStatusEnum status) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.project = project;
        this.employee = employee;
        this.status = status;
        this.isCompleted = false;
    }

    // Getter e Setter

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public TaskStatusEnum getStatus() {
        return status;
    }

    public void setStatus(TaskStatusEnum status) {
        this.status = status;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }
}
