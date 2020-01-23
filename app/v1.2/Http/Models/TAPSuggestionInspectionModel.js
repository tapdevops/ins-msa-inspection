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

    const TAPSuggestionInspectionSchema = mongoose.Schema( {
        NAME: String, 
        ADDRESS: String,
        ROLE: String
    } );

/*
 |--------------------------------------------------------------------------
 | Export
 |--------------------------------------------------------------------------
*/

    module.exports = mongoose.model( 'TAPSuggesstionInspection', TAPSuggestionInspectionSchema, 'TAP_TM_SUGGESTION_INSPECTION' );
