/*
 |--------------------------------------------------------------------------
 | Models - Kafka Error Log 
 |--------------------------------------------------------------------------
 */

// const Mongoose = require( 'mongoose' );

// const KafkaErrorLogSchema = Mongoose.Schema( {
//     TR_CODE: String,
//     TOPIC: String,
//     INSERT_TIME: {
//         type: Number,
//         get: v => Math.round( v ),
//         set: v => Math.round( v ),
//         alias: 'i'
//     }
// } );

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
// module.exports = Mongoose.model( 'KafkaErrorLog', KafkaErrorLogSchema, 'TR_KAFKA_ERROR_LOGS' );

/*
 |--------------------------------------------------------------------------
 | Models - Kafka Error Log 
 |--------------------------------------------------------------------------
 */
const Mongoose = require('mongoose');

const KafkaErrorLogSchema = Mongoose.Schema({
    TR_CODE: String,
    TOPIC: String,
    INSERT_TIME: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v),
        alias: "i"
    }
});

/*
 |--------------------------------------------------------------------------
 | Exports
 |--------------------------------------------------------------------------
 */
module.exports = Mongoose.model('KafkaErrorLog_v_2_0', KafkaErrorLogSchema, 'TR_KAFKA_ERROR_LOGS');
