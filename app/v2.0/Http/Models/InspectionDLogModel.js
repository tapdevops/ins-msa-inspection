/*
 |--------------------------------------------------------------------------
 | Variable
 |--------------------------------------------------------------------------
 */
const mongoose = require('mongoose');

/*
 |--------------------------------------------------------------------------
 | Schema
 |--------------------------------------------------------------------------
 */
const InspectionLogSchema = mongoose.Schema({
	BLOCK_INSPECTION_CODE_D: String,
	PARAMETER: Object,
	PROSES: String,
	IMEI: String,
	SYNC_TIME: String,
	INSERT_USER: String,
	INSERT_TIME: {
		type: Number,
		get: v => Math.floor(v),
		set: v => Math.floor(v),
		alias: 'i',
		default: function () {
			return 0;
		}
	},
	Message: String
});

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
module.exports = mongoose.model('LogDInspection_v_2_0', InspectionLogSchema, 'T_LOG_BLOCK_INSPECTION_D');