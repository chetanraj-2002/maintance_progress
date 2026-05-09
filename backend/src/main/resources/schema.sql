CREATE DATABASE IF NOT EXISTS predictive_maintenance;
USE predictive_maintenance;

CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    phone VARCHAR(40),
    password_hash VARCHAR(200) NOT NULL,
    role ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
    reset_token VARCHAR(120),
    reset_token_expiry DATETIME,
    created_at DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS assets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    asset_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    status ENUM('HEALTHY','WARNING','NEEDS_ATTEN','ALERT') NOT NULL DEFAULT 'HEALTHY'
);

CREATE TABLE IF NOT EXISTS sensors (
    id BIGINT PRIMARY KEY,
    asset_id BIGINT NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    CONSTRAINT fk_sensor_asset FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE IF NOT EXISTS readings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sensor_id BIGINT NOT NULL,
    rms DOUBLE NOT NULL,
    temperature DOUBLE NOT NULL,
    timestamp DATETIME NOT NULL,
    CONSTRAINT fk_reading_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

CREATE TABLE IF NOT EXISTS thresholds (
    id BIGINT PRIMARY KEY,
    asset_id BIGINT NOT NULL UNIQUE,
    rms_max DOUBLE NOT NULL DEFAULT 10.0,
    temp_max DOUBLE NOT NULL DEFAULT 80.0,
    CONSTRAINT fk_threshold_asset FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    asset_id BIGINT NOT NULL,
    issue_type VARCHAR(50) NOT NULL,
    status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_ticket_asset FOREIGN KEY (asset_id) REFERENCES assets(id)
);
