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
	const InspectionHModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionHModel.js' );
	const InspectionTrackingModel = require( _directory_base + '/app/v1.0/Http/Models/InspectionTrackingModel.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v1.0/Http/Models/SummaryWeeklyModel.js' );
	const Helper = require( _directory_base + '/app/v1.0/Http/Libraries/HelperLib.js' );

	// Node Module
	const MomentTimezone = require( 'moment-timezone' );

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */

 	exports.compute_distance = ( lat1, lon1, lat2, lon2) => {
		var R = 6371; // Lingkar Bumi (KM)
		var dLat = ( lat2 - lat1 ) * Math.PI / 180;
		var dLon = ( lon2 - lon1 ) * Math.PI / 180;
		var a = Math.sin( dLat/2 ) * Math.sin( dLat/2 ) +
			Math.cos( lat1 * Math.PI / 180 ) * Math.cos( lat2 * Math.PI / 180 ) *
			Math.sin( dLon / 2 ) * Math.sin(dLon/2);
		var c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
		var d = R * c;

		return Math.round( d * 1000 );
	}

 	/** 
 	  * Total Inspeksi : Per-Minggu
	  * --------------------------------------------------------------------
	  * Skenario : 
	  * 1. Mobile kirim data tanggal
	  * 2. Service terima data tanggal, dan compare dengan table TR_SUMMARY
	  *	   berdasarkan.
	*/
 	exports.total_inspeksi = async ( req, res ) => {

 		// Inspeksi
 		var date = new Date();
 			date.setDate( date.getDate() - 1 );
 		var max_inspection_date = parseInt( MomentTimezone( date ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
 		var inspection_test = await InspectionHModel.aggregate( [
			{
				"$match": {
					"INSERT_USER": req.auth.USER_AUTH_CODE
				}
			},
			{
				"$group": {
					"_id": {
						"WERKS": "$WERKS",
						"AFD_CODE": "$AFD_CODE",
						"BLOCK_CODE": "$BLOCK_CODE"
					},
					"count": {
						"$sum": 1
					}
				}
			}
		] );
		var results = {
			inspeksi: {
				total_inspeksi: 0,
				total_baris: 0,
				target: 10 // Masih hardcode
			},
			berjalan_kaki: {
				distance_meter: 1200,
				distance_km: 1.2,
				duration: 125
			}
		};

		if ( inspection_test.length > 0 ) {
			results.inspeksi.total_baris = inspection_test.length;
			
			inspection_test.forEach( function( dt ) {
				results.inspeksi.total_inspeksi = results.inspeksi.total_inspeksi + dt.count;
			} );
		}

		// Berjalan Kaki
		var query = await InspectionTrackingModel.aggregate( [
			{
				"$sort": {
					"_id": 1
				}
			},
			{
				"$match": {
					"INSERT_USER": req.auth.USER_AUTH_CODE
				}
			},
			{
				"$project": {
					"_id": 0,
					"TRACK_INSPECTION_CODE": 1,
					"BLOCK_INSPECTION_CODE": 1,
					"DATE_TRACK": 1,
					"LAT_TRACK": 1,
					"LONG_TRACK": 1
				}
			}
		] );

		var total_meter_distance = 0;
		var total_km_distance = 0;

		if ( query.length > 0 ) {
			for ( var i = 0; i <= ( query.length - 1 ); i++ ) {
				if ( i < ( query.length - 1 ) ) {
					var j = i + 1;
					var track_1 = query[i];
					var track_2 = query[j];
					var compute_distance = exports.compute_distance( track_1.LAT_TRACK, track_1.LONG_TRACK, track_2.LAT_TRACK, track_2.LONG_TRACK );
					console.log(compute_distance);
					total_meter_distance += compute_distance;
				}
			}
		}

		// results.berjalan_kaki.distance_meter = total_meter_distance;
		// results.berjalan_kaki.distance_km = parseInt( ( total_meter_distance / 1000 ) );
		results.berjalan_kaki.distance_meter = 1200;
		results.berjalan_kaki.distance_km = 1.2;
		results.berjalan_kaki.duration = 125;

 		return res.status( 200 ).json( {
 			status: true,
 			message: "Success!",
 			data: results
		 } );
	 }
	 
	
 	exports.total_durasi_inspeksi = async ( req, res ) => {
 		// Model : SummaryWeeklyModel
//		
		var date_now = new Date();
		date_now = parseInt( MomentTimezone( date_now ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) );
		var date_min_1_week = new Date();
		date_min_1_week.setDate( date_min_1_week.getDate() - 7 );
		date_min_1_week = parseInt( MomentTimezone( date_min_1_week ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) );
		
		var query = await InspectionHModel.aggregate( [
			{
				$match: {
					INSERT_TIME: {
						$gte: 20190801000000,
						$lte: 20190810235959,
					}
				}
			},
			{
				$group: {
					_id: {
						INSERT_USER: "$INSERT_USER"
					}
				}
			},
			{
				$project: {
					_id: 0,
					USER_AUTH_CODE: "$_id.INSERT_USER"
				}
			}
		] ); 
		for(i in query){
			var authCode = query[i].USER_AUTH_CODE;
			var queryTime = await InspectionHModel.aggregate( [
				{
					"$match": {
						"INSERT_USER": authCode
					}
				},
				{
					"$project":{
						"_id": 0,
						"START_INSPECTION": 1,
						"END_INSPECTION": 1
					}
				}
			] );
			var total_time = 0;
			if( queryTime.length > 0 ){
				for( var i = 0; i < queryTime.length; i++ ){
					var inspection = queryTime[i];
					var hasil = Math.abs( inspection.END_INSPECTION - inspection.START_INSPECTION );
					total_time += hasil;
				}
			}
			var queryTrack = await InspectionTrackingModel.aggregate( [
				{
					"$sort": {
						"INSERT_TIME": -1
					}
				},
				{
					"$match": {
						"INSERT_USER": authCode
					}
				},
				{
					"$project": {
						"_id": 0,
						"TRACK_INSPECTION_CODE": 1,
						"BLOCK_INSPECTION_CODE": 1,
						"DATE_TRACK": 1,
						"LAT_TRACK": 1,
						"LONG_TRACK": 1
					}
				}
			] );

			var total_meter_distance = 0;

			if ( queryTrack.length > 0 ) {
				for ( var i = 0; i <= ( queryTrack.length - 1 ); i++ ) {
					if ( i < ( queryTrack.length - 1 ) ) {
						var j = i + 1;
						var track_1 = queryTrack[i];
						var track_2 = queryTrack[j];
						var compute_distance = exports.compute_distance( track_1.LAT_TRACK, track_1.LONG_TRACK, track_2.LAT_TRACK, track_2.LONG_TRACK );
						
						total_meter_distance += compute_distance;
					}
				}
			}

			var query_inspeksi_baris = await InspectionHModel.find({
				INSPECTION_DATE: {
					$gte: 20190801000000,
					$lte: 20190810235959,
				},
				USER_AUTH_CODE: authCode
			}).count();

			console.log(query_inspeksi_baris);
			
			
			var set = new SummaryWeeklyModel( {
				"DURASI": total_time,
				"JARAK": total_meter_distance,
				"TOTAL_INSPEKSI": 40,
				"TOTAL_BARIS": query_inspeksi_baris,
				"SUMMARY_DATE": date_now,
				"INSERT_USER": "SYSTEM", // Hardcode
				"INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
			} );
			set.save();
			
		}
	}