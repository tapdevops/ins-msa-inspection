/*
 |--------------------------------------------------------------------------
 | App Setup
 |--------------------------------------------------------------------------
 |
 | Untuk menghandle models, libraries, helper, node modules, dan lain-lain
 |
 */
 	// Models
	const inspectionHModel = require( '../models/inspectionH.js' );
	const inspectionLogHModel = require( '../models/inspectionHLog.js' );
	const inspectionDModel = require( '../models/inspectionD.js' );
	const inspectionLogDModel = require( '../models/inspectionDLog.js' );
	const inspectionTrackingModel = require( '../models/inspectionTracking.js' );

	// Node Modules
	const querystring = require('querystring');
	const url = require( 'url' );
	const jwt = require( 'jsonwebtoken' );
	const uuid = require( 'uuid' );
	const nJwt = require( 'njwt' );
	const jwtDecode = require( 'jwt-decode' );
	const Client = require('node-rest-client').Client; 
	const moment_pure = require( 'moment' );
	const moment = require( 'moment-timezone' );

	// Libraries
	const config = require( '../../config/config.js' );
	const date = require( '../libraries/date.js' );
	const randomTextLib = require( '../libraries/randomText' );


	const dateAndTimes = require( 'date-and-time' );


// Create and Save new Data
exports.createTracking = ( req, res ) => {
	
	
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}


		var auth = jwtDecode( req.token );
		var blockinscode = req.body.BLOCK_INSPECTION_CODE;
		var split = blockinscode.split("-");

		if ( split.length == 7 ) {

			var randomText = randomTextLib.generate( 10 );
			/*
			var CODE = auth.EMPLOYEE_NIK + 
				dateAndTimes.format( new Date(), 'YYYYMMDD' ) + 
				'-' + 
				split[3] + 
				'-' +
				split[4] + 
				'-' + 
				split[5] + 
				'-T-' + 
				randomText;*/

			const set = new inspectionTrackingModel( {
				TRACK_INSPECTION_CODE: req.body.TRACK_INSPECTION_CODE || "",
				BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE || "",
				DATE_TRACK: req.body.DATE_TRACK,
				LAT_TRACK: req.body.LAT_TRACK || "",
				LONG_TRACK: req.body.LONG_TRACK || "",
				SYNC_TIME: req.body.SYNC_TIME || "",
				INSERT_USER: auth.USER_AUTH_CODE,
				INSERT_TIME: new Date().getTime(),
				UPDATE_USER: auth.USER_AUTH_CODE,
				UPDATE_TIME: new Date().getTime(),
				DELETE_USER: "",
				DELETE_TIME: "",
			} );

			set.save()
			.then( data => {
				if ( !data ) {
					return res.status( 404 ).send( {
						status: false,
						message: 'Inspection Tracking gagal dibuat',
						data: {}
					} );
				}

				res.send( {
					status: true,
					message: 'Success',
					data: {}
				} );

			} ).catch( err => {
				res.status( 500 ).send( {
					status: false,
					message: 'Some error occurred while creating data',
					data: {}
				} );
			} );
			
		}
		else {
			return res.status( 404 ).send( {
				status: false,
				message: 'Block Inspection Code tidak valid',
				data: {}
			} );
		}
		
	} );
	
};

