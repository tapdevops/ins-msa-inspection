/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
    //Models
    const Models = {
        InspectionD: require( _directory_base + '/app/v1.1/Http/Models/InspectionDModel.js' ),
        InspectionH: require( _directory_base + '/app/v1.1/Http/Models/InspectionHModel.js' ),
        InspectionGenba: require( _directory_base + '/app/v1.1/Http/Models/InspectionGenbaModel.js' ),
        InspectionTracking: require( _directory_base + '/app/v1.1/Http/Models/InspectionTrackingModel.js' )
    }
    
    //Modules
    const KafkaNode = require( 'kafka-node' );

    //Libraries
    const KafkaServer = require( _directory_base + '/app/v1.1/Http/Libraries/KafkaServer.js' );

    /*
 |--------------------------------------------------------------------------
 | Versi 1.1
 |--------------------------------------------------------------------------
 */
 	/** 
 	  * Create
	  * @desc Untuk export data ke kafka
	  * @return json
	  * --------------------------------------------------------------------
    */
   
    //export block_inspection_detail to kafka
    exports.export_inspection_detail = async ( req, res ) => {
        const query = await Models.InspectionD.aggregate( [
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $skip: 66000
            },
            {
                $limit: 3000
            }
        ] );
        query.forEach( function( data ) {
            let kafka_body = {
                BINCD: data.BLOCK_INSPECTION_CODE_D,
                BINCH: data.BLOCK_INSPECTION_CODE,
                CTINC: data.CONTENT_INSPECTION_CODE,
                VALUE: data.VALUE,
                SSYNC: data.STATUS_SYNC,
                STIME: data.SYNC_TIME,
                INSUR: data.INSERT_USER,
                INSTM: data.INSERT_TIME, 
                UPTUR: data.UPDATE_USER,
                UPTTM: data.UPDATE_TIME,
                DLTUR: data.DELETE_USER,
                DLTTM: data.DELETE_TIME	
            }
            //KafkaServer.producer( 'INS_MSA_INS_TR_BLOCK_INSPECTION_D', JSON.stringify( kafka_body ) );
        } );
        res.send( {
            message: true
        } )
    }

    //export block_inspection_header to kafka
    exports.export_inspection_header = async ( req, res ) => {
        const query = await Models.InspectionH.aggregate( [
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {
                    _id: -1
                }
            },
            {
                $skip: 6000
            },
            {
                $limit: 133
            }
        ] );
        let i = 0;
        query.forEach( function( data ) {
            let kafka_body = {
                BINCH: data.BLOCK_INSPECTION_CODE,
                WERKS: data.WERKS,
                AFD_CODE: data.AFD_CODE,
                BLOCK_CODE: data.BLOCK_CODE,
                AREAL: data.AREAL,
                INSTP: data.INSPECTION_TYPE,
                INSDT: data.INSPECTION_DATE, 
                INSSC: data.INSPECTION_SCORE,
                INSRS: data.INSPECTION_RESULT,
                SSYNC: data.STATUS_SYNC,
                STIME: data.SYNC_TIME, 
                STINS: data.START_INSPECTION, 
                EDINS: data.END_INSPECTION, 
                LATSI: data.LAT_START_INSPECTION,
                LONSI: data.LONG_START_INSPECTION,
                LATEI: data.LAT_END_INSPECTION,
                LONEI: data.LONG_END_INSPECTION,
                INSUR: data.INSERT_USER,
                INSTM: data.INSERT_TIME,
                UPTUR: data.UPDATE_USER,
                UPTTM: data.UPDATE_TIME,
                DLTUR: data.DELETE_USER,
                DLTTM: data.DELETE_TIME	
            }
            console.log( ++i );
            //KafkaServer.producer( 'INS_MSA_INS_TR_BLOCK_INSPECTION_H', JSON.stringify( kafka_body ) );
        } );
        res.send( {
            message: true
        } )
    }

    //export block_inspection_genba to kafka
    exports.export_inspection_genba = async ( req, res ) => {
        const query = await Models.InspectionGenba.aggregate( [
            {
                $project: {
                    _id: 0
                }
            }
        ] );

        query.forEach( function( data ) {
            let kafka_body = {
                BINCH: data.BLOCK_INSPECTION_CODE,
                GNBUR: data.GENBA_USER
            }
            //KafkaServer.producer( 'INS_MSA_INS_TR_INSPECTION_GENBA', JSON.stringify( kafka_body ) );
        } );

        res.send( {
            message: true
        } )
    }
    function sendTrackDataToKafka( totalSkip, length ) {
        // if( length === 0 ) return;
        var intervalId = setInterval( async function() {
            const query = await Models.InspectionTracking.aggregate( [
                {
                    $project: {
                        _id: 0
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $skip: totalSkip
                },
                {
                    $limit: 3000
                }
            ] );
            query.forEach( function( data ) {
                let kafka_body = {
                    TRINC: data.TRACK_INSPECTION_CODE,
                    BINCH: data.BLOCK_INSPECTION_CODE,
                    DTTRK: data.DATE_TRACK,
                    LATTR: data.LAT_TRACK,
                    LONTR: data.LONG_TRACK,
                    INSUR: data.INSERT_USER,
                    INSTM: data.INSERT_TIME, 
                    UPTUR: data.UPDATE_USER,
                    UPTTM: data.UPDATE_TIME,
                    DLTUR: data.DELETE_USER,
                    DLTTM: data.DELETE_TIME
                };
                //KafkaServer.producer( 'INS_MSA_INS_TR_TRACK_INSPECTION', JSON.stringify( kafka_body ) );
            } )
            console.log( 'length: ' + --length );
            totalSkip += 3000;
            length -= 1;
            if( length === 0 ) {
                window.clearInterval( intervalId );
            }
        }, 10000 );
    }
    
    //export inspection_tracking to kafka
    exports.export_inspection_tracking = async ( req, res ) => {   
        sendTrackDataToKafka( 0, 2 );
        res.send( {
            message: 'Sukses'
        } );
        // const query = await Models.InspectionTracking.aggregate( [
        //     {
        //         $project: {
        //             _id: 0
        //         }
        //     }
        // ] );

        // query.forEach( function( data ) {
        //     let kafka_body = {
        //         TRINC: data.TRACK_INSPECTION_CODE,
        //         BINCH: data.BLOCK_INSPECTION_CODE,
        //         DTTRK: data.DATE_TRACK,
        //         LATTR: data.LAT_TRACK,
        //         LONTR: data.LONG_TRACK,
        //         INSUR: data.INSERT_USER,
        //         INSTM: data.INSERT_TIME, 
        //         UPTUR: data.UPDATE_USER,
        //         UPTTM: data.UPDATE_TIME,
        //         DLTUR: data.DELETE_USER,
        //         DLTTM: data.DELETE_TIME
        //     };
		// 	//KafkaServer.producer( 'INS_MSA_INS_TR_TRACK_INSPECTION', JSON.stringify( kafka_body ) );
        // } )
    }
    exports.find_by_month = async ( req, res ) => {
        let start = req.params.month;
        if ( isNaN( parseInt( start ) ) || start.length !== 6 ) {
            return res.send( {
                status: false,
                message: 'Periksa Param Bulan',
                data: {}
            } );
        }
        let end;
        if ( start.substring( 4, 6 ) === '12' ) {
            end = parseInt( start ) + 100;
        } else {
            end = parseInt( start ) + 1;
        }
        try {
            const inspectionDetailCount = await Models.InspectionD.countDocuments( {
                INSERT_TIME: {
                    $gte: parseInt( start + '01000000' ),
                    $lte: parseInt( end + '01000000' )
                }
            } );
            const inspectionHeaderCount = await Models.InspectionH.countDocuments( {
                INSERT_TIME: {
                    $gte: parseInt( start + '01000000' ),
                    $lte: parseInt( end + '01000000' )
                }
            } );
            const inspectionTrackingCount = await Models.InspectionTracking.countDocuments( {
                INSERT_TIME: {
                    $gte: parseInt( start + '01000000' ),
                    $lte: parseInt( end + '01000000' )
                }
            } );
            const inspectionGenbaCount = await Models.InspectionGenba.countDocuments( {} );
            
            res.send( {
                status: true,
                message: 'Data dari ' + start + '01000000 sampai ' + end + '01000000',
                data: {
                    TR_BLOCK_INSPECTION_D: inspectionDetailCount,
                    TR_BLOCK_INSPECTION_H: inspectionHeaderCount,
                    TR_INSPECTION_GENBA: inspectionGenbaCount,
                    TR_TRACK_INSPECTION: inspectionTrackingCount
                }    
            } );
        } catch ( error ) {
            res.send( {
                status: false,
                message: 'Internal Server Error: ' + error.message,
                data: []
            } );
        }
    }

    
