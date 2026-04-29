# 🚀 Predictive Maintenance Lite

A full-stack web application for monitoring assets and predicting maintenance needs using threshold-based evaluation. Built with a modern industrial UI and real-time data visualization.

---

## 🛠 Tech Stack

**Backend**
- Spring Boot (Java)
- MySQL
- Hibernate / JPA
- REST APIs

**Frontend**
- Angular 17
- Angular Material
- ng2-charts

---

## 📦 Project Structure

### 🔙 Backend (Spring Boot)
- **Entities**: Asset, Sensor, Reading, Threshold, MaintenanceTicket  
- **Repositories**: JPA repositories with custom JPQL queries  
- **Services**:
  - MaintenanceService (threshold evaluation)
  - ReadingService  
- **Controllers**:
  - AssetController  
  - ReadingController  
  - ThresholdController  
  - TicketController  
- **DTOs**:
  - OpenCountDto  
  - ThresholdDto  
- **Configuration**:
  - CORS enabled for Angular frontend  
- **Database Scripts**:
  - schema.sql  
  - data.sql  

---

### 🎨 Frontend (Angular)
- **Components**:
  - Asset List  
  - Reading Chart  
  - Threshold Form  
  - Ticket Panel  
- **Services**:
  - AssetService  
  - ReadingService  
  - ThresholdService  
  - TicketService  
- **Models**:
  - Asset, Reading, Threshold, Ticket  
  - OpenCountDto  
  - Page<T>  
- **UI Features**:
  - Dark industrial theme  
  - Status indicators (including NEEDS_ATTENTION)

---

## ⚙️ Features

- Real-time asset monitoring  
- Data visualization with charts  
- Threshold-based anomaly detection  
- Automatic maintenance ticket generation  
- Maintenance ticket management  
- REST API integration  
- Responsive UI  

---

## 🚀 Getting Started

### 1. Database Setup

Create database in MySQL:

```sql
CREATE DATABASE predictive_maintenance;
```

Update credentials in:

backend/src/main/resources/application.properties

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

---

### 2. Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend URL:
http://localhost:8080

---

### 3. Run Frontend

```bash
cd frontend
npm install
ng serve
```

Frontend URL:
http://localhost:4200

---

## 🔄 How It Works

1. Sensor readings are stored in the database  
2. Thresholds are defined for each asset  
3. MaintenanceService evaluates readings  
4. If thresholds are exceeded → maintenance ticket is created  
5. UI displays alerts and tickets  

---

## 🧪 Sample Data

Database schema and sample data are automatically loaded using:
- schema.sql  
- data.sql  

---

## 🐞 Common Issues

### MySQL Access Denied
Make sure the password in application.properties is correct.

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
```

---

### Port Already in Use

```properties
server.port=8081
```

---

## 📌 Future Improvements

- Machine learning-based prediction  
- Real-time streaming (Kafka/WebSockets)  
- Authentication & role management  
- Cloud deployment  

---

## 👩‍💻 Author

Your Name / Team Name

---

## 📄 License

This project is for educational purposes.

---

## ⭐ Contributing

Feel free to fork the repository and submit pull requests.
