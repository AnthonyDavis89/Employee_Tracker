SET FOREIGN_KEY_CHECKS=0;

DROP DATABASE IF EXISTS employeeDB;

CREATE DATABASE employeeDB;

USE employeeDB;

-- Creating the department table 
CREATE TABLE department (
id INT NOT NULL AUTO_INCREMENT,
dname VARCHAR(30) UNIQUE NOT NULL,
PRIMARY KEY (id)
);

-- Creating the role table (note that could ot name the table role because it seemed to be a reserved word)
CREATE TABLE roles (
id INT NOT NULL AUTO_INCREMENT,
title VARCHAR(30) NOT NULL,
salary DECIMAL(10,0) NOT NULL,
department_id INT NOT NULL,
PRIMARY KEY (id),
CONSTRAINT fkey_department FOREIGN KEY(department_id) REFERENCES department(id) ON DELETE CASCADE
);

-- Creating the employee table 
CREATE TABLE employee (
id INT NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INT NOT NULL,
manager_id INT NULL,
PRIMARY KEY (id),
CONSTRAINT fkey_role FOREIGN KEY(role_id) REFERENCES roles(id) ON DELETE CASCADE,
CONSTRAINT fkey_manager FOREIGN KEY(manager_id) REFERENCES employee(id) ON DELETE SET NULL
);

