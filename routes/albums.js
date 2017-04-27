const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/images/uploads'});
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
	const albumRef = fbRef.child('albums');

	albumRef.once('value', (snapshot) => {
		let albums = [];
		snapshot.forEach((childSnapshot) => {
			let key = childSnapshot.key;
			let childData = childSnapshot.val();
			if (childData.uid === firebase.auth().currentUser.uid) {
				albums.push({
					id: key,
					artist: childData.artist,
					genre: childData.genre,
					info: childData.info,
					title: childData.title,
					label: childData.label,
					tracks: childData.tracks,
					cover: childData.cover
				});
			}
		});
		res.render('albums/index',{albums: albums});
	});
});

router.get('/add', (req, res, next) => {
	const genreRef = fbRef.child('genres');

	genreRef.once('value', (snapshot) => {
		let data = [];
		snapshot.forEach((childSnapshot) => {
			let key = childSnapshot.key;
			let childData = childSnapshot.val();
			data.push({
				id: key,
				name: childData.name
			});
		});
		res.render('albums/add',{genres: data});
	});

});

router.post('/add', upload.single('cover'), (req, res, next) => {
	// Check File Upload
	if (req.file) {
  	console.log('Uploading File...');
  	var cover = req.file.filename;
	} else {
  	console.log('No File Uploaded...');
  	var cover = 'noimage.jpg';
	}

	// Build Album Object
	let album = {
		artist: req.body.artist,
		title: req.body.title,
		genre: req.body.genre,
		info: req.body.info,
		year: req.body.year,
		label: req.body.label,
		tracks: req.body.tracks,
		cover: cover,
    uid: firebase.auth().currentUser.uid
	};

	// Create Reference
	const albumRef = fbRef.child('albums');

	// Push Album
  	albumRef.push().set(album);

  	req.flash('success_msg', 'Album Saved');
  	res.redirect('/albums');
});


router.get('/details/:id', (req, res) => {
	let id = req.params.id;

	let albumRef = firebase.database().ref('albums/' + id);

	albumRef.once('value', (snapshot) => {
		let album = snapshot.val();
		res.render('albums/details', {album: album, id: id});
	});
});

router.get('/edit/:id', (req, res, next) => {
	let id = req.params.id;
	const albumRef = firebase.database().ref('albums/' + id);
	const genreRef = fbRef.child('genres');

	genreRef.once('value', (snapshot) => {
		let genres = [];
		snapshot.forEach((childSnapshot) => {
			let key = childSnapshot.key;
			let childData = childSnapshot.val();
			genres.push({
				id: key,
				name: childData.name
			});
		});
		albumRef.once("value", (snapshot) => {
			let album = snapshot.val();
			res.render('albums/edit', {album: album, id: id, genres: genres});
		});
	});
});


router.post('/edit/:id', upload.single('cover'), (req, res, next) => {
	let id = req.params.id;
	let albumRef = firebase.database().ref('albums/' + id);

	// Check File Upload
	if (req.file) {
		// get Cover Filename
		let cover = req.file.filename;

	  	// Update Album With Cover
		albumRef.update({
			artist: req.body.artist,
			title: req.body.title,
			genre: req.body.genre,
			info: req.body.info,
			year: req.body.year,
			label: req.body.label,
			tracks: req.body.tracks,
			cover: cover
		});
	} else {
	  	// Update Album Without Cover
		albumRef.update({
			artist: req.body.artist,
			title: req.body.title,
			genre: req.body.genre,
			info: req.body.info,
			year: req.body.year,
			label: req.body.label,
			tracks: req.body.tracks
		});
	}

	req.flash('success_msg', 'Album Updated');
	res.redirect('/albums/details/' + id);
});

router.delete('/delete/:id', (req, res, next) => {
	let id = req.params.id;
	const albumRef = firebase.database().ref('/albums/' + id);

	albumRef.remove();

	req.flash('success_msg', 'Album Deleted');
	res.send(200);
});

module.exports = router;
