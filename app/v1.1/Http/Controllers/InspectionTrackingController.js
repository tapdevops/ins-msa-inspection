/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const InspectionTrackingModel = require( _directory_base + '/app/v1.1/Http/Models/InspectionTrackingModel.js' );

	// Modules
	const Validator = require( 'ferds-validator');

	// Libraries
	const HelperLib = require( _directory_base + '/app/v1.1/Http/Libraries/HelperLib.js' );
	const KafkaServer = require( _directory_base + '/app/v1.1/Http/Libraries/KafkaServer.js' ); 

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
					status: true,
					message: config.app.error_message.create_404,
					data: {}
				} );
			}
			else {
				var kafka_body = {
					TRINC: req.body.TRACK_INSPECTION_CODE,
					BINCH: req.body.BLOCK_INSPECTION_CODE,
					DTTRK: HelperLib.date_format( req.body.DATE_TRACK, 'YYYYMMDDhhmmss' ),
					LATTR: req.body.LAT_TRACK || "",
					LONTR: req.body.LONG_TRACK || "",
					INSUR: req.body.INSERT_USER || "",
					INSTM: HelperLib.date_format( req.body.INSERT_TIME, 'YYYYMMDDhhmmss' ) || 0,
					UPTUR: "",
					UPTTM: 0,
					DLTUR: "",
					DLTTM: 0
				};
			   KafkaServer.producer( 'INS_MSA_INS_TR_TRACK_INSPECTION', JSON.stringify( kafka_body ) );
			}
			return res.send( {
				status: true,
				message: config.app.error_message.create_200,
				data: {}
			} );

		} ).catch( err => {
			console.log(err)
			return res.send( {
				status: true,
				message: config.app.error_message.create_500,
				data: {}
			} );
		} );
	};