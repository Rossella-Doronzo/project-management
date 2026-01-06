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

// ====================== UTILITIES ======================
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

function isPM() {
    return localStorage.getItem("auth-role") === "PM";
}

// ====================== LOGIN / LOGOUT ======================
function loginUser(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("login-username");
    const passwordInput = document.getElementById("login-password");

    const username = usernameInput?.value;
    const password = passwordInput?.value;

    if (!username || !password) return alert("Inserisci username e password");

    fetch(`${API_URL}/auth/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: "POST"
    })
    .then(res => {
        if (!res.ok) throw new Error("Credenziali non valide");
        return res.json();
    })
    .then(data => {
        localStorage.setItem("auth-token", data.token);
        const payload = parseJwt(data.token);
        localStorage.setItem("auth-role", payload.role);
        localStorage.setItem("auth-username", payload.sub);
        localStorage.setItem("auth-id", payload.id);

        toggleDashboard(true);
        setupUIByRole();
        fetchProjects();
        fetchTasks();
        if (isPM()) fetchEmployees();
    })
    .catch(err => alert(err.message));
}

function logoutUser(e) {
    if (e) e.preventDefault();
    localStorage.clear();
    toggleDashboard(false);
}

// ====================== DASHBOARD TOGGLE ======================
function toggleDashboard(show) {
    const loginSection = document.getElementById("login-section");
    const dashboard = document.getElementById("dashboard");
    if (loginSection) loginSection.style.display = show ? "none" : "block";
    if (dashboard) dashboard.style.display = show ? "block" : "none";
}

// ====================== ROLE BASED UI ======================
function setupUIByRole() {
    const pm = isPM();
    document.querySelectorAll(".pm-only").forEach(el => {
        el.style.display = pm ? "inline-block" : "none";
    });

    const employeesSection = document.getElementById("employees");
    if (employeesSection) employeesSection.style.display = pm ? "block" : "none";
}

// ====================== PROJECTS ======================
async function fetchProjects() {
    try {
        const userId = localStorage.getItem("auth-id");
        const url = isPM()
            ? `${API_URL}/getAllProjects`
            : `${API_URL}/getProjectsForEmployee?employeeId=${userId}`;

        const res = await authFetch(url);
        const projects = await res.json();

        const table = document.getElementById("project-list");
        if (!table) return;
        table.innerHTML = "";

        projects.forEach(p => {
            table.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.description}</td>
                    <td>${p.status}</td>
                    <td>${p.endDate || ""}</td>
                    <td>${isPM() ? `
                        <button class="btn" onclick="editProject(${p.id})">Modifica</button>
                        <button class="btn" onclick="deleteProject(${p.id})">Elimina</button>` : "" }
                    </td>
                </tr>`;
        });
    } catch(err) {
        alert("Errore caricamento progetti: " + err.message);
    }
}

function showProjectForm(project = null) {
    const form = document.getElementById("project-form");
    if (!form) return;
    form.style.display = "block";

    const idInput = document.getElementById("project-id");
    const nameInput = document.getElementById("project-name");
    const descInput = document.getElementById("project-description");
    const endDateInput = document.getElementById("project-endDate");
    const statusInput = document.getElementById("project-status");

    if (idInput) idInput.value = project?.id || "";
    if (nameInput) nameInput.value = project?.name || "";
    if (descInput) descInput.value = project?.description || "";
    if (endDateInput) endDateInput.value = project?.endDate || "";
    if (statusInput) statusInput.value = project?.status || "IN_PROGRESS";
}

function hideProjectForm() {
    const form = document.getElementById("project-form");
    if (form) form.style.display = "none";
}

async function saveProject() {
    try {
        const idInput = document.getElementById("project-id");
        const id = idInput?.value;

        const project = {
            id: id ? parseInt(id) : null,
            name: document.getElementById("project-name")?.value,
            description: document.getElementById("project-description")?.value,
            endDate: document.getElementById("project-endDate")?.value || "",
            status: document.getElementById("project-status")?.value || "IN_PROGRESS"
        };

        const res = await authFetch(`${API_URL}/${id ? "updateProject" : "createProject"}`, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(project)
        });

        if (!res.ok) throw new Error("Errore nel salvataggio progetto");

        hideProjectForm();
        fetchProjects();
    } catch(err) {
        alert(err.message);
    }
}

