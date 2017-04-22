var express = require('express');
var router = express.Router();
var pg = require('pg')
var conn = 'postgres://dosirytczokrmc:cd85f0235c60bb54fa07e2a3c2130e8260d8ad95071a7eeaffadeaa4cabd2257@ec2-54-235-168-152.compute-1.amazonaws.com:5432/d9pq84855g51vq'

/* GET home page. */
var events = [
	{id: 1, name: 'Event 1', date: new Date().getTime(), category: 'Conferencia'},
	{id: 2, name: 'Event 2', date: new Date().getTime(), category: 'Seminario'},
	{id: 3, name: 'Event 3', date: new Date().getTime(), category: 'Congreso'},
	{id: 4, name: 'Event 4', date: new Date().getTime(), category: 'Curso'}
]
router.get('/', function(req, res, next) {
	var query = 'CREATE TABLE IF NOT EXISTS events__c (id serial primary key, name text, category text, place text, address text,  startdate date, enddate date, event_type text);'
	executeQuery(query, conn)
	.then(function(result) {
		//console.log('success create: ', result)
		query = 'SELECT * FROM events__c'
		return executeQuery(query, conn)
	})
	.then(function(result) {
		//console.log('result: ', result)
  		res.status(200).render('eventos', {events: result.rows})
	}).catch(function(err) {
  		//res.status(500).send({err})
  		res.status(500).render('eventos', {err})
	})
})

var saveEvent = function(req, res) {
	//console.log('in save event... \n')
	try {
		var instance = req.body
		var reqs = {
			name: 'Nombre es requerido',
			category: 'Categoría es requerida',
			place: 'Lugar es requerido',
			address: 'Dirección es requerida',
			startdate: 'Fecha de inicio es requerida',
			enddate: 'Fecha fin es requerida',
			event_type: 'Tipo es requerido'
		}
	var errors = []
		for(key in reqs) {
			if(!instance.hasOwnProperty(key)) {
				errors.push(reqs[key])
			}
		}
		if(errors.length > 0) {
			res.status(500).send(errors)
		} else {
			var d = instance.startdate.split('\/')
			instance.startdate = d[2] + '-' + d[1] + '-' + d[0]
			d = instance.enddate.split('\/')
			instance.enddate = d[2] + '-' + d[1] + '-' + d[0]
			var query = 'INSERT INTO events__c(name, category, place, address, startdate, enddate, event_type) values(\'' + instance.name + '\', \'' + instance.category + '\', \'' + instance.place + '\', \'' + instance.address + '\', \'' + instance.startdate + '\', \'' + instance.enddate + '\', \'' + instance.event_type + '\')'

			if(instance.id) {
				query = 'UPDATE events__c SET name=\'' + instance.name + '\', category=\'' + instance.category + '\', place=\'' + instance.place + '\', address=\'' + instance.address + '\', startdate=\'' + instance.startdate + '\', enddate=\'' + instance.enddate + '\', event_type=\'' + instance.event_type + '\' WHERE id=\'' + instance.id + '\''
			}
			//console.log('query: ', query)
			executeQuery(query, conn)
			.then(function(result) {
				//console.log('success insert: ', result)
				res.status(200).send(result)
			}).catch(function(err) {
				//console.log('ERROR insert: ', err)
				res.status(500).send(err)
			})

		}
	} catch(err) {
		res.status(500).send(err)
	}
}

var removeEvent = function(req, res) {
	var id = req.body.id
	//console.log('id to remove: ', id)
	if(id && id > 0) {
		var query = 'DELETE FROM events__c WHERE id=' + id
		executeQuery(query, conn)
		.then(function(result) {
			//console.log('success delete: ', result)
			res.status(200).send(result)
		}).catch(function(err) {
			//console.log('ERROR delete: ', err)
			res.status(500).send(err)
		})
	} else {
		res.status(500).send({err: 'Se requiere un id'})
	}
}

var executeQuery = function(query, conn) {
	return new Promise(function(resolve, reject) {
		if(!query || query.length <= 0 || !conn || conn.length <= 0) {
			reject({error: 'query is required'})
		} else {
			pg.defaults.ssl = true
			pg.connect(conn, function(err, client, done) {
				if(err) {
					reject(err);
				} else {
					client.query(query, function(err, result) {
					    done(err)
					    if(err) {
					      reject(err)
					    } else {
					    	resolve(result)
					    }
				  	})
				}
			})
		}
	})
}

router.post('/save', saveEvent)
router.post('/remove', removeEvent)

module.exports = router;
