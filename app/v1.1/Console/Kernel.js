/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
    
    // Models
	const FindingModel = require( _directory_base + '/app/v1.1/Http/Models/Finding.js' );
	const SummaryWeeklyModel = require( _directory_base + '/app/v1.1/Http/Models/SummaryWeekly.js' );

	// Node Module
	const MomentTimezone = require( 'moment-timezone' );

	// Libraries
	const HelperLib = require( _directory_base + '/app/v1.1/Http/Libraries/HelperLib.js' );

/*
|--------------------------------------------------------------------------
| Kernel
|--------------------------------------------------------------------------
|
| In the past, you may have generated a Cron entry for each task you needed
| to schedule on your server. However, this can quickly become a pain,
| because your task schedule is no longer in source control and you must
| SSH into your server to add additional Cron entries.
|
*/
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
    class Kernel {
    /*
        |--------------------------------------------------------------------------
        | Update Transaksi Complete
        |--------------------------------------------------------------------------
        |
        | Untuk mengupdate transaksi-transaksi yang sudah complete. Cron jalan setiap
        | jam 5 pagi.
        |
    */
        async job_update_transaksi_complete() {
    

            var url = {
                user_data: config.app.url[config.app.env].microservice_auth + '/api/v1.1/user/data',
                time_daily: config.app.url[config.app.env].ldap_2 + '/dw/time-daily/get-active-date-min-7'
            };
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
                            },
                            {
                                "$sort": {
                                    "START_INSPECTION": -1
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
                                if( dt.USER_AUTH_CODE == '0101' ){
                                    console.log( ba_code );
                                }
                                
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
                                        "INSERT_USER": dt.USER_AUTH_CODE, 
                                        "INSERT_TIME": Helper.date_format( 'now', 'YYYYMMDDhhmmss' )
                                    } );
                                    if( dt.USER_AUTH_CODE == '0126'){
                                        console.log( set );
                                    }
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
            } );
        }
    }