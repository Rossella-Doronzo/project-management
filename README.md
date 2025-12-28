# Project Management App – Spring Boot + MySQL + Maven

Un'applicazione web completa per la **gestione di progetti, task e dipendenti**, con **login e ruoli** (PM e Employee).  
Sviluppata con **Spring Boot**, **Java 21**, **MySQL** e un frontend statico moderno **HTML/CSS/JavaScript**.

---

## Descrizione

L'applicazione permette di:

-  Effettuare login e registrazione con ruoli differenti:
  - PM (Project Manager) → può gestire progetti, task e dipendenti
  - Employee → può visualizzare e aggiornare i task assegnati
- Creare, modificare, eliminare progetti (solo PM)
- Creare, modificare, eliminare task e assegnarli a progetti e dipendenti
- Gestire dipendenti (solo PM)
- Frontend interattivo con form, pulsanti di azione e gestione dinamica dei ruoli


---

## Architettura

**Backend Spring Boot**:

- `controller/` → gestisce le richieste REST (Auth, Employee, Project, Task)
- `services/` → logica di business
- `services/impl/` → implementazioni concrete dei servizi
- `repositories/` → interfaccia con il database (Spring Data JPA)
- `model/` → entità JPA
- `security/` → configurazione sicurezza e JWT
- `filter/` → filtro per autenticazione JWT
- `enums/` → enumerazioni per stati, ruoli e permessi
- `config/` → configurazioni generali (es. AppConfig)
- `ProjectManagementApplication.java` → classe principale di avvio

**Frontend statico**:

- `src/main/resources/static/` contiene:
  - `index.html` → interfaccia principale
  - `styles.css` → stile moderno e responsive
  - `main.js` → logica client-side, fetch API e rendering dinamico

---

## Stack Tecnologico

| Componente        | Tecnologia                  |
|------------------|-----------------------------|
| Linguaggio       | Java 21                     |
| Framework        | Spring Boot 2.7.5           |
| Persistenza      | Spring Data JPA (Hibernate) |
| Database         | MySQL 8+                    |
| Build system     | Maven                       |
| Frontend         | HTML, CSS, JavaScript       |
| Server embedded  | Tomcat 10.1.x               |
| IDE consigliato  | IntelliJ IDEA               |

---

## Struttura del progetto

```text
src/
├── main/
│   ├── java/project/
│   │   ├── config/
│   │   │   └── AppConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── EmployeeController.java
│   │   │   ├── ProjectController.java
│   │   │   └── TaskController.java
│   │   ├── enums/
│   │   │   ├── ProjectStatusEnum.java
│   │   │   ├── RoleEmployeeEnum.java
│   │   │   ├── RoleEnum.java
│   │   │   └── TaskStatusEnum.java
│   │   ├── filter/
│   │   │   └── JwtAuthenticationFilter.java
│   │   ├── model/
│   │   │   ├── Employee.java
│   │   │   ├── Project.java
│   │   │   └── Task.java
│   │   ├── repositories/
│   │   │   ├── EmployeeRepository.java
│   │   │   ├── ProjectRepository.java
│   │   │   └── TaskRepository.java
│   │   ├── security/
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── SecurityConfig.java
│   │   │   ├── UserDetailService.java
│   │   │   └── UserDetailsServiceImpl.java
│   │   ├── services/
│   │   │   ├── EmployeeService.java
│   │   │   ├── ProjectService.java
│   │   │   ├── TaskService.java
│   │   │   └── impl/
│   │   │       ├── EmployeeServiceImpl.java
│   │   │       ├── ProjectServiceImpl.java
│   │   │       └── TaskServiceImpl.java
│   │   └── ProjectManagementApplication.java
│   └── resources/
│       ├── static/
│       │   ├── index.html
│       │   ├── main.js
│       │   └── styles.css
│       └── application.properties
└── test/
    └── project/
        ProjectManagementApplicationTests.java


 ```

## Setup e Avvio

### 1) Prerequisiti

- Java JDK ≥ 17 
- Maven ≥ 3.9
- MySQL ≥ 8.0
- IntelliJ IDEA o altro IDE compatibile

### Configurazione Database

Crea il database MySQL:

```sql
CREATE DATABASE project_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

```

### 3) Configurazione MySQL in `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/project_management?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

server.port=8081

```

### 4) Avvio del progetto

- In IntelliJ IDEA:
    - Apri il progetto Maven (`pom.xml`)
    - Esegui Load Maven Project
    - Avvia la classe `ProjectManagementApplication`
- Apri [http://localhost:8081](http://localhost:8081) nel browser

---

---

## Endpoint API Principali

| Metodo | Endpoint                     | Descrizione                                  |
|--------|------------------------------|---------------------------------------------|
| POST   | `/auth/login`                 | Effettua il login dell’utente               |
| POST   | `/auth/register`              | Registra un nuovo utente                     |
| GET    | `/employees`                  | Elenca tutti i dipendenti                   |
| POST   | `/employees`                  | Crea un nuovo dipendente (PM only)          |
| PUT    | `/employees/{id}`             | Aggiorna i dati di un dipendente (PM only)  |
| DELETE | `/employees/{id}`             | Elimina un dipendente (PM only)             |
| GET    | `/projects`                   | Elenca tutti i progetti                      |
| POST   | `/projects`                   | Crea un nuovo progetto (PM only)            |
| PUT    | `/projects/{id}`              | Aggiorna un progetto esistente (PM only)    |
| DELETE | `/projects/{id}`              | Elimina un progetto (PM only)               |
| GET    | `/tasks`                      | Elenca tutti i task                          |
| POST   | `/tasks`                      | Crea un nuovo task                           |
| PUT    | `/tasks/{id}`                 | Aggiorna un task esistente                   |
| DELETE | `/tasks/{id}`                 | Elimina un task                              |

---

## Frontend

Il frontend è servito da Spring Boot tramite la cartella `src/main/resources/static`:



### Funzionalità Frontend

- **Login e registrazione**: gestione token JWT e autenticazione
- **Dashboard dinamica**: mostra solo le sezioni consentite in base al ruolo (PM/Employee)
- **Gestione Progetti**: visualizzazione, creazione, modifica ed eliminazione (PM only)
- **Gestione Task**: visualizzazione, creazione, modifica ed eliminazione
- **Gestione Dipendenti**: creazione, modifica ed eliminazione (PM only)
- **Interattività avanzata**: tabelle dinamiche, modali per inserimento/modifica dati, notifiche e alert per azioni completate


---

## Autore

Rossella Doronzo