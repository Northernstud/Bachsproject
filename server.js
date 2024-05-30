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
const fse = require('fs-extra');
const cors = require('cors');

app.use(express.static(path.join(__dirname, 'publish')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({extended: 'false'}));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    credentials: true
}));

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

var dropDown = mysql.createConnection({
    host: '10.11.90.15',
    port: '3306',
    user: 'AppUser',
    password: 'Special888%',
    database: 'Study',
    table: 'bach_cities',
})


database.connect((err) => { // This creates the connection
    if (err) throw err;
    else console.log('Table bach_countries is connected!');
});
usersInfo.connect((err) => { // This creates the connection
    if (err) throw err;
    else console.log('Table bach_users is connected!');
});
dropDown.connect((err) => { // This creates the connection
    if (err) throw err;
    else console.log('Table bach_cities is connected!');
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

//Challenge 4

app.get('/welcome',function(req,res){
    var name = req.query.username;
    res.render('welcome', {msg: name});
});

// add user into my database
app.get("/signup", (req, res) => {
    res.render("signUpForm")
})

app.post('/signup', async function(req, res){
    var username = req.body.username_in;
    var password = req.body.password_in;
    var track = req.body.track_in;
    var grade = req.body.grade_in;
    var newUser = {username, password, track, grade};

    // Hash the password
    var hashedPassword = await bcrypt.hash(password, 10);

    if (password === "") {
        res.status(400).send("You did not enter the password!");
        return; // Stop further execution
    }
    // Check if the user already exists
    database.query("SELECT * FROM bach_users WHERE username = ?", [username], function(err, result, fields){
        if (err) {
            res.send("An error occurred");
            console.error(err);
        } else {
            if (result.length > 0) {
                res.send("User already exists");
                console.log(username, "already exists!");
            } else {
                // Insert the new user into the database
                database.query("INSERT INTO bach_users (username, password, track, grade) VALUES (?, ?, ?, ?)", [username, password, track, grade], function(err, result, fields) {
                    if (err) {
                        res.send("An error occurred");
                        console.error(err);
                    } else {
                        console.log('User signed up successfully:', username, password, result);
                        res.render('successful', {msg: username});
                    }
                });
            }
        }
    });
});

app.get("/login", (req, res) => {
    console.log("Yees!");
    // res.render("login")
})
app.post('/login', async function(req, res){
    console.log("request received!");
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
                console.log(result);
            }
        }
    });
    console.log(username, password);
});

//Challange 5
app.get('/dropDown', function(req, res, next){
    dropDown.query('SELECT DISTINCT country FROM bach_cities ORDER BY country ASC', function(error, data){
        res.render('dropDown', { title: 'Express', country_data : data });
    });
});

app.get('/get_data', function(request, response, next){

    var type = request.query.type;

    var search_query = request.query.parent_value;

    if(type == 'load_state')
    {
        var query = `
        SELECT DISTINCT state AS Data FROM country_state_city 
        WHERE country = '${search_query}' 
        ORDER BY state ASC
        `;
    }

    dropDown.query(query, function(error, data){
        var data_arr = [];

        data.forEach(function(row){
            data_arr.push(row.Data);
        });

        response.json(data_arr);
    });
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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Render the file upload form
app.get('/upload', function (req, res) {
    res.render('file');
});

app.post('/upload', upload.single('filename'), function (req, res) {
    console.log("File uploaded:", req.file);
    res.send("File uploaded successfully!");
});

// Handle file approval (move uploaded file to DataDir)
app.post('/approve', function (req, res) {
    fse.readdir('./uploads', function (err, files) {
        if (err) {
            console.error(err);
            res.send("Error occurred while reading files");
        } else if (files.length === 0) {
            res.send("No files to approve");
        } else {
            const filename = files[0]; // Get the first file in uploadFiles folder
            fse.move('./uploads/' + filename, './DataDir/' + filename, function (err) {
                if (err) {
                    console.error(err);
                    res.send("Error occurred while moving file");
                } else {
                    console.log('File moved successfully!');
                    res.send("File moved successfully!");
                }
            });
        }
    });
});


app.listen(3008, () => console.log('Listenning at 3008'))
