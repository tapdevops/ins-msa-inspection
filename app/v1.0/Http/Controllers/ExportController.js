/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
 	const InspectionHModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionHModel.js' );
 	const InspectionDModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionDModel.js' );

	// Libraries
 	const HelperLib = require( _directory_base + '/app/v1.0/Http/Libraries/HelperLib.js' );


/*
 |--------------------------------------------------------------------------
 | Versi 1.0.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Premi
	  * --------------------------------------------------------------------
	*/
 	exports.premi = async ( req, res ) => {
 		console.log(req.params)
 		var data = await InspectionHModel.aggregate( [
 			{
				"$lookup": {
					"from": "TR_BLOCK_INSPECTION_D",
					"localField": "BLOCK_INSPECTION_CODE",
					"foreignField": "BLOCK_INSPECTION_CODE",
					"as": "DETAIL"
				}
			},
			{
				"$project": {
					"BLOCK_INSPECTION_CODE": 1,
					"WERKS": 1,
					"AFD_CODE": 1,
					"BLOCK_CODE": 1,
					"AREAL": 1,
					"INSPECTION_TYPE": 1,
					"INSPECTION_DATE": 1,
					"INSPECTION_SCORE": 1,
					"INSPECTION_RESULT": 1,
					"SYNC_TIME": 1,
					"START_INSPECTION": 1,
					"END_INSPECTION": 1,
					"LAT_START_INSPECTION": 1,
					"LONG_START_INSPECTION": 1,
					"LAT_END_INSPECTION": 1,
					"LONG_END_INSPECTION": 1,
					"INSERT_USER": 1,
					"INSERT_TIME": 1,
					"_id": 0,
					"DETAIL.BLOCK_INSPECTION_CODE_D" : 1,
					"DETAIL.CONTENT_INSPECTION_CODE" : 1,
					"DETAIL.VALUE" : 1
				}
			},
			{
				"$match": {
					"INSPECTION_DATE": {
						"$gte": parseInt( req.params.first_date ),
						"$lte": parseInt( req.params.end_date )
					}
				}
			}
 		] );

 		return res.json( {
 			status: true,
 			mesage: "Success!",
 			data: data
 		} );
 		
 	}

 	exports.tap_dw_tr_inspection = async ( req, res ) => {
 		var data = await InspectionHModel.aggregate( [
			{
				"$lookup": {
					"from": "TR_BLOCK_INSPECTION_D",
					"localField": "BLOCK_INSPECTION_CODE",
					"foreignField": "BLOCK_INSPECTION_CODE",
					"as": "DETAIL"
				}
			},
			{
				"$lookup": {
					"from": "TR_TRACK_INSPECTION",
					"localField": "BLOCK_INSPECTION_CODE",
					"foreignField": "BLOCK_INSPECTION_CODE",
					"as": "TRACK"
				}
			},
			{
				"$project": {
					"_id": 0,
					"WERKS": 1,
					"AFD_CODE": 1,
					"BLOCK_CODE": 1,
					"BLOCK_INSPECTION_CODE": 1,
					"INSPECTION_TYPE": 1,
					"INSPECTION_DATE": 1,
					"INSPECTION_SCORE": 1, 
					"INSPECTION_RESULT": 1,
					"INSERT_TIME": 1,
					"INSERT_USER": 1,
					"AREAL": 1,
					"LAT_START_INSPECTION": 1,
					"LONG_START_INSPECTION": 1,
					"LAT_END_INSPECTION": 1,
					"LONG_END_INSPECTION": 1,
					"DETAIL.BLOCK_INSPECTION_CODE_D": 1,
					"DETAIL.CONTENT_INSPECTION_CODE": 1,
					"DETAIL.VALUE": 1,
					"TRACK.TRACK_INSPECTION_CODE": 1,
					"TRACK.DATE_TRACK": 1,
					"TRACK.LAT_TRACK": 1,
					"TRACK.LONG_TRACK": 1
				}
			},
			{
				"$match": {
					"INSPECTION_DATE": {
						"$gte": parseInt( req.params.first_date ),
						"$lte": parseInt( req.params.end_date )
					}
				}
			},
			// {
			// 	"$limit": 10
			// }
		] );

 		return res.json( {
 			status: true,
 			message: "Success!",
 			data: data
 		} );
 	};
