const express = require("express");
const mysql = require("mysql");
const app = express();
const session = require('express-session');
const path = require("path");

app.use(session({
    secret: 'secret',      // should be long and random
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }      
}));


app.set('view engine', 'ejs');


const PublicDirectory = path.join(__dirname, './public');
console.log(__dirname);
app.use(express.static(PublicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//Define routes (sends to page)
app.use('/', require('./routes/pages'));
//Logic interaction with databases
app.use('/auth', require('./routes/auth'));

app.listen(5000, () => {
    console.log("Server started on port 5000")
})

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'moviewebsite'
});

db.connect((error) => {
    if(error) {
        console.log("Failed to connect to database")
        console.log(error);
    } else {
        console.log("successfully connected to database");
    }
})


