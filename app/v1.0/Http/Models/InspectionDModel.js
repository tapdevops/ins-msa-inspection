/*
 |--------------------------------------------------------------------------
 | Variable
 |--------------------------------------------------------------------------
 */
	const mongoose = require( 'mongoose' );

/*
 |--------------------------------------------------------------------------
 | Schema
 |--------------------------------------------------------------------------
 */
	const InspectionDSchema = mongoose.Schema( {
		BLOCK_INSPECTION_CODE_D: String,
		BLOCK_INSPECTION_CODE: String,
		CONTENT_INSPECTION_CODE: String,
		VALUE: String,
		STATUS_SYNC: String,
		SYNC_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		INSERT_USER: String,
		INSERT_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		UPDATE_USER: String,
		UPDATE_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		},
		DELETE_USER: String,
		DELETE_TIME: {
			type: Number,
			get: v => Math.floor( v ),
			set: v => Math.floor( v ),
			alias: 'i',
			default: function() {
				return 0;
			}
		}
	});

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = mongoose.model( 'Inspection D', InspectionDSchema, 'TR_BLOCK_INSPECTION_D' );