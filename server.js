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
var multer  = require('multer')

app.use(express.static(path.join(__dirname, 'publish')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: 'false'}));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Challenge 1
app.get('/',function(req,res){
    res.sendFile(path.join(__dirname+'/publish/index.html'));
    //__dirname : It will resolve to your project folder.
});

// Challenge 2
app.get('/abc',function(req,res){
    res.sendFile(path.join(__dirname+'/abc.html'));
    //__dirname : It will resolve to your project folder.
});

// Challenge 3
app.get('/count', function(req,res){
    var queryString = "SELECT countries_num FROM bach_countries WHERE continents = 'Asia'";
    database.query(queryString, function(err, result) {
        if (err) throw err;
        console.log(result);
        const value = result[0].countries_num;
        res.send(`<p>Total countries in Asia is ${value}!</p>`)
    });
});

//Challenge 4 and 5
app.get("/register", (req, res) => {
    res.render("register")
})
app.post('/register', async function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var track = req.body.track;
    var grade = req.body.grade;


    // Hash the password
    var hashedPassword = await bcrypt.hash(password, 10);

    database.query("SELECT * FROM bach_users WHERE username = ? AND password = ? AND track = ? AND grade = ?", [username, password, track, grade], function (error, result, fields){
        if (error) {
            res.send("An error occurred");
            console.error(error);
        } else {
            if (result.length > 0) {
                res.render('welcome', {msg: username});
                console.log(username, "just log in!")
            } else {
                res.send("No such user found");
            }
        }
    });
    console.log(username, password);
});

app.get('/welcome',function(req,res){
    var name = req.query.username;
    res.render('welcome', {msg: name});
});

//Challenge 6
app.get('/query', function(req, res){
    var query = "SELECT * FROM bach_users"
    database.query(query, function (error, results){
        if (error) {
            res.send("An error occurred");
            console.error(error);
        }
        else {
            res.render('query', {data: results});
        }
    })
});

app.post('/query', async function(req, res){
    var username = req.body.username_query;
    var track = req.body.track_query;
    var grade = req.body.grade_query;
    var query = 'SELECT * FROM bach_users WHERE username = ? OR track = ? OR grade = ?';

    database.query(query, [username, track, grade], function (error, result, fields){
        if (error) {
            res.send("An error occurred");
            console.error(error);
        } else {
            res.render('query', {data: result}); // Render 'resquery.ejs' and pass data to it
        }
    })
    console.log(username, track, grade);
});

//Challenge 7

app.get('/upload',function(req,res){
    res.render('file');
});

var upload = multer({ dest: 'public/' });
app.post('/api/upload', upload.single('file'), function (req, res) {
    res.send('Uploaded successfully!');
});

app.listen(3008, () => console.log('Listenning at 3008'))