async function editProject(id) {
    try {
        const res = await authFetch(`${API_URL}/getProjectById?id=${id}`);
        const project = await res.json();
        showProjectForm(project);
    } catch(err) {
        alert("Errore caricamento progetto: " + err.message);
    }
}

async function deleteProject(id) {
    try {
        await authFetch(`${API_URL}/deleteProject?id=${id}`, { method: "DELETE" });
        fetchProjects();
    } catch(err) {
        alert("Errore eliminazione progetto: " + err.message);
    }
}

// ====================== EMPLOYEES ======================
async function fetchEmployees() {
    if (!isPM()) return;
    try {
        const res = await authFetch(`${API_URL}/getAllEmployees`);
        const employees = await res.json();

        const table = document.getElementById("employee-list");
        if (!table) return;
        table.innerHTML = "";

        employees.forEach(e => {
            table.innerHTML += `
                <tr>
                    <td>${e.id}</td>
                    <td>${e.name}</td>
                    <td>${e.username}</td>
                    <td>${e.role}</td>
                    <td>${e.roleEmployee || "–"}</td>
                    <td>
                        <button class="btn" onclick="editEmployee(${e.id})">Modifica</button>
                        <button class="btn" onclick="deleteEmployee(${e.id})">Elimina</button>
                    </td>
                </tr>`;
        });
    } catch(err) {
        alert("Errore caricamento dipendenti: " + err.message);
    }
}

function showEmployeeForm(employee = null) {
    const form = document.getElementById("employee-form");
    if (!form) return;
    form.style.display = "block";

    const idInput = document.getElementById("employee-id");
    const nameInput = document.getElementById("employee-name");
    const usernameInput = document.getElementById("employee-username");
    const roleSelect = document.getElementById("employee-role");
    const employeeRoleSelect = document.getElementById("employee-employeeRole");

    if (idInput) idInput.value = employee?.id || "";
    if (nameInput) nameInput.value = employee?.name || "";
    if (usernameInput) usernameInput.value = employee?.username || "";

    if (roleSelect && employeeRoleSelect) {
        const role = employee?.role || "EMPLOYEE";
        roleSelect.value = role;
        toggleEmployeeRoleSelect(role);
        employeeRoleSelect.value = employee?.roleEmployee || "JUNIOR_DEVELOPER";
    }
}

function hideEmployeeForm() {
    const form = document.getElementById("employee-form");
    if (form) form.style.display = "none";
}

function toggleEmployeeRoleSelect(role) {
    const select = document.getElementById("employee-employeeRole");
    if (!select) return;
    select.style.display = (role === "EMPLOYEE") ? "inline-block" : "none";
}

async function saveEmployee() {
    try {
        const id = document.getElementById("employee-id")?.value;

        const employee = {
            id: id ? parseInt(id) : null,
            name: document.getElementById("employee-name")?.value,
            username: document.getElementById("employee-username")?.value,
            role: document.getElementById("employee-role")?.value || "EMPLOYEE",
            roleEmployee: document.getElementById("employee-employeeRole")?.value || "JUNIOR_DEVELOPER"
        };

        const res = await authFetch(`${API_URL}/${id ? "updateEmployee" : "createEmployee"}`, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(employee)
        });

        if (!res.ok) throw new Error("Errore salvataggio dipendente");

        hideEmployeeForm();
        fetchEmployees();
    } catch(err) {
        alert(err.message);
    }
}

async function editEmployee(id) {
    try {
        const res = await authFetch(`${API_URL}/getEmployeeById?id=${id}`);
        const employee = await res.json();
        showEmployeeForm(employee);
    } catch(err) {
        alert("Errore caricamento dipendente: " + err.message);
    }
}

async function deleteEmployee(id) {
    try {
        await authFetch(`${API_URL}/deleteEmployee?id=${id}`, { method: "DELETE" });
        fetchEmployees();
    } catch(err) {
        alert("Errore eliminazione dipendente: " + err.message);
    }
}

