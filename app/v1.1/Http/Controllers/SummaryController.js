/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
	const InspectionDModel = require( _directory_base + '/app/v1.1/Http/Models/InspectionDModel.js' );
	const InspectionHModel = require( _directory_base + '/app/v1.1/Http/Models/InspectionHModel.js' );
	const InspectionTrackingModel = require( _directory_base + '/app/v1.1/Http/Models/InspectionTrackingModel.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v1.1/Http/Models/SummaryWeeklyModel.js' );
	const Helper = require( _directory_base + '/app/v1.1/Http/Libraries/HelperLib.js' );

	// Node Module
	const MomentTimezone = require( 'moment-timezone' );
	const NodeRestClient = require( 'node-rest-client' ).Client;

/*
 |--------------------------------------------------------------------------
 | Versi 1.0
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Get Summary Inspeksi
	  * --------------------------------------------------------------------
	*/
	exports.inspeksi = async ( req, res ) => {
		var query_summary_weekly = await SummaryWeeklyModel.aggregate( [
			{
				"$match": {
					"INSERT_USER": req.auth.USER_AUTH_CODE 
				}
			},
			{
				$sort: {
					SUMMARY_DATE: -1
				}
			},
			{
				$limit: 1
			}
		]);
		var result = {
			jarak_meter: 0,
			durasi_menit: 0 ,
			durasi_jam: 0,
			total_inspeksi: 0,
			total_baris: 0,
			target_inspeksi: 0,
			summary_date: 0,
			insert_user: "",
			insert_time: 0
		}

		if ( query_summary_weekly.length > 0 ) {
			var summary = query_summary_weekly[0]
			var jam = parseInt( summary.DURASI / 3600 );
			var menit = parseInt( summary.DURASI % 3600 / 60 );
			
			var result = {
				jarak_meter: summary.JARAK,
				durasi_menit: menit ,
				durasi_jam: jam >= 1 ? jam : 0,
				total_inspeksi: summary.TOTAL_INSPEKSI,
				total_baris: summary.TOTAL_BARIS,
				target_inspeksi: summary.TARGET_INSPEKSI,
				summary_date: summary.SUMMARY_DATE,
				insert_user: summary.INSERT_USER,
				insert_time: summary.INSERT_TIME
			}
		}

		if( req.body.IS_VIEW ){
			if ( req.body.IS_VIEW == 1 ) {
				SummaryWeeklyModel.findOneAndUpdate( 
					{
						INSERT_USER: req.auth.USER_AUTH_CODE,
						IS_VIEW : 0	
					}, 
					{
						IS_VIEW: 1
					}, 
					{ new: true } 
				).then( data => {
					return res.json( {
						"status": ( summary.IS_VIEW == 0 ? true : false ),
						"message": "OK",
						"data": result
					} );
				} );
			}
		}
		else {
			return res.json( {
				"status": false,
				"message": "Error! Variabel IS_VIEW kosong",
				"data": []
			} );
		}
		
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

 		var url = {
 			user_data: config.app.url[config.app.env].microservice_auth + '/api/v1.1/user/data',
 			time_daily: config.app.url[config.app.env].ldap_2 + '/dw/time-daily/get-active-date-min-7'
 		}
		var args = {
			headers: { 
				"Content-Type": "application/json",
				"Authorization": "Bearer " + req.token 
			}
		};
		var date_now = new Date();
			date_now = parseInt( MomentTimezone( date_now ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '235959' );
		var date_min_1_week = new Date();
			date_min_1_week.setDate( date_min_1_week.getDate() - 7 );
			date_min_1_week = parseInt( MomentTimezone( date_min_1_week ).tz( "Asia/Jakarta" ).format( "YYYYMMDD" ) + '000000' );

		( new NodeRestClient() ).get( url.user_data, args, async function ( data, response ) {
			if ( data.status == true ) {
				data = data.data;
				data.forEach( async function( dt ) {
					var authCode = dt.USER_AUTH_CODE;
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
						for( var j = 0; j < queryTime.length; j++ ){
							var inspection = queryTime[j];
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

						for ( var k = 0; k <= ( queryTrack.length - 1 ); k++ ) {
							if ( k < ( queryTrack.length - 1 ) ) {
								var l = k + 1;
								var track_1 = queryTrack[k];
								var track_2 = queryTrack[l];
								var compute_distance = exports.compute_distance( track_1.LAT_TRACK, track_1.LONG_TRACK, track_2.LAT_TRACK, track_2.LONG_TRACK );
								
								total_meter_distance += compute_distance;
							}
						}
					}
					
					var query_total_inspeksi = await InspectionHModel.aggregate( [
						{	
							$group: {
								"_id": {
									"WERKS": "$WERKS",
									"AFD_CODE": "$AFD_CODE",
									"BLOCK_CODE": "$BLOCK_CODE",
									"INSERT_USER": "$INSERT_USER",
									"INSPECTION_DATE": {
										"$toInt": {
											"$substr": [
												{
													"$toLong": "$INSPECTION_DATE"
												},
												0,
												8
											]
										}
									}
								},
								"COUNT": {
									"$sum": 1
								},
							}
						},
						{
							$project: {
								"_id": 0,
								"WERKS": "$_id.WERKS",
								"AFD_CODE": "$_id.AFD_CODE",
								"BLOCK_CODE": "$_id.BLOCK_CODE",
								"INSPECTION_DATE": "$_id.INSPECTION_DATE",
								"INSERT_USER": "$_id.INSERT_USER",
								"COUNT": "$COUNT"
							}
						},
						{
							$match: {
								"INSPECTION_DATE": {
									"$gte": parseInt( date_min_1_week.toString().substr( 0, 8 ) ),
									"$lte": parseInt( date_now.toString().substr( 0, 8 ) )
								},
								"INSERT_USER": authCode
							}
						}
					]);
					
					var total_baris = 0;
					if ( query_total_inspeksi.length > 0 ) {
						for ( index in query_total_inspeksi ) {
							total_baris += query_total_inspeksi[index].COUNT;
						}
					}

					var location_code = dt.LOCATION_CODE.split( ',' );
					if ( location_code.length > 0 ) {
						if ( dt.USER_ROLE == 'ASISTEN_LAPANGAN' ) {
							var ba_code = location_code[0].substr( 0, 4 );
							var url_ldap = url.time_daily + '/' + ba_code;
							var args_ldap = {
								headers: { 
									"Content-Type": "application/json" 
								}
							};

							( new NodeRestClient() ).get( url_ldap, args_ldap, function ( time_data, time_response ) {
								var target_inspeksi = parseInt( time_data.data.results.jumlah_hari ) * 2;
								var set = new SummaryWeeklyModel( {
									"DURASI": total_time,
									"JARAK": parseInt( total_meter_distance / 1000 ) ,
									"TOTAL_INSPEKSI": query_total_inspeksi.length, 
									"TOTAL_BARIS": total_baris,
									"TARGET_INSPEKSI": target_inspeksi,
									"SUMMARY_DATE": parseInt( date_now.toString().substr( 0, 8 ) ),
									"IS_VIEW": 0,
									"INSERT_USER": dt.USER_AUTH_CODE, // Hardcode
									"INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
								} );
								set.save();
							} );
						}
						else if ( dt.USER_ROLE == 'KEPALA_KEBUN' ) {
							var target_inspeksi = parseInt( 2 * location_code.length );
							var set = new SummaryWeeklyModel( {
								"DURASI": total_time,
								"JARAK": parseInt( total_meter_distance / 1000 ) ,
								"TOTAL_INSPEKSI": query_total_inspeksi.length, 
								"TOTAL_BARIS": total_baris,
								"TARGET_INSPEKSI": target_inspeksi,
								"SUMMARY_DATE": parseInt( date_now.toString().substr( 0, 8 ) ),
								"IS_VIEW": 0,
								"INSERT_USER": dt.USER_AUTH_CODE, // Hardcode
								"INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
							} );
							set.save();
						}
						
						else {
							var set = new SummaryWeeklyModel( {
								"DURASI": total_time,
								"JARAK": parseInt( total_meter_distance / 1000 ) ,
								"TOTAL_INSPEKSI": query_total_inspeksi.length, 
								"TOTAL_BARIS": total_baris,
								"TARGET_INSPEKSI": 0,
								"SUMMARY_DATE": parseInt( date_now.toString().substr( 0, 8 ) ),
								"IS_VIEW": 0,
								"INSERT_USER": dt.USER_AUTH_CODE, // Hardcode
								"INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
							} );
							set.save();
						}
					}
					
				} );
			}

			return res.json( {
				status: true,
				message: "OK",
				data: {}
			} );
		} );
	}