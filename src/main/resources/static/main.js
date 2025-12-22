const API_URL = "http://localhost:8081/api";

// ---------------------- Login e Registrazione ----------------------

// Funzione per il login
function loginUser() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    // Crea il corpo della richiesta in formato x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()  // Invia i dati come x-www-form-urlencoded
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Login fallito: " + res.statusText);  // Gestione errore se la risposta non è positiva
        }
        return res.json();  // Risposta JSON (contenente il token)
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem("auth-token", data.token);  // Salva il token nel localStorage
            alert("Login riuscito!");
            document.getElementById("login-section").style.display = "none";
            document.getElementById("dashboard").style.display = "block";  // Mostra la dashboard
            fetchProjects();  // Carica i progetti
            fetchTasks();  // Carica i task
            fetchEmployees();  // Carica i dipendenti
        } else {
            alert("Login fallito: " + data.message);  // Se il token non è presente, segnala errore
        }
    })
    .catch(error => {
        console.error("Errore durante il login:", error);
        alert("Si è verificato un errore durante il login.");
    });
}

// Funzione per la registrazione
function registerUser() {
    const username = document.getElementById("register-username").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;

    if (password !== confirmPassword) {
        alert("Le password non corrispondono!");
        return;
    }

    // Crea il corpo della richiesta in formato x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    // Invia i dati di registrazione come x-www-form-urlencoded al backend
    fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()  // Dati inviati come x-www-form-urlencoded
    })
    .then(res => res.text())  // La risposta per la registrazione è di tipo stringa
    .then(data => {
        if (data === "Employee registered successfully") {
            alert("Registrazione riuscita! Puoi ora effettuare il login.");
            toggleForms();  // Mostra il form di login
        } else {
            alert("Errore: " + data);  // Mostra l'errore di registrazione
        }
    })
    .catch(error => {
        console.error("Errore durante la registrazione:", error);
        alert("Si è verificato un errore durante la registrazione.");
    });
}

// Funzione per cambiare tra login e registrazione
function toggleForms() {
    document.getElementById("login-section").style.display =
        document.getElementById("login-section").style.display === "none" ? "block" : "none";
    document.getElementById("register-section").style.display =
        document.getElementById("register-section").style.display === "none" ? "block" : "none";
}

// Funzione per il logout
function logoutUser() {
    localStorage.removeItem("auth-token");  // Rimuove il token di autenticazione
    document.getElementById("dashboard").style.display = "none";  // Nasconde la dashboard
    document.getElementById("login-section").style.display = "block";  // Mostra il form di login
    alert("Logout effettuato.");
}

// ---------------------- Projects ----------------------

// Funzione per ottenere tutti i progetti
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

// Funzione per mostrare il modulo per aggiungere/modificare un progetto
function showProjectForm() {
    document.getElementById("project-id").value = "";
    document.getElementById("project-name").value = "";
    document.getElementById("project-description").value = "";
    document.getElementById("project-endDate").value = "";
    document.getElementById("project-status").value = "";
    document.getElementById("project-form").style.display = "block";
}

// Funzione per salvare un progetto
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

// Funzione per modificare un progetto
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

// Funzione per eliminare un progetto
function deleteProject(id) {
    fetch(`${API_URL}/deleteProject?id=${id}`, { method: "DELETE" })
        .then(() => fetchProjects());
}

// ---------------------- Tasks ----------------------

// Funzione per ottenere tutti i task
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

// Funzione per mostrare il modulo per aggiungere/modificare un task
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

// Funzione per salvare un task
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

// Funzione per modificare un task
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

// Funzione per eliminare un task
function deleteTask(id) {
    fetch(`${API_URL}/deleteTask?id=${id}`, { method: "DELETE" })
        .then(() => fetchTasks());
}

// ---------------------- Employees ----------------------

// Funzione per ottenere tutti i dipendenti
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

// Funzione per mostrare il modulo per aggiungere/modificare un dipendente
function showEmployeeForm() {
    document.getElementById("employee-id").value = "";
    document.getElementById("employee-name").value = "";
    document.getElementById("employee-position").value = "";
    document.getElementById("employee-username").value = "";
    document.getElementById("employee-form").style.display = "block";
}

// Funzione per salvare un dipendente
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

// Funzione per modificare un dipendente
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

// Funzione per eliminare un dipendente
function deleteEmployee(id) {
    fetch(`${API_URL}/deleteEmployee?id=${id}`, { method: "DELETE" })
        .then(() => fetchEmployees());
}

// ---------------------- Init ----------------------

// Carica i dati quando la pagina è pronta
window.onload = () => {
    const token = localStorage.getItem("auth-token");
    if (token) {
        document.getElementById("login-section").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        fetchProjects();
        fetchTasks();
        fetchEmployees();
    } else {
        document.getElementById("login-section").style.display = "block";
        document.getElementById("dashboard").style.display = "none";
    }
};
