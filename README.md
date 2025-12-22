# Train Booking – Spring Boot + MySQL + Maven

Un’applicazione **demo completa** per la **prenotazione di viaggi in treno**, sviluppata con **Spring Boot**, **Java 24 (target 17)**, **MySQL** e un frontend statico **HTML/CSS/JavaScript** moderno e responsive.

---

##  Descrizione

Il progetto simula una piattaforma per:

- cercare treni per **data**, **origine** e **destinazione**
- **prenotare** un viaggio (scegliendo **carrozza** e **posto**)
- generare automaticamente un **biglietto (ticket)** con **codice univoco**
- consultare i **biglietti** emessi nella sessione corrente

---

## Architettura

**Spring Boot** fornisce l’infrastruttura backend completa:

- **Controller** → gestiscono le richieste **HTTP REST**
- **Service** → contengono la **logica di business**
- **Repository (JPA)** → accedono al **database**
- **Model (Entity)** → rappresentano le **tabelle del DB**
- **Frontend statico** (HTML/CSS/JS) servito da `src/main/resources/static`

---

## Stack Tecnologico

| Componente | Tecnologia |
|-------------|-------------|
| **Linguaggio** | Java 24 (target 17) |
| **Framework backend** | Spring Boot 3.5.6 |
| **Persistenza** | Spring Data JPA (Hibernate) |
| **Database** | MySQL 8+ |
| **Build system** | Maven |
| **Frontend** | HTML, CSS, JavaScript |
| **IDE consigliato** | IntelliJ IDEA |
| **Server embedded** | Apache Tomcat 10.1.x |

---

## 📁 Struttura del progetto

```text
train-booking/
├── src/
│   ├── main/
│   │   ├── java/Pasquale/train_booking/
│   │   │   ├── controller/   # Controller REST
│   │   │   ├── service/      # Logica di business
│   │   │   ├── repository/   # Repository JPA
│   │   │   ├── model/        # Entità JPA (tabelle DB)
│   │   │   └── TrainBookingApplication.java
│   │   └── resources/
│   │       ├── static/       # Frontend HTML, CSS, JS
│   │       ├── application.properties
│   │
├── pom.xml
└── README.md
 ```

## Setup e Avvio

### 1) Prerequisiti

- Java JDK ≥ 17 (Java 24 va benissimo come runtime)
- Maven ≥ 3.9
- MySQL ≥ 8.0
- IntelliJ IDEA o altro IDE compatibile

### 2) Creazione Database e Tabelle (Schema + Seed)

