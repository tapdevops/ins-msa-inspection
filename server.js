/*
|--------------------------------------------------------------------------
| Global APP Init
|--------------------------------------------------------------------------
*/
	global._directory_base = __dirname;
	global.config = {};
		  config.app = require( './config/app.js' );
		  config.database = require( './config/database.js' )['inspection'][config.app.env];

/*
|--------------------------------------------------------------------------
| APP Setup
|--------------------------------------------------------------------------
*/
	// Node Modules
	const BodyParser = require( 'body-parser' );
	const Express = require( 'express' );
	const Mongoose = require( 'mongoose' );
	const timeout = require( 'connect-timeout' );
	const NodeCron = require( 'node-cron' );

	//Kernel Model
	const Kernel = require( _directory_base + '/app/v1.1/Console/Kernel.js' );

	// Primary Variable
	const App = Express();

	//Library
	const Security = require( _directory_base + '/app/v1.1/Http/Libraries/Security.js' );

/*
|--------------------------------------------------------------------------
| APP Init
|--------------------------------------------------------------------------
*/
	// Parse request of content-type - application/x-www-form-urlencoded
	App.use( BodyParser.urlencoded( { extended: false } ) );

	// Parse request of content-type - application/json
	App.use( BodyParser.json() );

	// Timeout Handling
	App.use( timeout( 3600000 ) );
	App.use( halt_on_timeout );

	function halt_on_timeout( req, res, next ){
		if ( !req.timedout ) {
			 next();
		}
		else {
			return res.json( {
				status: false,
				message: "Connection Timeout",
				data: {}
			} )
		}
	}

	// Setup Database
	Mongoose.Promise = global.Promise;
	Mongoose.connect( config.database.url, {
		useNewUrlParser: true,
		ssl: config.database.ssl
	} ).then( () => {
		console.log( "Database :" );
		console.log( "\tStatus \t\t: Connected" );
		console.log( "\tMongoDB URL \t: " + config.database.url + " (" + config.app.env + ")" );
	} ).catch( err => {
		console.log( "Database :" );
		console.log( "\tDatabase Status : Not Connected" );
		console.log( "\tMongoDB URL \t: " + config.database.url + " (" + config.app.env + ")" );
	} );

	// Server Running Message
	var Server = App.listen( parseInt( config.app.port[config.app.env] ), () => {
		Server.timeout = 120 * 60 * 1000;
		console.log( "Server :" );
		console.log( "\tStatus \t\t: OK" );
		console.log( "\tService \t: " + config.app.name + " (" + config.app.env + ")" );
		console.log( "\tPort \t\t: " + config.app.port[config.app.env] );
	} );

	//scheduling job_update_transaksi_complete() with cron
	NodeCron.schedule( '5 0 * * MON', async () => {
		let claims = {
			USERNAME: "sentot.santosa",
			USER_AUTH_CODE: "TAC00011",
			LOCATION_CODE: "63,64,43"
		};
		var token = Security.generate_token( claims ); // Generate Token
		Kernel.job_update_transaksi_complete( token );
		console.log( 'running cron...' );
	} );

	// Routing
	require( './routes/api.js' )( App );
	module.exports = App;