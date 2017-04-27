const express = require('express');
const router = express.Router();
const firebase = require('firebase');
const fbRef = firebase.database().ref();

router.get('*', (req, res, next) => {
	// Check Authentication
	if (firebase.auth().currentUser === null){
	  res.redirect('/users/login');
	}
	next();
});

router.get('/', (req, res, next) => {
	const genreRef = fbRef.child('genres');

	genreRef.once('value', (snapshot) => {
		let genres = [];
		snapshot.forEach((childSnapshot) => {
			let key = childSnapshot.key;
			let childData = childSnapshot.val();
      if (childData.uid === firebase.auth().currentUser.uid) {
  			genres.push({
  				id: key,
  				name: childData.name
  			});
      }
		});
		res.render('genres/index', {genres: genres});
	});
});

router.get('/add', (req, res, next) => {
  res.render('genres/add');
});

router.post('/add', (req, res, next) => {
	let genre = {
    name: req.body.name,
    uid: firebase.auth().currentUser.uid
  };

	const genreRef = fbRef.child('genres');
	genreRef.push().set(genre);

	req.flash('success_msg', 'Genre Saved');
	res.redirect('/genres');
});

router.get('/edit/:id', (req, res, next) => {
	let id = req.params.id;
	let genreRef = firebase.database().ref('genres/' + id);

	genreRef.once('value', (snapshot) => {
		let genre = snapshot.val();
		res.render('genres/edit', {genre: genre, id: id});
	});
});

router.post('/edit/:id', (req, res, next) => {
	let id = req.params.id;
	let name = req.body.name;
	let genreRef = firebase.database().ref('genres/' + id);

	genreRef.update({name: name});

	res.redirect('/genres');
});

router.delete('/delete/:id', (req, res, next) => {
	let id = req.params.id;
	let genreRef = firebase.database().ref('genres/' + id);

	genreRef.remove();

	req.flash('success_msg', 'Genre Deleted');
	res.send(200);
});

module.exports = router;