Esegui il seguente script nel tuo MySQL (MySQL Workbench o terminale):
```sql
-- =========================================================
-- Train Booking – Schema + Seed (MySQL 8+)
-- Autore: Pasquale
-- Nota: eseguire con un utente che abbia permessi CREATE
-- =========================================================

CREATE DATABASE IF NOT EXISTS train_booking
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE train_booking;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS ticket;
DROP TABLE IF EXISTS booking;
DROP TABLE IF EXISTS seat;
DROP TABLE IF EXISTS carriage;
DROP TABLE IF EXISTS trip;
DROP TABLE IF EXISTS train;
DROP TABLE IF EXISTS station;
SET FOREIGN_KEY_CHECKS = 1;

-- STATION
CREATE TABLE station (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
code VARCHAR(10) NOT NULL,
name VARCHAR(200) NOT NULL,
CONSTRAINT uk_station_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TRAIN
CREATE TABLE train (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(200) NOT NULL,
carriages INT NOT NULL,
seats_per_carriage INT NOT NULL,
INDEX idx_train_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CARRIAGE
CREATE TABLE carriage (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
train_id BIGINT NOT NULL,
number INT NOT NULL,
CONSTRAINT fk_carriage_train
FOREIGN KEY (train_id) REFERENCES train(id)
ON UPDATE CASCADE ON DELETE CASCADE,
CONSTRAINT uk_carriage_train_number UNIQUE (train_id, number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEAT
CREATE TABLE seat (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
carriage_id BIGINT NOT NULL,
seat_number INT NOT NULL,
occupied BOOLEAN NOT NULL DEFAULT FALSE,
CONSTRAINT fk_seat_carriage
FOREIGN KEY (carriage_id) REFERENCES carriage(id)
ON UPDATE CASCADE ON DELETE CASCADE,
CONSTRAINT uk_seat_carriage_number UNIQUE (carriage_id, seat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TRIP
CREATE TABLE trip (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
origin_id BIGINT NOT NULL,
destination_id BIGINT NOT NULL,
travel_date DATE NOT NULL,
departure_time TIME NOT NULL,
arrival_time TIME NOT NULL,
price DECIMAL(10,2) NOT NULL,
CONSTRAINT fk_trip_origin
FOREIGN KEY (origin_id) REFERENCES station(id)
ON UPDATE CASCADE ON DELETE RESTRICT,
CONSTRAINT fk_trip_destination
FOREIGN KEY (destination_id) REFERENCES station(id)
ON UPDATE CASCADE ON DELETE RESTRICT,
INDEX idx_trip_lookup (origin_id, destination_id, travel_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKING
CREATE TABLE booking (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
trip_id BIGINT NOT NULL,
passenger_name VARCHAR(200) NOT NULL,
passenger_email VARCHAR(200) NOT NULL,
booking_date DATE,
carriage_number INT NOT NULL,
seat_number INT NOT NULL,
price DECIMAL(10,2),
CONSTRAINT fk_booking_trip
FOREIGN KEY (trip_id) REFERENCES trip(id)
ON UPDATE CASCADE ON DELETE CASCADE,
CONSTRAINT uk_booking_unique_seat UNIQUE (trip_id, carriage_number, seat_number),
INDEX idx_booking_trip (trip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TICKET
CREATE TABLE ticket (
id BIGINT PRIMARY KEY AUTO_INCREMENT,
booking_id BIGINT NOT NULL,
ticket_code VARCHAR(50) NOT NULL,
valid_until DATE NOT NULL,
CONSTRAINT fk_ticket_booking
FOREIGN KEY (booking_id) REFERENCES booking(id)
ON UPDATE CASCADE ON DELETE CASCADE,
CONSTRAINT uk_ticket_code UNIQUE (ticket_code),
CONSTRAINT uk_ticket_booking UNIQUE (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dati di esempio
INSERT INTO station (code, name) VALUES
('MIL','Milano Centrale'),
('ROM','Roma Termini'),
('FIR','Firenze S.M.N.'),
('NAP','Napoli Centrale');

INSERT INTO train (name, carriages, seats_per_carriage) VALUES
('Frecciarossa 9510', 8, 80),
('Italo 8901', 10, 70);

INSERT INTO carriage (train_id, number) VALUES
(1,1),(1,2),(1,3),(1,4),(2,1),(2,2),(2,3);

INSERT INTO seat (carriage_id, seat_number, occupied) VALUES
(1,1,false),(1,2,false),(1,3,false),(1,4,false),(1,5,false),
(1,6,false),(1,7,false),(1,8,false),(1,9,false),(1,10,false),
(2,1,false),(2,2,false),(2,3,false),(2,4,false),(2,5,false),
(2,6,false),(2,7,false),(2,8,false),(2,9,false),(2,10,false),
(5,1,false),(5,2,false),(5,3,false),(5,4,false),(5,5,false);

INSERT INTO trip (origin_id, destination_id, travel_date, departure_time, arrival_time, price) VALUES
((SELECT id FROM station WHERE code='MIL'), (SELECT id FROM station WHERE code='ROM'),
'2025-10-20', '08:30:00', '12:30:00', 49.90),
((SELECT id FROM station WHERE code='MIL'), (SELECT id FROM station WHERE code='FIR'),
'2025-10-20', '09:00:00', '11:00:00', 29.90),
((SELECT id FROM station WHERE code='FIR'), (SELECT id FROM station WHERE code='ROM'),
'2025-10-20', '15:00:00', '17:30:00', 25.00),
((SELECT id FROM station WHERE code='MIL'), (SELECT id FROM station WHERE code='ROM'),
'2025-10-21', '07:10:00', '11:15:00', 39.90),
((SELECT id FROM station WHERE code='ROM'), (SELECT id FROM station WHERE code='NAP'),
'2025-10-20', '10:00:00', '11:10:00', 19.90);

INSERT INTO booking (trip_id, passenger_name, passenger_email, booking_date, carriage_number, seat_number, price)
VALUES (
(SELECT MIN(id) FROM trip WHERE travel_date='2025-10-20' AND origin_id=(SELECT id FROM station WHERE code='MIL') AND destination_id=(SELECT id FROM station WHERE code='ROM')),
'Mario Rossi', 'mario.rossi@example.com', CURRENT_DATE, 2, 15, 49.90
);

INSERT INTO ticket (booking_id, ticket_code, valid_until)
VALUES (
(SELECT MAX(id) FROM booking),
CONCAT('TCK-', UPPER(SUBSTRING(REPLACE(UUID(),'-',''),1,8))),
DATE_ADD('2025-10-20', INTERVAL 1 DAY)
);
```

### 3) Configurazione MySQL in `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/train_booking?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root

spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.sql.init.mode=always

server.port=8081
```

### 4) Avvio del progetto

- In IntelliJ IDEA:
    - Apri il progetto Maven (`pom.xml`)
    - Esegui Load Maven Project
    - Avvia la classe `Pasquale.train_booking.TrainBookingApplication`
- Apri [http://localhost:8081](http://localhost:8081) nel browser

---

## Endpoint API Principali

| Metodo | Endpoint                                                | Descrizione             |
|--------|---------------------------------------------------------|------------------------|
| GET    | `/api/health`                                           | Verifica stato server  |
| GET    | `/api/trips/search?origin=MIL&destination=ROM&date=2025-10-20` | Cerca treni disponibili |
| POST   | `/api/bookings`                                         | Crea una prenotazione  |
| GET    | `/api/stations`                                         | Elenca le stazioni disponibili |

---

## Frontend

Il frontend è servito automaticamente da Spring Boot (`/src/main/resources/static`):

- `index.html` → interfaccia principale per ricerca e prenotazione
- `styles.css` → stile responsive e moderno
- `app.js` → logica client (fetch API, validazioni, rendering risultati, toast)

---

## Autore

Pasquale Sorrentino – Packeged App Development Analyst Jr