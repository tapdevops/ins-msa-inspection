/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const ViewInspectionModel = require( _directory_base + '/app/v1.2/Http/Models/ViewInspectionModel.js' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Find
	  * Untuk mengambil seluruh data atau dengan parameter tertentu, contohnya :
	  * URL.DOMAIN/v1.1/q?WERKS=4122
	  * URL.DOMAIN/v1.1/q?WERKS=4122&BLOCK_CODE=001
	  * --------------------------------------------------------------------
	*/
 	exports.find = async ( req, res ) => {

 		console.log("XXX");

 		var url_query = req.query;
		var url_query_length = Object.keys( url_query ).length;
		var query = {};
			query.DELETE_USER = "";

		console.log( query );
		
		// Find By Region Code
		if ( req.query.REGION_CODE && !req.query.COMP_CODE ) {
			console.log( 'Find By Region Code' );
			var results = await ViewInspectionModel.find( {
				WERKS: new RegExp( '^' + req.query.REGION_CODE.substr( 1, 2 ) ),
				INSPECTION_DATE: {
					$gte: parseInt( req.query.START_DATE ),
					$lte: parseInt( req.query.END_DATE )
				},
				DELETE_USER: ""
			} );

			console.log({
				WERKS: new RegExp( '^' + req.query.REGION_CODE.substr( 1, 2 ) ),
				INSPECTION_DATE: {
					$gte: parseInt( req.query.START_DATE ),
					$lte: parseInt( req.query.END_DATE )
				},
				DELETE_USER: ""
			});
			
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: results
			} );
		}

		// Find By Comp Code
		if ( req.query.COMP_CODE && !req.query.WERKS ) {
			console.log( 'Find By Comp Code' );
			var results = await ViewInspectionModel.find( {
				WERKS: new RegExp( '^' + req.query.COMP_CODE.substr( 0, 2 ) ),
				INSPECTION_DATE: {
					$gte: parseInt( req.query.START_DATE ),
					$lte: parseInt( req.query.END_DATE )
				},
				DELETE_USER: ""
			} );
			
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: results
			} );
		}
		
		// Find By BA Code / WERKS
		if ( req.query.WERKS && !req.query.AFD_CODE ) {
			console.log( 'Find By BA Code / WERKS' );
			var results = await ViewInspectionModel.find( {
				WERKS: new RegExp( '^' + req.query.WERKS.substr( 0, 4 ) ),
				INSPECTION_DATE: {
					$gte: parseInt( req.query.START_DATE ),
					$lte: parseInt( req.query.END_DATE )
				},
				DELETE_USER: ""
			} );
			
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: results
			} );
		}
		
		// Find By AFD Code
		if ( req.query.AFD_CODE && req.query.WERKS && !req.query.BLOCK_CODE ) {
			console.log( 'Find By AFD Code' );
			var results = await ViewInspectionModel.find( {
				WERKS: req.query.WERKS,
				AFD_CODE: req.query.AFD_CODE,
				INSPECTION_DATE: {
					$gte: parseInt( req.query.START_DATE ),
					$lte: parseInt( req.query.END_DATE )
				},
				DELETE_USER: ""
			} );
			
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: results
			} );
		}

		// Find By Block Code
		if ( req.query.BLOCK_CODE && req.query.AFD_CODE && req.query.WERKS ) {
			console.log( 'Find By Block Code' );
			var results = await ViewInspectionModel.find( {
				WERKS: req.query.WERKS,
				AFD_CODE: req.query.AFD_CODE,
				BLOCK_CODE: req.query.BLOCK_CODE,
				INSPECTION_DATE: {
					$gte: parseInt( req.query.START_DATE ),
					$lte: parseInt( req.query.END_DATE )
				},
				DELETE_USER: ""
			} );
			
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: results
			} );
		}
 	}