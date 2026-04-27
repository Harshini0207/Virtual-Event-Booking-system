-- virtual_event.sql
CREATE DATABASE virtual_event;
USE virtualevent;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100),
password VARCHAR(100)
);

CREATE TABLE organizers(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100)
);

CREATE TABLE events(
id INT AUTO_INCREMENT PRIMARY KEY,
event_name VARCHAR(100),
description TEXT,
price DECIMAL(10,2)
);

CREATE TABLE bookings(
id INT AUTO_INCREMENT PRIMARY KEY,
event_name VARCHAR(100),
description TEXT,
price DECIMAL(10,2)
);

CREATE TABLE payments(
id INT AUTO_INCREMENT PRIMARY KEY,
event_name VARCHAR(100),
amount DECIMAL(10,2),
status VARCHAR(50),
date_time DATETIME
);