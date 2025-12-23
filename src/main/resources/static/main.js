const API_URL = "http://localhost:8081/api";

// ====================== AUTH FETCH ======================
function authFetch(url, options = {}) {
    const token = localStorage.getItem("auth-token");
    return fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token ? { "Authorization": "Bearer " + token } : {}),
            "Content-Type": "application/json"
        }
    });
}

// ====================== LOGIN ======================
function loginUser() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    fetch(`${API_URL}/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: "POST"
    })
    .then(res => {
        if (!res.ok) throw new Error("Invalid credentials");
        return res.json();
    })
    .then(data => {
        localStorage.setItem("auth-token", data.token);

        const payload = parseJwt(data.token);
        localStorage.setItem("auth-role", payload.role);
        localStorage.setItem("auth-username", payload.sub);
        localStorage.setItem("auth-id", payload.id);

        alert("Login riuscito!");
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";

        setupUIByRole();
        fetchProjects();
        fetchTasks();
        if (isPM()) fetchEmployees();
    })
    .catch(() => alert("Credenziali non valide"));
}

// ====================== REGISTER ======================
function toggleEmployeeRoleSelect() {
    const role = document.getElementById("register-role").value;
    document.getElementById("register-employeeRole").style.display = role === "EMPLOYEE" ? "block" : "none";
}

function toggleEmployeeFormRoleSelect() {
    const role = document.getElementById("employee-role").value;
    document.getElementById("employee-employeeRole").style.display = role === "EMPLOYEE" ? "block" : "none";
}

function registerUser() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const name = document.getElementById("register-name").value;
    const role = document.getElementById("register-role").value;
    const roleEmployee = document.getElementById("register-employeeRole").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const payload = { username, password, name, role, roleEmployee };

    fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (res.status === 201) {
            alert("Registrazione avvenuta con successo!");
            toggleForms();
        } else {
            return res.text().then(text => { throw new Error(text); });
        }
    })
    .catch(err => alert("Errore: " + err.message));
}

// ====================== LOGOUT ======================
function logoutUser() {
    localStorage.clear();
    location.reload();
}

// ====================== UTILITIES ======================
function toggleForms() {
    const login = document.getElementById("login-section");
    const register = document.getElementById("register-section");
    login.style.display = login.style.display === "none" ? "block" : "none";
    register.style.display = register.style.display === "none" ? "block" : "none";
}

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); }
    catch { return null; }
}

function isPM() {
    return localStorage.getItem("auth-role") === "PM";
}

// ====================== ROLE BASED UI ======================
function setupUIByRole() {
    const pm = isPM();

    document.querySelectorAll(".pm-only").forEach(el => {
        el.style.display = pm ? "inline-block" : "none";
    });

    if (!pm) {
        const employeesSection = document.getElementById("employees");
        if (employeesSection) employeesSection.style.display = "none";

        const navEmployees = document.getElementById("nav-employees");
        if (navEmployees) navEmployees.style.display = "none";
    }

    ["project-actions-header", "task-actions-header", "employee-actions-header"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = pm ? "table-cell" : "none";
    });
}

// ====================== PROJECTS ======================
function fetchProjects() {
    const userId = localStorage.getItem("auth-id");
    const url = isPM()
        ? `${API_URL}/getAllProjects`
        : `${API_URL}/getProjectsForEmployee?employeeId=${userId}`;

    authFetch(url)
        .then(res => res.json())
        .then(projects => {
            const table = document.getElementById("project-list");
            table.innerHTML = "";
            projects.forEach(p => {
                table.innerHTML += `
                <tr>
                    <td>${p.name}</td>
                    <td>${p.description}</td>
                    <td>${p.status}</td>
                    <td>${p.endDate}</td>
                    ${isPM() ? `
                    <td>
                        <button onclick="editProject(${p.id})">Modifica</button>
                        <button onclick="deleteProject(${p.id})">Elimina</button>
                    </td>` : "" }
                </tr>`;
            });
        });
}

function saveProject() {
    if (!isPM()) return;
    const id = document.getElementById("project-id").value;
    const project = {
        id: id || null,
        name: document.getElementById("project-name").value,
        description: document.getElementById("project-description").value,
        endDate: document.getElementById("project-endDate").value,
        status: document.getElementById("project-status").value
    };

    authFetch(`${API_URL}/${id ? "updateProject" : "createProject"}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(project)
    }).then(() => { hideProjectForm(); fetchProjects(); });
}

function editProject(id) {
    authFetch(`${API_URL}/getProjectById?id=${id}`)
        .then(res => res.json())
        .then(p => {
            document.getElementById("project-id").value = p.id;
            document.getElementById("project-name").value = p.name;
            document.getElementById("project-description").value = p.description;
            document.getElementById("project-endDate").value = p.endDate;
            document.getElementById("project-status").value = p.status;
            showProjectForm();
        });
}

function deleteProject(id) {
    authFetch(`${API_URL}/deleteProject?id=${id}`, { method: "DELETE" })
        .then(fetchProjects);
}

