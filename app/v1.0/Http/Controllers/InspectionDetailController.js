/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const InspectionDModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionDModel.js' );
 	const InspectionDLogModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionDLogModel.js' );

	// Modules
	const Validator = require( 'ferds-validator');

	// Libraries
 	const HelperLib = require( _directory_base + '/app/v1.0/Http/Libraries/HelperLib.js' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Create
	  * Untuk menyimpan detail inspeksi yang diinputkan melalui mobile.
	  * --------------------------------------------------------------------
	*/
 	exports.create = ( req, res ) => {

		var rules = [
			{ "name": "BLOCK_INSPECTION_CODE_D", "value": req.body.BLOCK_INSPECTION_CODE_D, "rules": "required|alpha_numeric" },
			{ "name": "BLOCK_INSPECTION_CODE", "value": req.body.BLOCK_INSPECTION_CODE, "rules": "required|alpha_numeric" },
			{ "name": "CONTENT_INSPECTION_CODE", "value": req.body.CONTENT_INSPECTION_CODE, "rules": "required|alpha_numeric" },
			{ "name": "VALUE", "value": req.body.VALUE, "rules": "required" },
			{ "name": "STATUS_SYNC", "value": req.body.STATUS_SYNC, "rules": "required|alpha" },
			{ "name": "SYNC_TIME", "value": req.body.SYNC_TIME.toString(), "rules": "required|exact_length(14)|numeric" },
			{ "name": "INSERT_USER", "value": req.body.INSERT_USER, "rules": "required|alpha_numeric" },
			{ "name": "INSERT_TIME", "value": req.body.INSERT_TIME.toString(), "rules": "required|exact_length(14)|numeric" }
		];

		var run_validator = Validator.run( rules );
		console.log( run_validator.error_lists );

		if ( run_validator.status == false ) {
			res.json( {
				status: false,
				message: "Error! Periksa kembali inputan anda.",
				data: []
			} );
		}
		else {
			var auth = req.auth;
			const set = new InspectionDModel( {
				BLOCK_INSPECTION_CODE_D: req.body.BLOCK_INSPECTION_CODE_D,
				BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
				CONTENT_INSPECTION_CODE: req.body.CONTENT_INSPECTION_CODE,
				VALUE: req.body.VALUE,
				STATUS_SYNC: req.body.STATUS_SYNC,
				SYNC_TIME: HelperLib.date_format( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
				INSERT_USER: req.body.INSERT_USER,
				INSERT_TIME: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
				UPDATE_USER: req.body.INSERT_USER,
				UPDATE_TIME: HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' ),
				DELETE_USER: "",
				DELETE_TIME: 0
			} );


			set.save()
			.then( data => {
				if ( !data ) {
					return res.send( {
						status: false,
						message: config.app.error_message.create_404,
						data: {}
					} );
				}

				const set_log = new InspectionDLogModel( {
					BLOCK_INSPECTION_CODE_D: req.body.BLOCK_INSPECTION_CODE_D,
					PROSES: 'INSERT',
					IMEI: auth.IMEI,
					SYNC_TIME: HelperLib.date_format( req.body.SYNC_TIME, 'YYYYMMDDhhmmss' ),
					INSERT_USER: req.body.INSERT_USER,
					INSERT_TIME: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ),
				} );

				set_log.save()
				.then( data_log => {
					if ( !data_log ) {
						return res.send( {
							status: false,
							message: config.app.error_message.create_404 + ' - Log',
							data: {}
						} );
					}
					res.send( {
						status: true,
						message: config.app.error_message.create_200,
						data: {}
					} );
				} ).catch( err => {
					res.send( {
						status: false,
						message: config.app.error_message.create_500 + ' - 2',
						data: {}
					} );
				} );
			} ).catch( err => {
				res.status( 500 ).send( {
					status: false,
					message: config.app.error_message.create_500 + ' - 2',
					data: {}
				} );
			} );
		}
		
	};

 	/** 
 	  * Find One
	  * Untuk menampilkan 1 row data berdasarkan Block Inspection Detail Code.
	  * --------------------------------------------------------------------
	*/
	exports.find_one = ( req, res ) => {

		var auth = req.auth;
		InspectionDModel.findOne( { 
			BLOCK_INSPECTION_CODE_D : req.params.id,
			DELETE_USER: ""
		} )

		.select( {
			_id: 0,
			__v: 0
		} )
		.then( data => {
			if( !data ) {
				return res.send( {
					status: false,
					message: config.app.error_message.find_404 + ' - 2',
					data: {}
				} );
			}
			res.send( {
				status: true,
				message: config.app.error_message.find_200,
				data: data
			} );
		} ).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.send({
					status: false,
					message: config.app.error_message.find_404 + ' - 1',
					data: {}
				});
			}
			return res.send({
				status: false,
				message: config.app.error_message.find_500,
				data: {}
			} );
		} );
	};