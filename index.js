//Requiring npm packages
const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

//Creating database connection
var connection = mysql.createConnection({
    host: "localhost",
    port: process.env.PORT || 3306,
    user: "root",
    password: "",
    database: "employeeDB"
});


//Catch any errors
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  // display menu
  mainMenu();
});


function mainMenu() {
  inquirer.prompt({
      name: "main",
      type: "list",
      message: "Please select an option:",
      choices: [
        "View departments",  
        "View roles",
        "View employees",
        "Add department",
        "Add role",
        "Add employee",
        "Update employee role",
      ],
    })
    .then(function (response){
      switch (response.main) {
        
        case "View departments":
          viewDepartments();    
          break;
        case "View roles":  
          viewRole();
          break;
        case "View employees":
          viewEmployees();
          break;
        case "Add department":
          newDepartment();
          break;
        case "Add role":
          newRole();
          break;
        case "Add employee":
           addEmployee();
          break;  
        case "Update employee's role":
           updateRole();
          break;
      }
    });
}

function viewEmployees() {
  connection.query(
    `select employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, employee.manager_id, employee.first_name 
    from employee 
    inner join role ON employee.role_id=role.id 
    inner join department ON department.id=role.department_id;`,
    function (err, res) {
      if (err) throw err;
      console.table(res);
      mainMenu();
    }
  );
}

function viewDepartments() {
  let departments = [];
  connection.query("SELECT name FROM department;", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      departments.push(res[i].name);
    }
    inquirer.prompt({
        name: "department",
        type: "list",
        message: "Which department would you like to view?",
        choices: departments,
      })
      .then((response) => {
        connection.query(
          `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, 
         concat(employee2.first_name, " ", employee2.last_name) manager FROM employee 
          LEFT JOIN role ON employee.role_id=role.id 
          LEFT JOIN department ON department.id=role.department_id 
          LEFT JOIN employee employee2 ON employee.id=employee2.manager_id 
          WHERE name=?`,
          response.department,
          function (err, res) {
            if (err) throw err;
            console.table(res);
            mainMenu();
          }
        );
      });
  });
}

function viewRole() {
  let roles = [];
  connection.query("SELECT title FROM role;", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      roles.push(res[i].title);
    }
    inquirer.prompt({
        name: "role",
        type: "list",
        message: "Which of the following roles would you like to view?",
        choices: roles,
      })
      .then((response) => {
        connection.query(
          `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name, role.salary, 
                    concat(employee2.first_name, " ", employee2.last_name) manager FROM employee 
                    LEFT JOIN role ON employee.role_id=role.id 
                    LEFT JOIN department ON department.id=role.department_id 
                    LEFT JOIN employee employee2 ON employee.id=employee2.manager_id 
                    WHERE title=?`,
          response.role,
          function (err, res) {
            if (err) throw err;
            console.table(res);
            mainMenu();
          }
        );
      });
  });
}

function updateRole() {
    connection.query(
      "SELECT id, concat(first_name, ' ', last_name) fullName FROM employee",
      function (err, results2) {
        if (err) throw err;
        let employees = results2.map(
          (employee) => employee.id + " " + employee.fullName
        );
  
        inquirer.prompt({
            name: "selectEmployee",
            type: "list",
            message: "Please select an employee?",
            choices: employees,
          })
          .then((response) => {
            let employeeId = response.selectEmployee.split(" ")[0];
            connection.query("SELECT id, title FROM role;", function (err, res) {
              if (err) throw err;
              let roles = res.map((role) => role.id + " " + role.title);
  
              inquirer.prompt({
                  name: "newRole",
                  type: "list",
                  message: "What is their new role?",
                  choices: roles,
                })
                .then((response2) => {
                  connection.query(
                    `UPDATE employee SET role_id=${
                      response2.newRole.split(" ")[0]
                    } WHERE employee.id=${employeeId}`,
                    function (err, res) {
                      if (err) throw err;
                    }
                  );
                  console.log("Role update successful!");
                  mainMenu();
                });
            });
          });
      }
    );
  }
  

function addEmployee() {
  let managerId = 0;
  connection.query("SELECT manager_id FROM employee;", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      if (res[i].manager_id != null && managerId < res[i].manager_id) {
        managerId = res[i].manager_id;
      }
    }
  });
  let roles = [];
  connection.query("SELECT title FROM role;", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      roles.push(res[i].title);
    }
  });
  inquirer.prompt([
      {
        name: "first_name",
        type: "input",
        message: "What is the first name of the new employee?",
      },
      {
        name: "last_name",
        type: "input",
        message: "What is the last name of the new employee?",
      },
      {
        name: "role",
        type: "list",
        message: "What position will this employee be in?",
        choices: roles,
      },
      {
        name: "manager",
        type: "list",
        message: "Is this employee a manager?",
        choices: ["Yes", "No"],
      },
    ])
    .then((response) => {
      let roleId;
      connection.query("SELECT id, title FROM role;", function (err, res) {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
          if (res[i].title == response.role) {
            roleId = res[i].id;
          }
        }
        if (response.manager == "Yes") {
          managerId++;
          response.manager = managerId;
        } else {
          response.manager = null;
        }
        connection.query(
          `INSERT INTO employee SET ?`,
          {
            first_name: response.first_name,
            last_name: response.last_name,
            role_id: roleId,
            manager_id: response.manager,
          },
          function (err, res) {
            if (err) throw err;
            console.log(
              `Added ${response.first_name}${" "}${response.last_name}!`
            );
            mainMenu();
          }
        );
      });
    });
}

//Done
function newDepartment() {
  inquirer.prompt({
      name: "newDepartment",
      type: "input",
      message: "Please enter new department name?",
    })
    .then((response) => {
      connection.query(
        `INSERT INTO department SET ?`,
        {
          name: response.newDepartment,
        },
        function (err, res) {
          if (err) throw err;
        }
      );
      console.log(`Department added ${response.newDepartment}!`);
      mainMenu();
    });
}

function newRole() {
  let departments = [];
  connection.query("SELECT name FROM department;", function (err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      departments.push(res[i].name);
    }
    inquirer.prompt([
        {
          name: "deptId",
          type: "list",
          message: "What department will this role be in?",
          choices: departments,
        },
        {
          name: "newRole",
          type: "input",
          message: "What is the name of the new role you would like to add?",
        },
        {
          name: "salary",
          type: "input",
          message: "What is the salary for this new role?",
        },
      ])
      .then((response) => {
        connection.query(`SELECT id, name FROM department;`, function (
          err,
          res
        ) {
          if (err) throw err;
          res.forEach((department) => {
            if (department.name == response.deptId) {
              response.deptId = department.id;
            }
          });
          connection.query(
            `INSERT INTO role SET ?`,
            {
              title: response.newRole,
              salary: response.salary,
              department_id: response.deptId,
            },
            function (err, res) {
              if (err) throw err;
            }
          );
          console.log(`Successfully added ${response.newRole}!`);
          mainMenu();
        });
      });
  });
}

