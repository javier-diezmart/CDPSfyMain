var fs = require('fs');
//var track_model = require('./../models/track');
var querystring = require('querystring')
var http = require('http')

var mongoose = require('mongoose');
var TRACKS = require('./../models/track');
var Track = mongoose.model('TRACKS');

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	var lista = Track.find(function(err,tracks){
		if(err){console.log('error listando tracks'+err);}
		else{res.render('tracks/index', {tracks: tracks});}
	});
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	var query = Track.findOne({'caract':req.params.trackId});
	query.exec(function(err,track){
		if(err){console.log('error mostrando track'+err);}
		else{res.render('tracks/show', {track: track});}
	});
};

// Escribe una nueva canción en el registro de canciones.
// TODO:
// - Escribir en tracks.cdpsfy.es el fichero de audio contenido en req.files.track.buffer
// - Escribir en el registro la verdadera url generada al añadir el fichero en el servidor tracks.cdpsfy.es
exports.create = function (req, res) {
	var urlPOST = 'http://www.tracks.cdpsfy.es:80/api/tracks';

	//var imageURL = '/images/quaver3.png';

	var track = req.files.track;

	if(typeof track == undefined){
		console.log('No hay track seleccionada');
		res.render('tracks/new');
		return;
	}

	var extension = track.extension;
	var extensionesPermitidas = ["mp3","wav","ogg"];
	extension.toLowerCase();

	if(extensionesPermitidas.indexOf(extension)== -1){
		console.log('extensión no permitida');
		res.render('tracks/new');
		return;
	}

	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];

	// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	var buffer = track.buffer;
	var url = '';

	var request = require('request');
	var formData = {
		filename: name+'.'+extension,
		miBuffer: buffer 
	};
	request.post({url: urlPOST, formData: formData}, function optionalCallback(err, httpResponse,body){
		if(err){return console.error('fallo al hacer el post: ', err);
		}else{
			var nuevaUrl = 'http://www.tracks.cdpsfy.es:80/api/tracks/'+body;
			console.log('post con exito',body);

			// Escribe los metadatos de la nueva canción en el registro.
			var track = new Track({
				name: name,
				url: nuevaUrl,
				caract: body
				//image: imageURL
			});
			track.save(function(err,track){
				if(err){console.log('error al guardar track en BBDD');
				}else{console.log('track guardada con exito en BBDD'+track);}
				res.redirect('/tracks');
			});
		}
	});

};

// Borra una canción (trackId) del registro de canciones 
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	var caract = req.params.id;
	var URLservidor = 'http://www.tracks.cdpsfy.es:80/api/tracks/'+caract;
	var request= require('request');
	request.post(URLservidor, '');


	// Aquí debe implementarse el borrado del fichero de audio indetificado por trackId en tracks.cdpsfy.es

	// Borra la entrada del registro de datos
	var query = Track.findOne({'caract': caract});
	query.exec(function(err,track){
		if(err){
			console.log('fallo al buscar track');
		}else{
			track.remove(function(err){
				if(err){
					console.log('error borrando track');
				}else{
					console.log('borrado track con exito');
				}
				res.redirect('/tracks');
			});
		}
	});

};