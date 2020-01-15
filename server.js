/*
|--------------------------------------------------------------------------
| Global APP Init
|--------------------------------------------------------------------------
*/
global._directory_base = __dirname;
global.config = {};
config.app = require('./config/app.js');
config.database = require('./config/database.js')['inspection'][config.app.env];

/*
|--------------------------------------------------------------------------
| APP Setup
|--------------------------------------------------------------------------
*/
// Node Modules
const BodyParser = require('body-parser');
const Express = require('express');
const Mongoose = require('mongoose');
const timeout = require('connect-timeout');
const CronJob = require('cron').CronJob;

//Kernel Model
const Kernel = require(_directory_base + '/app/v2.0/Console/Kernel.js');

// Primary Variable
const App = Express();

//Library
const Security = require(_directory_base + '/app/v2.0/Http/Libraries/Security.js');

/*
|--------------------------------------------------------------------------
| APP Init
|--------------------------------------------------------------------------
*/
// Parse request of content-type - application/x-www-form-urlencoded
App.use(BodyParser.urlencoded({ extended: false }));

// Parse request of content-type - application/json
App.use(BodyParser.json());

// Timeout Handling
App.use(timeout(3600000));
App.use(halt_on_timeout);

function halt_on_timeout(req, res, next) {
	if (!req.timedout) {
		next();
	}
	else {
		return res.json({
			status: false,
			message: "Connection Timeout",
			data: {}
		})
	}
}

// Setup Database
Mongoose.Promise = global.Promise;
Mongoose.connect(config.database.url, {
	useNewUrlParser: true,
	ssl: config.database.ssl
}).then(() => {
	console.log("Database :");
	console.log("\tStatus \t\t: Connected");
	console.log("\tMongoDB URL \t: " + config.database.url + " (" + config.app.env + ")");
}).catch(err => {
	console.log("Database :");
	console.log("\tDatabase Status : Not Connected");
	console.log("\tMongoDB URL \t: " + config.database.url + " (" + config.app.env + ")");
});

// Server Running Message
var Server = App.listen(parseInt(config.app.port[config.app.env]), () => {
	Server.timeout = 120 * 60 * 1000;
	console.log("Server :");
	console.log("\tStatus \t\t: OK");
	console.log("\tService \t: " + config.app.name + " (" + config.app.env + ")");
	console.log("\tPort \t\t: " + config.app.port[config.app.env]);
});

/*
|--------------------------------------------------------------------------
| Cron Scheduling
|--------------------------------------------------------------------------
*/
new CronJob('5 0 * * MON', function () {
	let claims = {
		USERNAME: "sentot.santosa",
		USER_AUTH_CODE: "TAC00011",
		LOCATION_CODE: "63,64,43"
	};
	var token = Security.generate_token(claims); // Generate Token
	Kernel.job_update_transaksi_complete(token);
	console.log('running cron...');
}, null, true, 'Asia/Jakarta');
/*
|--------------------------------------------------------------------------
| Kafka Consumer
|--------------------------------------------------------------------------
*/
// const kafka = require( 'kafka-node' );
// const Consumer = kafka.Consumer;
// const Offset = kafka.Offset;
// const Client = kafka.KafkaClient;
// const topic = 'INS_EMPLOYEE';
// const TAPSuggestionInspection = require( _directory_base + '/app/v1.1/Http/Models/TAPSuggestionInspectionModel.js' );

// const client = new Client( { kafkaHost: config.app.kafka[config.app.env].server_host } );
// const topics = [
// 	{ topic: topic, partition: 0 }
// ];
// const options = { 
// 	autoCommit: false, 
// 	fetchMaxWaitMs: 1000, 
// 	fetchMaxBytes: 1024 * 1024 
// };

// const consumer = new Consumer(client, topics, options);
// const offset = new Offset(client);

// consumer.on( 'message', function( message ) {
// 	if( message ) {
// 		let data = JSON.parse( message.value );
// 		if( data ) {
// 			let set = new TAPSuggestionInspection ( {
// 				NAME: data.NM,
// 				ADDRESS: data.ADRS,
// 				ROLE: data.RL
// 			} );

// 			set.save()
// 			.then( () => {
// 				console.log( 'save success!' );
// 			} )
// 			.catch( err => {
// 				console.log( err.message );
// 			} );
// 		}
// 	}
// } );

// consumer.on( 'error', function( err ) {
// 	console.log( 'error', err );
// } );

// consumer.on( 'offsetOutOfRange', function( topic ) {
// 	topic.maxNum = 2;
// 	offset.fetch([topic], function( err, offsets ) {
// 		if( err ) {
// 			return console.error( err );
// 		}
// 		var min = Math.min.apply( null, offsets[topic.topic][topic.partition] );
// 		consumer.setOffset( topic.topic, topic.partition, min );
// 	});
// });

// Routing
require('./routes/api.js')(App);
module.exports = App;