// Create and Save new Data
exports.create = ( req, res ) => {
	
	
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );
		var randomText = randomTextLib.generate( 5 );
		/*
		var CODE = auth.EMPLOYEE_NIK + 
			'-INS-' + 
			dateAndTimes.format( new Date(), 'YYYYMMDD' ) + 
			'-' + 
			req.body.WERKS + 
			'-' +
			req.body.AFD_CODE + 
			'-' + 
			req.body.BLOCK_CODE + 
			'-' + 
			randomText;*/

		//console.log( CODE );
		console.log( randomTextLib.generate( 5 ) );
		console.log( auth );
		
		const inspectionH = new inspectionHModel( {
			BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
			WERKS: req.body.WERKS,
			AFD_CODE: req.body.AFD_CODE,
			BLOCK_CODE: req.body.BLOCK_CODE,
			INSPECTION_DATE: req.body.INSPECTION_DATE || "",
			INSPECTION_RESULT: req.body.INSPECTION_RESULT,
			STATUS_SYNC: req.body.STATUS_SYNC,
			SYNC_TIME: req.body.SYNC_TIME || "",
			START_INSPECTION: req.body.START_INSPECTION || "",
			END_INSPECTION: req.body.START_INSPECTION || "",
			LAT_START_INSPECTION: req.body.LAT_START_INSPECTION,
			LONG_START_INSPECTION: req.body.LONG_START_INSPECTION,
			LAT_END_INSPECTION: req.body.LAT_END_INSPECTION,
			LONG_END_INSPECTION: req.body.LONG_END_INSPECTION,
			INSERT_USER: auth.USER_AUTH_CODE,
			INSERT_TIME: new Date().getTime(),
			UPDATE_USER: auth.USER_AUTH_CODE,
			UPDATE_TIME: new Date().getTime(),
			DELETE_USER: "",
			DELETE_TIME: "",
		} );

		inspectionH.save()
		.then( data => {

			// Insert Block Inspection H Log
			const inspectionHLog = new inspectionLogHModel( {
				BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
				PROSES: 'INSERT',
				IMEI: auth.IMEI,
				SYNC_TIME: new Date().getTime(),
				INSERT_USER: auth.USER_AUTH_CODE,
				INSERT_TIME: new Date().getTime(),
			} );

			inspectionHLog.save()
			.then( data_log => {
	    		
	    		var i = 1;
	    		req.body.INSPECTION_D.forEach( function( inspd ) {

	    			var CODE_D = auth.EMPLOYEE_NIK + 
						'-INS-' + 
						dateAndTimes.format( new Date(), 'YYYYMMDD' ) + 
						'-' + 
						req.body.WERKS + 
						'-' +
						req.body.AFD_CODE + 
						'-' + 
						req.body.BLOCK_CODE + 
						'-D-' + 
						i;

					console.log(CODE);
	    			const inspectionD = new inspectionDModel( {
						BLOCK_INSPECTION_CODE_D: req.body.BLOCK_INSPECTION_CODE_D,
						BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
						CONTENT_CODE: inspd.CONTENT_CODE,
						AREAL: inspd.AREAL,
						VALUE: inspd.VALUE,
						STATUS_SYNC: inspd.STATUS_SYNC,
						SYNC_TIME: inspd.SYNC_TIME,
						INSERT_USER: auth.USER_AUTH_CODE,
						INSERT_TIME: new Date().getTime(),
						UPDATE_USER: auth.USER_AUTH_CODE,
						UPDATE_TIME: new Date().getTime(),
						DELETE_USER: "",
						DELETE_TIME: ""
					} );

					inspectionD.save()
					.then( data => {
						if ( !data ) {
							console.log( 'Error Inspeksi D Insert 2' );
						}
						const inspectionLogD = new inspectionLogDModel( {
							BLOCK_INSPECTION_CODE_D: req.body.BLOCK_INSPECTION_CODE_D,
							PROSES: 'INSERT',
							IMEI: auth.IMEI,
							SYNC_TIME: req.body.LOG.SYNC_TIME || "",
							INSERT_USER: auth.USER_AUTH_CODE,
							INSERT_TIME: new Date().getTime(),
						} );

						inspectionLogD.save();

					} ).catch( err => {
						console.log( 'Error Inspeksi D Insert' );
					} );

	    			i++;

				} );

				res.send( {
					status: true,
					message: 'Success',
					//data: result
					data: {}
				} );
			} ).catch( err => {
				res.status( 500 ).send( {
					status: false,
					message: 'Some error occurred while creating data2',
					data: {}
				} );
			} );

		} ).catch( err => {
			res.status( 500 ).send( {
				status: false,
				message: 'Some error occurred while creating data1',
				data: {}
			} );
		} );
		
	} );
	
};

