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
        "Delete employee",
        "Exit"
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
        case "Delete employee":
          delEmpoyee();
          break;  
        case "Exit":
          connection.end();
          break;   
      }
    });
}

function viewEmployees() {
  var query = "SELECT * FROM employee;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
  });
      mainMenu();
    }
 
function viewDepartments() {
  var query = "SELECT * FROM department;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
  });
  mainMenu();
}


function viewRole() {
  var query = "SELECT * FROM roles;";
  connection.query(query, function (err, res) {
    if (err) throw err;
    console.table(res);
  });
  mainMenu();
}

function updateRole() {
    connection.query(
      "SELECT id, first_name FROM employee",
      function (err, results2) {
        if (err) throw err;
        let employees = results2.map(
          (employee) => employee.id + " " + employee.first_name
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
  connection.query("SELECT title FROM roles;", function (err, res) {
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
      connection.query("SELECT id, title FROM roles;", function (err, res) {
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

function newDepartment() {
  inquirer.prompt({
      name: "dname",
      type: "input",
      message: "Please enter new department name?",
    })
    .then((response) => {
      connection.query(
        `INSERT INTO department SET ?`,
        {
          dname: response.dname,
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
  inquirer.prompt([
      {
        name: "name",
        type: "input",
        message: "Please enter the new job title?",
      },
      {
        name: "salary",
        type: "number",
        message: "Please enter the salary?",
      },
      {
        name: "departmentid",
        type: "number",
        message: "Please enter the department ID?",
      },
    ])
    .then(({ name, salary, departmentid }) => {
      connection.query(
        `INSERT into roles SET ?`,
        {
          title: name,
          salary: salary,
          department_id: departmentid,
        },
        function (err, res) {
          if (err) throw err;
          console.log(res)
        }
      );
      mainMenu();
    });
}

//delete an employee
function delEmpoyee() {
  connection.query(
    "SELECT concat(first_name, ' ', last_name) fullName FROM employee",
    function (err, resultsPull) {
      if (err) throw err;
      let employees = resultsPull.map((employee) => employee.fullName);
      inquirer
        .prompt({
          name: "pendingDelete",
          type: "list",
          message: "Please chose an employee you want to delete?",
          choices: employees,
        })
        .then((response) => {
          connection.query(
            `DELETE FROM employee WHERE concat(first_name, ' ', last_name) ="${response.pendingDelete}"`,
            function (err, res) {
              if (err) throw err;
              console.log(`${response.pendingDelete} has been removed from the company Tables`);
              mainMenu();
            }
          );
        });
    }
  );
}

