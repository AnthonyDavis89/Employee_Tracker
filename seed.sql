
USE employeeDB;

INSERT INTO department (department)
VALUES ('Accounting'), ('Human Resources'), ('Legal'), ('IT');

INSERT INTO roles (title, salary, department_id)
VALUES 
    ('HR Rep', 50000, 2),
    ('Accountant', 60000, 1),
    ('Lawyer', 150000, 3),
    ('Jr Developer', 70000, 4),
    ('Accounts Payable', 90000, 1),
    ('HR Director', 200000, 2),
    ('Lawyer 2', 215000, 3);


INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Anthony', 'Davis', 2, 1),
    ('Chris', 'John', 2, 2),
    ('Adam', 'Park', 3, 3),
    ('Tony', 'Willams', 4, NULL),
    ('Ashley', 'Lance', 5, NULL),
    ('Austin', 'Garcia', 6, 4),
    ('Bill', 'Cosby', 7, NULL);
 