/**
 * createH
 * Untuk membuat dan menyimpan Inspeksi Header
 * --------------------------------------------------------------------------
 */
exports.createH = ( req, res ) => {
	
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );
		var randomText = randomTextLib.generate( 5 );
		/*
		var CODE = auth.EMPLOYEE_NIK + 
			'-INS-' + 
			dateAndTimes.format( new Date(), 'YYYYMMDD' ) + 
			'-' + 
			req.body.WERKS + 
			'-' +
			req.body.AFD_CODE + 
			'-' + 
			req.body.BLOCK_CODE + 
			'-' + 
			randomText;*/
		
		const inspectionH = new inspectionHModel( {
			BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
			WERKS: req.body.WERKS,
			AFD_CODE: req.body.AFD_CODE,
			BLOCK_CODE: req.body.BLOCK_CODE,
			INSPECTION_DATE: req.body.INSPECTION_DATE || "",
			INSPECTION_RESULT: req.body.INSPECTION_RESULT,
			STATUS_SYNC: req.body.STATUS_SYNC,
			SYNC_TIME: req.body.SYNC_TIME || "",
			START_INSPECTION: req.body.START_INSPECTION || "",
			END_INSPECTION: req.body.START_INSPECTION || "",
			LAT_START_INSPECTION: req.body.LAT_START_INSPECTION,
			LONG_START_INSPECTION: req.body.LONG_START_INSPECTION,
			LAT_END_INSPECTION: req.body.LAT_END_INSPECTION,
			LONG_END_INSPECTION: req.body.LONG_END_INSPECTION,
			INSERT_USER: auth.USER_AUTH_CODE,
			INSERT_TIME: new Date().getTime(),
			UPDATE_USER: auth.USER_AUTH_CODE,
			UPDATE_TIME: new Date().getTime(),
			DELETE_USER: "",
			DELETE_TIME: "",
		} );

		inspectionH.save()
		.then( data => {

			// Insert Block Inspection H Log
			const inspectionHLog = new inspectionLogHModel( {
				BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
				PROSES: 'INSERT',
				IMEI: auth.IMEI,
				SYNC_TIME: new Date().getTime(),
				INSERT_USER: auth.USER_AUTH_CODE,
				INSERT_TIME: new Date().getTime(),
			} );

			inspectionHLog.save()
			.then( data_log => {
				if ( !data_log ) {
					return res.status( 404 ).send( {
						status: false,
						message: 'Error! Data gagal diproses',
						data: {}
					} );
				}

				res.send( {
					status: true,
					message: 'Success',
					data: {}
				} );
			} ).catch( err => {
				res.status( 500 ).send( {
					status: false,
					message: 'Error! Terjadi kesalahan dalam pembuatan data - 2',
					data: {}
				} );
			} );

		} ).catch( err => {
			res.status( 500 ).send( {
				status: false,
				message: 'Error! Terjadi kesalahan dalam pembuatan data - 1',
				data: {}
			} );
		} );
		
	} );
	
};

