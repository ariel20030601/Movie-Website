const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'moviewebsite'
});

exports.register = (req,res) => {
    const {email, username, password } = req.body;
    console.log(username, email, password);
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [username, email, password], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log("User registered");
            res.redirect('/');
        }
    });
}

exports.login = (req,res) => {
    const {username, password } = req.body;
    console.log(username, password);
    db.query('SELECT * FROM users WHERE name = ? AND password = ?', [username, password], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if(results.length > 0) {
                console.log("User logged in");
                req.session.username = results[0].name;
                req.session.userID = results[0].id;
                console.log(req.session);
                res.redirect('/home');
            } else {
                console.log("Invalid credentials");
                res.redirect('/');
            }
        }
    });
}

exports.home = (req,res) => {
    const username = req.session.username;

    if (!username) {
        return res.redirect('/');
    }

    db.query('SELECT * FROM movies', (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.render('home', {movies: results, username: username});
        }
    });
}

exports.SpecificMovie = (req,res) => {
    const username = req.session.username;
    const movieID = req.params.id;

    if (!username) {
        return res.redirect('/');
    }

    db.query('SELECT * FROM movies WHERE id = ?', [movieID], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            db.query(
            `SELECT r.*, u.name AS reviewerName FROM reviews r JOIN users u ON r.reviewerID = u.id WHERE r.movieID = ?`, [movieID], (reviewErr, reviewResults) => {
                if (reviewErr) {
                    console.log(reviewErr);
                    return res.status(500).send("Error retrieving reviews.");
                }

                // Render page with both movie and reviews
                console.log(reviewResults);
                res.render('movie', {
                    movie: results[0],
                    reviews: reviewResults,
                    username: username
                });
            }
        );
        }
    });
}


exports.addReview = (req, res) => {
    const userID = req.session.userID;
    const movieID = req.params.id;
    const {rating, review} = req.body;

    if (!userID) {
        return res.redirect('/');
    }

    db.query('INSERT INTO reviews (reviewerID, movieID, rating, review) VALUES (?, ?, ?, ?)', [userID, movieID, rating, review], (error, results) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Review added");
            res.redirect(`/movie/${movieID}`);
        }
    });
}

exports.profile = (req,res) => {
    const username = req.session.username;
    const userID = req.session.userID;

    if (!username) {
        return res.redirect('/');
    }

    db.query('SELECT * FROM users WHERE id = ?', [userID], (error, results) => {
        if (error) {
            console.log(error);
        } else {

            db.query(
            `SELECT r.*, m.title AS movieTitle
             FROM reviews r
             JOIN movies m ON r.movieID = m.id
             WHERE r.reviewerID = ?`,
            [userID],
            (reviewErr, reviews) => {
                if (reviewErr) {
                    console.log(reviewErr);
                    return res.status(500).send("Error loading reviews.");
                }

                res.render('profile', {
                    username: username,
                    reviews: reviews
                });
            }
        );
    }
    });
}