// ====================== TASKS ======================
async function fetchTasks() {
    try {
        const userId = localStorage.getItem("auth-id");
        const url = isPM()
            ? `${API_URL}/getAllTasks`
            : `${API_URL}/getTasksByEmployee?employeeId=${userId}`;

        const res = await authFetch(url);
        const tasks = await res.json();

        const table = document.getElementById("task-list");
        if (!table) return;
        table.innerHTML = "";

        tasks.forEach(t => {
            let statusContent = t.status;

            if (!isPM() && t.employee?.id == userId) {
                statusContent = `
                    <select id="status-${t.id}">
                        <option value="TO_DO" ${t.status === 'TO_DO' ? 'selected' : ''}>To Do</option>
                        <option value="IN_PROGRESS" ${t.status === 'IN_PROGRESS' ? 'selected' : ''}>In Progress</option>
                        <option value="COMPLETED" ${t.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button class="btn" onclick="saveTaskStatus(${t.id})">Salva</button>
                `;
            }

            table.innerHTML += `
                <tr>
                    <td>${t.title}</td>
                    <td>${t.description}</td>
                    <td>${statusContent}</td>
                    <td>${t.dueDate || ""}</td>
                    <td>${t.project?.id || ""}</td>
                    <td>${t.employee?.id || ""}</td>
                    <td>
                        ${isPM() ? `
                            <button class="btn" onclick="editTask(${t.id})">Modifica</button>
                            <button class="btn" onclick="deleteTask(${t.id})">Elimina</button>
                        ` : ""}
                    </td>
                </tr>`;
        });
    } catch(err) {
        alert("Errore caricamento tasks: " + err.message);
    }
}


function showTaskForm(task = null) {
    const form = document.getElementById("task-form");
    if (!form) return;
    form.style.display = "block";

    const idInput = document.getElementById("task-id");
    const titleInput = document.getElementById("task-title");
    const descInput = document.getElementById("task-description");
    const dueInput = document.getElementById("task-dueDate");
    const statusInput = document.getElementById("task-status");
    const projectSelect = document.getElementById("task-project");
    const employeeSelect = document.getElementById("task-employee");

    // Riempio i campi comuni
    if (idInput) idInput.value = task?.id || "";
    if (titleInput) titleInput.value = task?.title || "";
    if (descInput) descInput.value = task?.description || "";
    if (dueInput) dueInput.value = task?.dueDate || "";
    if (statusInput) statusInput.value = task?.status || "TO_DO";

    if (!task) {
        // CREAZIONE NUOVO TASK
        if (isPM()) {
            // Carica i progetti e i dipendenti solo se PM
            loadProjectsSelect();
            loadEmployeesSelect();

            // Mostra le dropdown per i progetti e i dipendenti
            if (projectSelect) projectSelect.style.display = "inline-block";
            if (employeeSelect) employeeSelect.style.display = "inline-block";

            projectSelect.disabled = false;
            employeeSelect.disabled = false;

            // PM può modificare tutti i campi
            titleInput.readOnly = false;  // PM può modificare il titolo
            descInput.readOnly = false;   // PM può modificare la descrizione
            dueInput.readOnly = false;    // PM può modificare la data
            statusInput.disabled = false;  // PM può modificare lo status
        } else {
            // Employee non può creare task
            form.style.display = "none";
        }
    } else {
        // MODIFICA TASK
        if (isPM()) {
            if (projectSelect) projectSelect.style.display = "none";
            if (employeeSelect) employeeSelect.style.display = "none";

            projectSelect.disabled = true;
            employeeSelect.disabled = true;

            projectSelect.innerHTML = "";
             employeeSelect.innerHTML = "";

            // PM: può modificare titolo, descrizione, data, status
            titleInput.readOnly = false;   // PM può modificare il titolo
            descInput.readOnly = false;    // PM può modificare la descrizione
            dueInput.readOnly = false;     // PM può modificare la data
            statusInput.disabled = false;  // PM può modificare lo status
        } else {
            // Employee: può modificare solo lo status
            if (projectSelect) projectSelect.style.display = "none";
            if (employeeSelect) employeeSelect.style.display = "none";

            // Employee non può modificare titolo, descrizione, data
            titleInput.readOnly = true;    // Employee non può modificare il titolo
            descInput.readOnly = true;     // Employee non può modificare la descrizione
            dueInput.readOnly = true;      // Employee non può modificare la data
            statusInput.disabled = false;  // Employee può modificare solo lo status
        }
    }
}



function hideTaskForm() {
    const form = document.getElementById("task-form");
    if (form) form.style.display = "none";
}