// Create and Save new Data
exports.createD = ( req, res ) => {
	
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var blockinscode = req.body.BLOCK_INSPECTION_CODE;
		var split = blockinscode.split("-");
		var auth = jwtDecode( req.token );
		var randomText = randomTextLib.generate( 5 );
		/*var CODE = auth.EMPLOYEE_NIK + 
			'-' + 
			dateAndTimes.format( new Date(), 'YYYYMMDD' ) + 
			'-' + 
			split[3] + 
			'-' +
			split[4] + 
			'-' + 
			split[5] + 
			'-D-' + 
			randomText;*/

		const set = new inspectionDModel( {
			BLOCK_INSPECTION_CODE_D: req.body.BLOCK_INSPECTION_CODE_D,
			BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE,
			CONTENT_CODE: req.body.CONTENT_CODE,
			AREAL: req.body.AREAL,
			VALUE: req.body.VALUE,
			STATUS_SYNC: req.body.STATUS_SYNC,
			SYNC_TIME: req.body.SYNC_TIME,
			INSERT_USER: auth.USER_AUTH_CODE,
			INSERT_TIME: new Date().getTime(),
			UPDATE_USER: auth.USER_AUTH_CODE,
			UPDATE_TIME: new Date().getTime(),
			DELETE_USER: "",
			DELETE_TIME: ""
		} );

		set.save()
		.then( data => {
			if ( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: 'Data gagal dibuat',
					data: {}
				} );
			}

			const setLog = new inspectionLogDModel( {
				BLOCK_INSPECTION_CODE_D: req.body.BLOCK_INSPECTION_CODE_D,
				PROSES: 'INSERT',
				IMEI: auth.IMEI,
				SYNC_TIME: req.body.SYNC_TIME || "",
				INSERT_USER: auth.USER_AUTH_CODE,
				INSERT_TIME: new Date().getTime(),
			} );

			setLog.save();

			res.send( {
				status: true,
				message: 'Success',
				data: {}
			} );
		} ).catch( err => {
			res.status( 500 ).send( {
				status: false,
				message: 'Some error occurred while creating data2',
				data: {}
			} );
		} );
		
	} );
	
};

// Retrieve and return all notes from the database.
exports.findH = ( req, res ) => {

	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );

		url_query = req.query;
		var url_query_length = Object.keys( url_query ).length;
		
		url_query.DELETE_USER = "";
		url_query.DELETE_TIME = "";

		inspectionHModel.find( url_query )
		.then( data => {
			if( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: 'Data not found 2',
					data: {}
				} );
			}
			res.send( {
				status: true,
				message: 'Success',
				data: data
			} );
		} ).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send( {
					status: false,
					message: 'Data not found 1',
					data: {}
				} );
			}
			return res.status( 500 ).send( {
				status: false,
				message: 'Error retrieving data',
				data: {}
			} );
		} );
	} );

};

// Retrieve and return all notes from the database.
exports.findD = ( req, res ) => {

	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );

		url_query = req.query;
		var url_query_length = Object.keys( url_query ).length;
		
		url_query.DELETE_USER = "";
		url_query.DELETE_TIME = "";

		inspectionDModel.find( url_query )
		.then( data => {
			if( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: 'Data not found 2',
					data: {}
				} );
			}
			res.send( {
				status: true,
				message: 'Success',
				data: data
			} );
		} ).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send( {
					status: false,
					message: 'Data not found 1',
					data: {}
				} );
			}
			return res.status( 500 ).send( {
				status: false,
				message: 'Error retrieving data',
				data: {}
			} );
		} );
	} );

};

// Find a single data with a ID
exports.findOneH = ( req, res ) => {
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );

		inspectionHModel.findOne( { 
			BLOCK_INSPECTION_CODE : req.params.id,
			DELETE_USER: "",
			DELETE_TIME: ""
		} ).then( data => {
			if( !data ) {
				return res.status(404).send({
					status: false,
					message: "Data not found 2 with id " + req.params.id,
					data: data,
				});
			}
			res.send( {
				status: true,
				message: 'Success',
				data: data
			} );
		} ).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send({
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				});
			}
			return res.status( 500 ).send({
				status: false,
				message: "Error retrieving Data with id " + req.params.id,
				data: {}
			} );
		} );
	} );
};

