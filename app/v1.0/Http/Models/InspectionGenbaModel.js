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
	const InspectionGenbaSchema = mongoose.Schema( {
		BLOCK_INSPECTION_CODE: String,
		GENBA_USER: String
	});

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = mongoose.model( 'InspectionGenba', InspectionGenbaSchema, 'TR_INSPECTION_GENBA' );