async function saveTask() {
    try {
        const idInput = document.getElementById("task-id");
        const id = idInput?.value;

        let task;

        if (!id) {
            // CREAZIONE TASK NUOVO
            const projectId = document.getElementById("task-project")?.value;
            const employeeId = document.getElementById("task-employee")?.value;

            task = {
                title: document.getElementById("task-title")?.value,
                description: document.getElementById("task-description")?.value,
                dueDate: document.getElementById("task-dueDate")?.value || "",
                status: document.getElementById("task-status")?.value || "TO_DO",
                project: projectId ? { id: parseInt(projectId) } : null,
                employee: employeeId ? { id: parseInt(employeeId) } : null
            };
        } else {
            // MODIFICA TASK
            const title = document.getElementById("task-title")?.value;
            const desc = document.getElementById("task-description")?.value;
            const due = document.getElementById("task-dueDate")?.value || "";
            const status = document.getElementById("task-status")?.value || "TO_DO";

            if (isPM()) {
                // PM modifica titolo, descrizione, data, status
                task = {
                    id: parseInt(id),
                    title,
                    description: desc,
                    dueDate: due,
                    status
                };
            } else {
                // Employee modifica solo lo status
                task = {
                    id: parseInt(id),
                    status
                };
            }
        }

        const res = await authFetch(`${API_URL}/${id ? "updateTask" : "createTask"}`, {
            method: id ? "PUT" : "POST",
            body: JSON.stringify(task)
        });

        if (!res.ok) throw new Error("Errore nel salvataggio del task");

        hideTaskForm();
        fetchTasks();
    } catch(err) {
        alert(err.message);
    }
}

async function editTask(id) {
    try {
        const res = await authFetch(`${API_URL}/getTaskById?id=${id}`);
        const task = await res.json();
        showTaskForm(task);
    } catch(err) {
        alert("Errore caricamento task: " + err.message);
    }
}

async function deleteTask(id) {
    try {
        await authFetch(`${API_URL}/deleteTask?id=${id}`, { method: "DELETE" });
        fetchTasks();
    } catch(err) {
        alert("Errore eliminazione task: " + err.message);
    }
}

// ====================== SELECT LOADERS ======================
async function loadProjectsSelect(selectedId = null) {
    const select = document.getElementById("task-project");
    if (!select) return;
    select.innerHTML = `<option value="">-- Seleziona progetto --</option>`;
    try {
        const res = await authFetch(`${API_URL}/getAllProjects`);
        const projects = await res.json();
        projects.forEach(p => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.id} - ${p.name}`;
            if (selectedId && p.id == selectedId) opt.selected = true;
            select.appendChild(opt);
        });
    } catch(err) {
        alert("Errore caricamento progetti per task: " + err.message);
    }
}

async function loadEmployeesSelect(selectedId = null) {
    const select = document.getElementById("task-employee");
    if (!select) return;
    select.innerHTML = `<option value="">-- Seleziona dipendente --</option>`;
    try {
        const res = await authFetch(`${API_URL}/getAllEmployees`);
        const employees = await res.json();
        employees.forEach(e => {
            const opt = document.createElement("option");
            opt.value = e.id;
            opt.textContent = `${e.id} - ${e.name} (${e.role})`;
            if (selectedId && e.id == selectedId) opt.selected = true;
            select.appendChild(opt);
        });
    } catch(err) {
        alert("Errore caricamento dipendenti per task: " + err.message);
    }
}

async function saveTaskStatus(taskId) {
    try {
        const statusSelect = document.getElementById(`status-${taskId}`);
        const newStatus = statusSelect.value;

        const res = await authFetch(`${API_URL}/updateTask`, {
            method: "PUT",
            body: JSON.stringify({
                id: taskId,
                status: newStatus
            })
        });

        if (!res.ok) throw new Error("Errore nel salvataggio dello stato");

        fetchTasks(); // aggiorna la tabella
    } catch (err) {
        alert(err.message);
    }
}


// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
    // Login e logout
    const loginBtn = document.getElementById("login-btn");
    if (loginBtn) loginBtn.addEventListener("click", loginUser);

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

    // Toggle role per employee form
    const roleSelect = document.getElementById("employee-role");
    if (roleSelect) {
        roleSelect.addEventListener("change", (e) => toggleEmployeeRoleSelect(e.target.value));
    }

    // Se già loggato
    if (localStorage.getItem("auth-token")) {
        toggleDashboard(true);
        setupUIByRole();
        fetchProjects();
        fetchTasks();
        if (isPM()) fetchEmployees();
    }
});