// Find a single data with a ID
exports.findOneD = ( req, res ) => {
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}
		
		var auth = jwtDecode( req.token );

		inspectionDModel.findOne( { 
			BLOCK_INSPECTION_CODE_D : req.params.id,
			DELETE_USER: "",
			DELETE_TIME: ""
		} ).then( data => {
			if( !data ) {
				return res.status(404).send({
					status: false,
					message: "Data not found 2 with id " + req.params.id,
					data: data,
				});
			}
			res.send( {
				status: true,
				message: 'Success',
				data: data
			} );
		} ).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send({
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				});
			}
			return res.status( 500 ).send({
				status: false,
				message: "Error retrieving Data with id " + req.params.id,
				data: {}
			} );
		} );
	} );
};

// Update single data with ID
exports.updateH = ( req, res ) => {

	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {
		// Validation
		if( !req.body.INSPECTION_DATE || !req.body.INSPECTION_RESULT || !req.body.STATUS_SYNC ) {
			return res.status( 400 ).send({
				status: false,
				message: 'Invalid input',
				data: {}
			});
		}

		var auth = jwtDecode( req.token );
		console.log( auth );
		
		inspectionHModel.findOneAndUpdate( { 
			BLOCK_INSPECTION_CODE : req.params.id 
		}, {
			INSPECTION_DATE: req.body.INSPECTION_DATE || "",
			INSPECTION_RESULT: req.body.INSPECTION_RESULT,
			STATUS_SYNC: req.body.STATUS_SYNC,
			SYNC_TIME: req.body.SYNC_TIME || "",
			START_INSPECTION: req.body.START_INSPECTION || "",
			END_INSPECTION: req.body.START_INSPECTION || "",
			LAT_START_INSPECTION: req.body.LAT_START_INSPECTION,
			LONG_START_INSPECTION: req.body.LONG_START_INSPECTION,
			LAT_END_INSPECTION: req.body.LAT_END_INSPECTION,
			LONG_END_INSPECTION: req.body.LONG_END_INSPECTION,
			UPDATE_USER: auth.USER_AUTH_CODE,
			UPDATE_TIME: new Date().getTime()
			
		}, { new: true } )
		.then( data => {
			if( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				} );
			}

			// Insert Block Inspection H Log
			const inspectionHLog = new inspectionLogHModel( {
				BLOCK_INSPECTION_CODE: req.params.id,
				PROSES: 'UPDATE',
				IMEI: auth.IMEI,
				SYNC_TIME: new Date().getTime(),
				INSERT_USER: auth.USER_AUTH_CODE,
				INSERT_TIME: new Date().getTime(),
			} );

			inspectionHLog.save()
			.then( data_log => {
				if( !data ) {
					return res.status( 404 ).send( {
						status: false,
						message: "Data log not found 1 with id " + req.params.id,
						data: {}
					} );
				}

				res.send( {
					status: true,
					message: 'Success',
					data: {}
				} );
			}).catch( err => {
				if( err.kind === 'ObjectId' ) {
					return res.status( 404 ).send( {
						status: false,
						message: "Data log not found 2 with id " + req.params.id,
						data: {}
					} );
				}
				return res.status( 500 ).send( {
					status: false,
					message: "Data log error updating with id " + req.params.id,
					data: {}
				} );
			});

		}).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 2 with id " + req.params.id,
					data: {}
				} );
			}
			return res.status( 500 ).send( {
				status: false,
				message: "Data error updating with id " + req.params.id,
				data: {}
			} );
		});
	});
};

