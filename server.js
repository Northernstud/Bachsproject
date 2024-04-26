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

var users = [];

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
    table: 'bach_users',
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
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.username,
            password: hashedPassword
        });
        // Redirect to a success page or send a response indicating success
        res.send('User registered successfully!');
    } catch {
        res.redirect('/register');
    }
});



app.listen(3008, () => console.log('Listenning at 3008'))