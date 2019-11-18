/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const InspectionGenbaModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionGenbaModel.js' );
	const InspectionHModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionHModel.js' );

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
 	exports.create = async ( req, res ) => {

 		if ( !req.body.BLOCK_INSPECTION_CODE ) {
 			return res.status( 200 ).json( {
 				status: false,
	 			message: "BLOCK_INSPECTION_CODE tidak valid.",
	 			data: []
	 		} );
 		}

 		if ( !req.body.GENBA_USER ) {
 			return res.status( 200 ).json( {
 				status: false,
	 			message: "GENBA_USER tidak valid.",
	 			data: []
	 		} );
 		}

 		if ( req.body.GENBA_USER.length < 1 ) {
 			return res.status( 200 ).json( {
 				status: false,
	 			message: "GENBA_USER kosong.",
	 			data: []
	 		} );
 		}

 		var check_block_inspection_code = await InspectionHModel.findOne( {
 			BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE
 		} ).count();

 		if ( check_block_inspection_code == 1 ) {
 			var insert_array = [];
 			req.body.GENBA_USER.forEach( function( data ) {
 				insert_array.push( {
 					BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
 					GENBA_USER: data
 				} );
 			} );
 			var insert_db = await InspectionGenbaModel.insertMany( insert_array );

 			if ( insert_db.length > 0 ) {
 				return res.send( {
					status: true,
					message: config.app.error_message.create_200,
					data: {}
				} );
 			}
 			else {
 				return res.send( {
					status: false,
					message: config.app.error_message.create_404 + ' - Log',
					data: {}
				} );
 			}
 		}
 		else {
 			return res.status( 200 ).json( {
 				status: false,
	 			message: "BLOCK_INSPECTION_CODE tidak ditemukan.",
	 			data: []
	 		} );
 		}
	};