// Update single data with ID
exports.updateD = ( req, res ) => {
	
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {
		// Validation
		if( !req.body.BLOCK_INSPECTION_CODE || !req.body.CONTENT_CODE || !req.body.STATUS_SYNC || !req.body.VALUE ) {
			return res.status( 400 ).send({
				status: false,
				message: 'Invalid input',
				data: {}
			});
		}

		var auth = jwtDecode( req.token );
		console.log( auth );
		
		inspectionDModel.findOneAndUpdate( { 
			BLOCK_INSPECTION_CODE_D : req.params.id,
			BLOCK_INSPECTION_CODE: req.body.BLOCK_INSPECTION_CODE
		}, {
			CONTENT_CODE: req.body.CONTENT_CODE,
			AREAL: req.body.AREAL,
			VALUE: req.body.VALUE,
			STATUS_SYNC: req.body.STATUS_SYNC,
			SYNC_TIME: req.body.SYNC_TIME,
			UPDATE_USER: auth.USER_AUTH_CODE,
			UPDATE_TIME: new Date().getTime()
		}, { new: true } )
		.then( data => {
			if( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				} );
			}
			
			res.send( {
				status: true,
				message: 'Success',
				data: {}
			} );
		}).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 2 with id " + req.params.id,
					data: {}
				} );
			}
			return res.status( 500 ).send( {
				status: false,
				message: "Data error updating with id " + req.params.id,
				data: {}
			} );
		});
	});
};

// Delete data with the specified ID in the request
exports.deleteH = ( req, res ) => {
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );
		res.json({
			message:auth
		})
		/*
		findingModel.findOneAndUpdate( { 
			FINDING_CODE : req.params.id 
		}, {
			DELETE_USER: auth.USERNAME,
			DELETE_TIME: new Date().getTime()
			
		}, { new: true } )
		.then( data => {
			if( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				} );
			}

			const setLog = new findingLogModel( {
				FINDING_CODE: req.params.id,
				PROSES: 'DELETE',
				PROGRESS: '',
				IMEI: auth.IMEI,
				SYNC_TIME: new Date(),
				SYNC_USER: auth.USER_AUTH_CODE
			} );

			setLog.save()
			.then( data => {
				if ( !data ) {
					res.send( {
					status: false,
					message: 'Error',
					data: {}
				} );
				}
				res.send( {
					status: true,
					message: 'Success',
					data: {}
				} );

			} ).catch( err => {
				res.status( 500 ).send( {
					status: false,
					message: 'Some error occurred while deleting data',
					data: {}
				} );
			} );
			
		}).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				} );
			}
			return res.status( 500 ).send( {
				status: false,
				message: "Could not delete data with id " + req.params.id,
				data: {}
			} );
		});
		*/
	});
};

// Delete data with the specified ID in the request
exports.deleteD = ( req, res ) => {
	nJwt.verify( req.token, config.secret_key, config.token_algorithm, ( err, authData ) => {

		if ( err ) {
			return res.status( 404 ).send( {
				status: false,
				message: 'Invalid Token',
				data: {}
			} );
		}

		var auth = jwtDecode( req.token );
		res.json({
			message:auth
		})
		/*
		findingModel.findOneAndUpdate( { 
			FINDING_CODE : req.params.id 
		}, {
			DELETE_USER: auth.USERNAME,
			DELETE_TIME: new Date().getTime()
			
		}, { new: true } )
		.then( data => {
			if( !data ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				} );
			}

			const setLog = new findingLogModel( {
				FINDING_CODE: req.params.id,
				PROSES: 'DELETE',
				PROGRESS: '',
				IMEI: auth.IMEI,
				SYNC_TIME: new Date(),
				SYNC_USER: auth.USER_AUTH_CODE
			} );

			setLog.save()
			.then( data => {
				if ( !data ) {
					res.send( {
					status: false,
					message: 'Error',
					data: {}
				} );
				}
				res.send( {
					status: true,
					message: 'Success',
					data: {}
				} );

			} ).catch( err => {
				res.status( 500 ).send( {
					status: false,
					message: 'Some error occurred while deleting data',
					data: {}
				} );
			} );
			
		}).catch( err => {
			if( err.kind === 'ObjectId' ) {
				return res.status( 404 ).send( {
					status: false,
					message: "Data not found 1 with id " + req.params.id,
					data: {}
				} );
			}
			return res.status( 500 ).send( {
				status: false,
				message: "Could not delete data with id " + req.params.id,
				data: {}
			} );
		});
		*/
	});
};