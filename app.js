const express = require("express");
const app = express();
const mysql = require("mysql");
const bodyParser = require("body-parser");

const session = require("express-session");




app.use(express.static(__dirname));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));


/** Page Links */

app.get("/ReviewPage/:Name", (req,res) => {

    const MovieName = req.params.Name;

    const sql = 'SELECT * FROM movies LEFT JOIN commentsection ON movies.Name = commentsection.MovieName WHERE movies.Name = ?';

    db.query(sql,MovieName, (error,result) => {
        if(error) {
            console.log(error);
            console.log(MovieName);
        }
        else{
            const movie = result[0];

            const base64Decoded = Buffer.from(movie.Image, 'base64').toString('ascii');
            const urlDecoded = decodeURIComponent(base64Decoded);
            console.log("Original Image Path:", movie.Image);
            console.log("Decoded Image Path:", urlDecoded);
            const loggedInUser = req.session.loggedInUser || false;
            res.render("moviereview", { movie, loggedInUser, commentsection: result });
        }
    })

})


app.get("/", (req,res) => {
    const sql = 'SELECT * FROM movies';

    db.query(sql, (error,result) => {
        if(error){
            console.log(error);
        }
        else{
            result.forEach(movie => {
                if (movie.Image) {
                    const base64Decoded = Buffer.from(movie.Image, 'base64').toString('ascii');
                    const urlDecoded = decodeURIComponent(base64Decoded);
                    console.log("Original Image Path:", movie.Image);
                    console.log("Decoded Image Path:", urlDecoded);
                }
            });
            const loggedInUser = req.session.loggedInUser || false;
            console.log(loggedInUser);
            res.render("front", { movies: result , loggedInUser});
        }
    })
});

app.get("/movieaddition", (req,res) => {
    res.render("movieaddition.ejs");
});

app.get("/Login", (req,res) => {
    res.render("Login.ejs");
});

app.get("/SignUp", (req,res) => {
    res.render("SignUp.ejs");
});

app.post('/AddUser', (req,res)=> {
    console.log("Receieved POST body request", req.body);

    const{UserName, UserPassword, Image} = req.body;

    const values = [UserName, UserPassword, Image];

    const insertQuery = "INSERT INTO users (UserName, UserPassword, UserImage) VALUES (?,?,?)";

    db.query(insertQuery, values, (error,result)=> {
        if(error){
            console.log("Failed to add user");
            console.log(error);
        }
        else{
            console.log("User Added Sucessfully");
            res.redirect("/Login");
        }
    } )
});

app.post('/AddComment', (req,res) => {
    const{Rating,CommentSection,currentUserName, MovieName, UserImage} = req.body;

    console.log(req.body);

    const insertQuery = 'INSERT INTO commentsection (UserName, UserImage, Comment, Rating, MovieName) VALUES (?,?,?,?,?)';

    const values = [currentUserName,UserImage, CommentSection, Rating, MovieName];

    db.query(insertQuery, values, (error,result)=> {
        if(error){
            console.log("Failed to add comment");
            console.log(error);
        } else{
            console.log("Sucessfully Added Comment");
        }
    })
})

app.post('/UpdateAcc', (req,res)=>{
    const{editUserName, editUserPassword, editUserImage, currentUserName, currentUserPassword} = req.body;

    console.log(req.body);

    const values = [editUserName, editUserPassword, editUserImage, currentUserName, currentUserPassword];

    const insertQuery = 'UPDATE users SET UserName = ? , UserPassword = ? , UserImage = ? WHERE UserName = ? AND UserPassword = ?';

    db.query(insertQuery, values, (error,result) => {
        if(error) {
            console.log("Failed to Update User");
            console.log(error);
        } else {
            console.log("User Updated Sucessfully!");
            req.session.loggedInUser = {
                username: editUserName,
                password: editUserPassword,
                UserImage: editUserImage,
            };
            res.redirect("/MyAccount");
        }
    })
});

app.post('/LogUser', (req,res) => {
    const{ Username, Password } = req.body;
    console.log(req.body);

    const insertQuery = 'SELECT * FROM users WHERE UserName = ? AND UserPassword = ?';

    db.query(insertQuery, [Username, Password], (error,result)=> {
        if(error){
            console.log(error);
            console.log("Invalid User Name or Password");
        }
        else{
            if(result.length > 0) {
                console.log("Sucessfull Login!");
                const user = result[0];
            req.session.loggedInUser = {
                username: user.UserName,
                password: user.UserPassword,
                UserImage: user.UserImage,
            }
                res.redirect('/');
            }
            else {
                console.log("Invalid User Name or Password");
            }
        }
    })
});

app.get('/logout', (req,res) => {
    req.session.destroy((err) => {
        if(err) {
            console.log("Error destroying sessiond");
            console.log(err);
        } else{
            res.redirect('/');
        }
    })
});

app.get('/MyAccount', (req,res) => {
    const loggedInUser = req.session.loggedInUser || false;
    res.render("MyAccount.ejs" , { loggedInUser });

});


const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'moviereview'
})

db.connect( (error) => {
    if(error) {
        console.log(error);
    }
    else {
        console.log("Connected to database sucessfully");
    }
})

app.listen(5001, () => {
    console.log("Server started on port 5000");
});

app.post('/AddMovie', (req,res) => {
    console.log("Receieved POST request", req.body);

    const{MovieName, MovieRating, MovieDirector, Image, MovieDescription} = req.body;

    const values = [MovieName, MovieRating, MovieDirector, Image, MovieDescription];

    const insertQuery = 'INSERT INTO movies (Name, Rating, Director, Image, Description) VALUES (?,?,?,?,?) ';

    db.query(insertQuery, values, (error,result) => {
        if(error) {
            console.log(error);
            console.log("Data Failed to Add");
        }
        else{
            console.log("Sucessfully added a Movie!");
        }
    })

});

