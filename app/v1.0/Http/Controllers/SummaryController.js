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
 	/** 
 	  * Get Summary Inspeksi
	  * --------------------------------------------------------------------
	*/
	exports.inspeksi = ( req, res ) => {

		var result = {
			jarak_meter: 0,
			durasi_detik: 0,
			durasi_menit: 0,
			total_inspeksi: 0,
			total_baris: 0
		}

		return res.json( {
			"status": true,
			"message": "OK",
			"data": result
		} );
	}

 	/** 
 	  * Compute Distance
	  * --------------------------------------------------------------------
	  * Hitung jarak antara 2 latitude dan longitude.
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
 	  * Process Weekly : Per-Minggu
	  * --------------------------------------------------------------------
	  * Skenario : 
	  * 1. Fungsi dijalankan per hari senin jam 12.30
	*/
 	exports.process_weekly = async ( req, res ) => {

		var date_now = new Date();
			date_now = parseInt( MomentTimezone( date_now ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
		var date_min_1_week = new Date();
			date_min_1_week.setDate( date_min_1_week.getDate() - 7 );
			date_min_1_week = parseInt( MomentTimezone( date_min_1_week ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '000000' );
		var query = await InspectionHModel.aggregate( [
			{
				$match: {
					INSERT_TIME: {
						$gte: date_min_1_week,
						$lte: date_now,
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

		for ( i in query ) {
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

			var query_inspeksi_baris = await InspectionHModel.find( {
				INSPECTION_DATE: {
					$gte: date_min_1_week,
					$lte: date_now,
				},
				INSERT_USER: authCode
			} ).count();
			
			var set = new SummaryWeeklyModel( {
				"DURASI": total_time,
				"JARAK": total_meter_distance,
				"TOTAL_INSPEKSI": 0, // Masih Hardcode
				"TOTAL_BARIS": query_inspeksi_baris,
				"SUMMARY_DATE": date_now,
				"INSERT_USER": "SYSTEM", // Hardcode
				"INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
			} );
			set.save();
			
		}
	}