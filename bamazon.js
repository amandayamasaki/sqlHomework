

var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "programming_db"
});

connection.connect(function(err) {
   if (err) throw err;
    startApplication();
});

function readTable() {
    connection.query("SELECT product_name FROM bamazon", function(err, res) {
      if (err) throw err;
      for (i=0;i<res.length;i++){
        var result = res[i].product_name;
        productArr.push(result);
      }
    });
}

function startApplication() {
  inquirer
    .prompt({
      type: "list",
      message: "are you a",
      choices: [
        "customer", "manager" ],
      name: "action"
    })
    .then(function(answer) {
      readTable();
      switch (answer.action) {
        case "customer":
          customer();
          break;

        case "manager":
          manager();
          break;
      }
    });
}

function customer(){
    inquirer
      .prompt({
        type: "confirm",
        message: "would you like to buy something?",
        name: "confirm",
        default: true
      })
    .then(function(answer) {
      if (answer.confirm){
        selectProductToBuy();
      } else {
        console.log("goodbye");
      }
    });
}

var productArr = [];

function selectProductToBuy() {
  inquirer.prompt([
  {
    name: "action",
    type: "list",
    message: "What would you like to purchase?",
    choices: [
      productArr[0], 
      productArr[1],
      productArr[2],
      productArr[3],
      productArr[4],
      productArr[5],
      productArr[6]
    ]
  }, {
    name: "quantity",
    type:"input",
    message: "how many would you like?"
  }
  ]).then(function(answer) {
    connection.query("SELECT product_name,price,stock_quantity FROM bamazon", function(err, res) {
      if (err) throw err;
      var keyOfItem = productArr.indexOf(answer.action);
      var quantity = res[keyOfItem].stock_quantity;
      var price = res[keyOfItem].price;
      if (quantity >= answer.quantity){
        var totalPrice = price * answer.quantity;
        console.log("that will be $", totalPrice);
        console.log("thank you for shopping!");
        connection.end();
      } else {
        console.log("there aren't enough ", answer.action, " in stock.");
        console.log("we have ", quantity, " left");
        console.log("why dont you choose something else?");
        selectProductToBuy();
      }
    });
  });
}


function manager() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "view products for sale",
        "view low inventory",
        "add product"
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
        case "view products for sale":
          productsForSale();
          break;

        case "view low inventory":
          lowInventory();
          break;

        case "add product":
          addProduct();
          break;
      }
    });
}

function productsForSale(){
  connection.query("SELECT product_name FROM bamazon", function(err, res) {
    if (err) throw err;
    for (i=0;i<res.length;i++){
      var result = res[i].product_name;
      console.log(result);
    }
  });
  connection.end();
}

function lowInventory(){
  connection.query("SELECT product_name,stock_quantity FROM bamazon", function(err,res){
    for (i=0;i<res.length;i++){
      if (res[i].stock_quantity <5){
        console.log("there are only ", res[i].stock_quantity, " of ", res[i].product_name, " left");
      }
    }
  })
  connection.end();
}

function addProduct(){
  inquirer.prompt([
  {
    name: "action",
    type: "list",
    message: "What product would you like to restock?",
    choices: [
      productArr[0], 
      productArr[1],
      productArr[2],
      productArr[3],
      productArr[4],
      productArr[5],
      productArr[6]
    ]
  }, {
    name: "quantity",
    type:"input",
    message: "how many would you like to add?"
  }
  ]).then(function(answer) {
    connection.query("SELECT product_name,stock_quantity FROM bamazon", function(err, res) {
      if (err) throw err;
      var keyOfItem = productArr.indexOf(answer.action);
      var stockQuantity = res[keyOfItem].stock_quantity;
      var newQuantity = parseInt(stockQuantity) + parseInt(answer.quantity);
      connection.query(
        'UPDATE bamazon SET stock_quantity = ? Where ID = ?',
        [newQuantity, keyOfItem],
        (err, result) => {
         if (err) throw err;
          console.log("thank you!");
          console.log(`Changed ${result.changedRows} row(s)`);
          connection.end();
        }
      );  
    });
  });
}










