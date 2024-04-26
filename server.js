var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var fs = require('fs');
var mysql = require('mysql');
var session = require('express-session');
var bodyParser = require('body-parser');
var encoder = bodyParser.urlencoded();
var bcrypt = require('bcrypt');

app.use(express.static(path.join(__dirname, 'publish')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: 'false'}));
app.use(express.json());
app.set('view engine', 'ejs');

var database = mysql.createConnection({
    host: '10.11.90.15',
    port: '3306',
    user: 'AppUser',
    password: 'Special888%',
    database: 'Study',
    table: 'bachs_users',
})
var usersInfo = mysql.createConnection({
    host: '10.11.90.15',
    port: '3306',
    user: 'AppUser',
    password: 'Special888%',
    database: 'Study',
    table: 'bach_countries',
})



database.connect((err) => { // This creates the connection
    if (err) throw err;
    else console.log('Table bach_countries is connected!');
});
usersInfo.connect((err) => { // This creates the connection
    if (err) throw err;
    else console.log('Table bach_users is connected!');
});

app.get('/abc',function(req,res){
    res.sendFile(path.join(__dirname+'/abc.html'));
    //__dirname : It will resolve to your project folder.
});
app.get('/count', function(req,res){
    var queryString = "SELECT countries_num FROM bach_countries WHERE continents = 'Asia'";
    database.query(queryString, function(err, result) {
        if (err) throw err;
        console.log(result);
        const value = result[0].countries_num;
        res.send(`<p>Total countries in Asia is ${value}!</p>`)
    });
});








app.get("/register", (req, res) => {
    res.render("register")
})
app.post('/register', async function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    // Hash the password
    var hashedPassword = await bcrypt.hash(password, 10);

    database.query("SELECT * FROM bach_users WHERE username = ? AND password = ?", [username, password], function (error, result, fields){
        if (error) {
            res.send("An error occurred");
            console.error(error);
        } else {
            if (result.length > 0) {
                res.redirect("/welcome");
            } else {
                res.send("No such user found");
            }
        }
    });
});

// Place bodyParser middleware before route handlers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/welcome',function(req,res){
    res.render('welcome');
});



app.listen(3008, () => console.log('Listenning at 3008'))
