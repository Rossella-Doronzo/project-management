const API_URL = "http://localhost:8081/api";

// ---------------------- Projects ----------------------

function fetchProjects() {
    fetch(`${API_URL}/getAllProjects`)
        .then(res => res.json())
        .then(projects => {
            const tableBody = document.getElementById("project-list");
            tableBody.innerHTML = ""; // Clear current list
            projects.forEach(p => {
                const row = `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.description}</td>
                        <td>${p.status}</td>
                        <td>${p.endDate}</td>
                        <td>
                            <button class="btn" onclick="editProject(${p.id})">Modifica</button>
                            <button class="btn" onclick="deleteProject(${p.id})">Elimina</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        });
}

function showProjectForm() {
    document.getElementById("project-id").value = "";
    document.getElementById("project-name").value = "";
    document.getElementById("project-description").value = "";
    document.getElementById("project-endDate").value = "";
    document.getElementById("project-status").value = "";
    document.getElementById("project-form").style.display = "block";
}

function saveProject() {
    const id = document.getElementById("project-id").value;
    const project = {
        id: id ? parseInt(id) : null,
        name: document.getElementById("project-name").value,
        description: document.getElementById("project-description").value,
        endDate: document.getElementById("project-endDate").value,
        status: document.getElementById("project-status").value
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/updateProject` : `${API_URL}/createProject`;

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project)
    })
    .then(() => {
        fetchProjects();
        document.getElementById("project-form").style.display = "none";
    });
}

function editProject(id) {
    fetch(`${API_URL}/getProjectById?id=${id}`)
        .then(res => res.json())
        .then(p => {
            document.getElementById("project-id").value = p.id;
            document.getElementById("project-name").value = p.name;
            document.getElementById("project-description").value = p.description;
            document.getElementById("project-endDate").value = p.endDate;
            document.getElementById("project-status").value = p.status;
            document.getElementById("project-form").style.display = "block";
        });
}

function deleteProject(id) {
    fetch(`${API_URL}/deleteProject?id=${id}`, { method: "DELETE" })
        .then(() => fetchProjects());
}

// ---------------------- Tasks ----------------------

function fetchTasks() {
    fetch(`${API_URL}/getAllTasks`)
        .then(res => res.json())
        .then(tasks => {
            const tableBody = document.getElementById("task-list");
            tableBody.innerHTML = "";
            tasks.forEach(t => {
                const row = `
                    <tr>
                        <td>${t.title}</td>
                        <td>${t.description}</td>
                        <td>${t.status}</td>
                        <td>${t.dueDate}</td>
                        <td>${t.project ? t.project.id : "N/A"}</td>
                        <td>${t.employee ? t.employee.id : "N/A"}</td>
                        <td>
                            <button class="btn" onclick="editTask(${t.id})">Modifica</button>
                            <button class="btn" onclick="deleteTask(${t.id})">Elimina</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        });
}

function showTaskForm() {
    document.getElementById("task-id").value = "";
    document.getElementById("task-title").value = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-dueDate").value = "";
    document.getElementById("task-status").value = "";
    document.getElementById("task-project").value = "";
    document.getElementById("task-employee").value = "";
    document.getElementById("task-form").style.display = "block";
}

function saveTask() {
    const id = document.getElementById("task-id").value;
    const task = {
        id: id ? parseInt(id) : null,
        title: document.getElementById("task-title").value,
        description: document.getElementById("task-description").value,
        dueDate: document.getElementById("task-dueDate").value,
        status: document.getElementById("task-status").value,
        project: { id: parseInt(document.getElementById("task-project").value) },
        employee: { id: parseInt(document.getElementById("task-employee").value) }
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/updateTask` : `${API_URL}/createTask`;

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    })
    .then(() => {
        fetchTasks();
        document.getElementById("task-form").style.display = "none";
    });
}

function editTask(id) {
    fetch(`${API_URL}/getTaskById?id=${id}`)
        .then(res => res.json())
        .then(t => {
            document.getElementById("task-id").value = t.id;
            document.getElementById("task-title").value = t.title;
            document.getElementById("task-description").value = t.description;
            document.getElementById("task-dueDate").value = t.dueDate;
            document.getElementById("task-status").value = t.status;
            document.getElementById("task-project").value = t.project ? t.project.id : "";
            document.getElementById("task-employee").value = t.employee ? t.employee.id : "";
            document.getElementById("task-form").style.display = "block";
        });
}

function deleteTask(id) {
    fetch(`${API_URL}/deleteTask?id=${id}`, { method: "DELETE" })
        .then(() => fetchTasks());
}

// ---------------------- Employees ----------------------

function fetchEmployees() {
    fetch(`${API_URL}/getAllEmployees`)
        .then(res => res.json())
        .then(employees => {
            const tableBody = document.getElementById("employee-list");
            tableBody.innerHTML = "";
            employees.forEach(e => {
                const row = `
                    <tr>
                        <td>${e.name}</td>
                        <td>${e.position}</td>
                        <td>${e.username}</td>
                        <td>
                            <button class="btn" onclick="editEmployee(${e.id})">Modifica</button>
                            <button class="btn" onclick="deleteEmployee(${e.id})">Elimina</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        });
}

function showEmployeeForm() {
    document.getElementById("employee-id").value = "";
    document.getElementById("employee-name").value = "";
    document.getElementById("employee-position").value = "";
    document.getElementById("employee-username").value = "";
    document.getElementById("employee-form").style.display = "block";
}

function saveEmployee() {
    const id = document.getElementById("employee-id").value;
    const employee = {
        id: id ? parseInt(id) : null,
        name: document.getElementById("employee-name").value,
        position: document.getElementById("employee-position").value,
        username: document.getElementById("employee-username").value
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${API_URL}/updateEmployee` : `${API_URL}/createEmployee`;

    fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
    })
    .then(() => {
        fetchEmployees();
        document.getElementById("employee-form").style.display = "none";
    });
}

function editEmployee(id) {
    fetch(`${API_URL}/getEmployeeById?id=${id}`)
        .then(res => res.json())
        .then(e => {
            document.getElementById("employee-id").value = e.id;
            document.getElementById("employee-name").value = e.name;
            document.getElementById("employee-position").value = e.position;
            document.getElementById("employee-username").value = e.username;
            document.getElementById("employee-form").style.display = "block";
        });
}

function deleteEmployee(id) {
    fetch(`${API_URL}/deleteEmployee?id=${id}`, { method: "DELETE" })
        .then(() => fetchEmployees());
}

// ---------------------- Init ----------------------

window.onload = () => {
    fetchProjects();
    fetchTasks();
    fetchEmployees();
};
