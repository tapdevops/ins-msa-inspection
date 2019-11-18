/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const InspectionTrackingModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionTrackingModel.js' );

	// Modules
	const Validator = require( 'ferds-validator');

	// Libraries
 	const HelperLib = require( _directory_base + '/app/v1.0/Http/Libraries/HelperLib.js' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */
 	/**
	 * Create
	 * Untuk menyimpan data tracking baru
	 * --------------------------------------------------------------------------
	 */
	exports.create = ( req, res ) => {
		
		var rules = [
			{ "name": "TRACK_INSPECTION_CODE", "value": req.body.TRACK_INSPECTION_CODE, "rules": "required|alpha_numeric" },
			{ "name": "DATE_TRACK", "value": req.body.DATE_TRACK.toString(), "rules": "required|exact_length(14)|numeric" },
			{ "name": "BLOCK_INSPECTION_CODE", "value": req.body.BLOCK_INSPECTION_CODE, "rules": "required|alpha_numeric" },
			{ "name": "LAT_TRACK", "value": parseFloat( req.body.LAT_TRACK ), "rules": "required|latitude" },
			{ "name": "LONG_TRACK", "value": parseFloat( req.body.LONG_TRACK ), "rules": "required|longitude" },
			{ "name": "INSERT_USER", "value": req.body.INSERT_USER, "rules": "required|alpha_numeric" },
			{ "name": "INSERT_TIME", "value": req.body.INSERT_TIME.toString(), "rules": "required|exact_length(14)|numeric" },
			{ "name": "STATUS_TRACK", "value": req.body.STATUS_TRACK.toString(), "rules": "required|numeric" }
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
			const set = new InspectionTrackingModel( {
				TRACK_INSPECTION_CODE: req.body.TRACK_INSPECTION_CODE || "",
				BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE || "",
				DATE_TRACK: HelperLib.date_format( req.body.DATE_TRACK, 'YYYYMMDDhhmmss' ),
				LAT_TRACK: req.body.LAT_TRACK || "",
				LONG_TRACK: req.body.LONG_TRACK || "",
				SYNC_TIME: HelperLib.date_format( 'now', 'YYYYMMDDhhmmss' ),
				INSERT_USER: req.body.INSERT_USER || "",
				INSERT_TIME: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ) || 0,
				UPDATE_USER: "",
				UPDATE_TIME: 0,
				DELETE_USER: "",
				DELETE_TIME: 0,
				STATUS_TRACK: req.body.STATUS_TRACK
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
				res.send( {
					status: true,
					message: config.app.error_message.create_200,
					data: {}
				} );

			} ).catch( err => {
				res.send( {
					status: false,
					message: config.app.error_message.create_500,
					data: {}
				} );
			} );
		}
		
	};