function showProjectForm() { document.getElementById("project-form").style.display = "block"; }
function hideProjectForm() { document.getElementById("project-form").style.display = "none"; }

// ====================== TASKS ======================
function fetchTasks() {
    const userId = localStorage.getItem("auth-id");
    const url = isPM()
        ? `${API_URL}/getAllTasks`
        : `${API_URL}/getTasksByEmployee?employeeId=${userId}`;

    authFetch(url)
        .then(res => res.json())
        .then(tasks => {
            const table = document.getElementById("task-list");
            table.innerHTML = "";
            tasks.forEach(t => {
                table.innerHTML += `
                <tr>
                    <td>${t.title}</td>
                    <td>${t.description}</td>
                    <td>${t.status}</td>
                    <td>${t.dueDate}</td>
                    <td>${t.project ? t.project.id : ""}</td>
                    <td>${t.employee ? t.employee.id : ""}</td>
                    ${isPM() ? `
                    <td>
                        <button onclick="editTask(${t.id})">Modifica</button>
                        <button onclick="deleteTask(${t.id})">Elimina</button>
                    </td>` : "" }
                </tr>`;
            });
        });
}

function saveTask() {
    const id = document.getElementById("task-id").value;
    const task = {
        id: id || null,
        title: document.getElementById("task-title").value,
        description: document.getElementById("task-description").value,
        dueDate: document.getElementById("task-dueDate").value,
        status: document.getElementById("task-status").value,
        project: { id: document.getElementById("task-project").value },
        employee: { id: document.getElementById("task-employee").value }
    };

    authFetch(`${API_URL}/${id ? "updateTask" : "createTask"}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(task)
    }).then(() => { hideTaskForm(); fetchTasks(); });
}

function editTask(id) {
    authFetch(`${API_URL}/getTaskById?id=${id}`)
        .then(res => res.json())
        .then(t => {
            document.getElementById("task-id").value = t.id;
            document.getElementById("task-title").value = t.title;
            document.getElementById("task-description").value = t.description;
            document.getElementById("task-dueDate").value = t.dueDate;
            document.getElementById("task-status").value = t.status;
            document.getElementById("task-project").value = t.project ? t.project.id : "";
            document.getElementById("task-employee").value = t.employee ? t.employee.id : "";
            showTaskForm();
        });
}

function deleteTask(id) {
    authFetch(`${API_URL}/deleteTask?id=${id}`, { method: "DELETE" })
        .then(fetchTasks);
}

function showTaskForm() { document.getElementById("task-form").style.display = "block"; }
function hideTaskForm() { document.getElementById("task-form").style.display = "none"; }

// ====================== EMPLOYEES ======================
function fetchEmployees() {
    if (!isPM()) return;

    authFetch(`${API_URL}/getAllEmployees`)
        .then(res => res.json())
        .then(employees => {
            const table = document.getElementById("employee-list");
            table.innerHTML = "";

            employees.forEach(e => {
                // Mostro ruolo tecnico o PM
                let technicalRole = e.role === "PM" ? "PM" : (e.roleEmployee || "–");

                table.innerHTML += `
                <tr>
                    <td>${e.name || "–"}</td>
                    <td>${e.role || "–"}</td>
                    <td>${technicalRole}</td>
                    <td>${e.username || "–"}</td>
                    <td>
                        <button onclick="editEmployee(${e.id})">Modifica</button>
                        <button onclick="deleteEmployee(${e.id})">Elimina</button>
                    </td>
                </tr>`;
            });
        })
        .catch(err => console.error("Errore nel fetch dipendenti:", err));
}

function showEmployeeForm() { document.getElementById("employee-form").style.display = "block"; }
function hideEmployeeForm() { document.getElementById("employee-form").style.display = "none"; }

function saveEmployee() {
    const id = document.getElementById("employee-id").value;
    const employee = {
        id: id || null,
        name: document.getElementById("employee-name").value,
        username: document.getElementById("employee-username").value,
        role: document.getElementById("employee-role").value,
        roleEmployee: document.getElementById("employee-employeeRole").value
    };

    authFetch(`${API_URL}/${id ? "updateEmployee" : "createEmployee"}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(employee)
    }).then(() => { hideEmployeeForm(); fetchEmployees(); });
}

function editEmployee(id) {
    authFetch(`${API_URL}/getEmployeeById?id=${id}`)
        .then(res => res.json())
        .then(e => {
            document.getElementById("employee-id").value = e.id;
            document.getElementById("employee-name").value = e.name;
            document.getElementById("employee-username").value = e.username;
            document.getElementById("employee-role").value = e.role;
            document.getElementById("employee-employeeRole").value = e.roleEmployee || "";
            toggleEmployeeFormRoleSelect();
            showEmployeeForm();
        });
}

function deleteEmployee(id) {
    authFetch(`${API_URL}/deleteEmployee?id=${id}`, { method: "DELETE" })
        .then(fetchEmployees);
}

// ====================== INIT ======================
window.onload = () => {
    if (localStorage.getItem("auth-token")) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        setupUIByRole();
        fetchProjects();
        fetchTasks();
        if (isPM()) fetchEmployees();
    }
};
