const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const fbRef = firebase.database().ref();

router.get('/register', (req, res, next) => {
  res.render('users/register');
});

router.get('/login', (req, res, next) => {
  res.render('users/login');
});

router.post('/register', (req, res, next) => {
  let first_name = req.body.first_name;
	let last_name = req.body.last_name;
	let email = req.body.email;
	let password = req.body.password;
	let password2 = req.body.password2;
	let location = req.body.location;
	let fav_artists = req.body.fav_artists;
	let fav_genres = req.body.fav_genres;

	// Validation
	req.checkBody('first_name', 'First name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if (errors) {
		res.render('users/register', {
			errors: errors
		});
	} else {
		firebase.auth().createUserWithEmailAndPassword(email, password).catch((error) => {
			console.log('Error creating user: ', error);
		}).then((userData) => {
			console.log('Successfully created user with uid: ', userData.uid);
			let currentUser = {
				uid: userData.uid,
				email: email,
				first_name: first_name,
				last_name: last_name,
				location: location,
				fav_genres: fav_genres,
				fav_artists: fav_artists
			};
			const userRef = fbRef.child('users');
			userRef.push().set(currentUser);
			req.flash('success_msg', 'You are now registered and can login');
			res.redirect('/users/login');
		});
	}
});

router.post('/login', (req, res, next) => {
	let email = req.body.email;
	let password = req.body.password;

	// Validation
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();

	let errors = req.validationErrors();

	if (errors) {
		res.render('users/login', {
			errors: errors
		});
	} else {
		firebase.auth().signInWithEmailAndPassword(email, password).catch((error) => {
			console.log('Login Failed: ', error);
			req.flash('error_msg', 'Login Failed');
			res.redirect('/users/login');
		}).then((authData) => {
			console.log('Authenticated user with uid: ', authData);
			req.flash('success_msg', 'You are now logged in');
			res.redirect('/albums');
		});
	}
});

// Logout User
router.get('/logout', (req, res) => {
	// Unauthenticate the client
	firebase.auth().signOut().then(() => {
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
});

module.exports = router;
