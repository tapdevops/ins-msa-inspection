/*
|--------------------------------------------------------------------------
| Variable
|--------------------------------------------------------------------------
*/
// const Kafka = require( 'kafka-node' );
const { Kafka } = require('kafkajs');


//Models
const KafkaErrorLog = require( _directory_base + '/app/v2.0/Http/Models/KafkaErrorLogModel.js' );
/*
|--------------------------------------------------------------------------
| Kafka Server Library
|--------------------------------------------------------------------------
|
| Apache Kafka is an open-source stream-processing software platform 
| developed by LinkedIn and donated to the Apache Software Foundation, 
| written in Scala and Java. The project aims to provide a unified, 
| high-throughput, low-latency platform for handling real-time data feeds.
|
*/
	const kafka = new Kafka({
		clientId: 'MSA-INSPECTION',
		brokers: [config.app.kafka[config.app.env].server_host]
	})
   
	const producer = kafka.producer()
		
	class KafkaServer {
		async producer(topic, message) {
			// Producing
			try {
				await producer.connect();
				await producer.send({
					topic: topic,
					messages: [
						{ value: message },
					],
					retry: {
						initialRetryTime: 100,
						retries: 5
					}
				});
				console.log( '[KAFKA PRODUCER] - Broker Update success.' );
			} catch (error) {
				console.log( '[KAFKA PRODUCER] - Connection Error.' );

				//throw err;
				let data = JSON.parse( message );

				let set = new KafkaErrorLog( {
					TR_CODE: data.BINCD ? data.BINCD : data.BINCH ? data.BINCH : data.TRINC ? data.TRINC : null,
					TOPIC: topic,
					INSERT_TIME: data.INSTM ? data.INSTM : 0
				} );
				console.log( set );
				set.save();
				console.log( `simpan ke TR_KAFKA_ERROR_LOGS!` );
			}
		}
		/*producer ( topic, messages ) {
			// Class
			const Producer = Kafka.Producer;
			const Client = new Kafka.KafkaClient( { 
				kafkaHost: config.app.kafka[config.app.env].server_host
			} );

			// Variable
			const producer_kafka_client = new Producer( Client );
			const payloads = [
				{
					topic: topic,
					messages: messages
					
				}
			];

			producer_kafka_client.on( 'ready', async function() {
				const push_status = producer_kafka_client.send( payloads, ( err, data ) => {
					if ( err ) {
						// console.log( '[KAFKA PRODUCER] - Broker Update Failed.' );
					} else {
						// console.log( '[KAFKA PRODUCER] - Broker Update Success.' );
					}
				} );
			} );

			producer_kafka_client.on( 'error', function( err ) {
				// console.log( err );
				console.log( '[KAFKA PRODUCER] - Connection Error.' );

				//throw err;
				let data = JSON.parse( messages );

				let set = new KafkaErrorLog( {
					TR_CODE: data.BINCD ? data.BINCD : data.BINCH ? data.BINCH : data.TRINC ? data.TRINC : null,
					TOPIC: topic,
					INSERT_TIME: data.INSTM ? data.INSTM : 0
				} );
				console.log( set );
				set.save();
				console.log( `simpan ke TR_KAFKA_ERROR_LOGS!` );
			});
		}
		*/
		consumer () {
			// const Consumer = Kafka.Consumer;
			// const Client = new Kafka.KafkaClient( {
			// 	kafkaHost: '149.129.252.13:9092'
			// } );
			// const consumer_kafka_client = new Consumer(
			// 	Client,
			// 	[
			// 		{
			// 			topic: 'ferdinand_topic_ebcc', 
			// 			partition: 0 
			// 		}
			// 	],
			// 	{
			// 		autoCommit: true,
			// 		fetchMaxWaitMs: 1000,
			// 		fetchMaxBytes: 1024 * 1024,
			// 		encoding: 'utf8',
			// 		fromOffset: false
			// 	}
			// );
			// consumer_kafka_client.on( 'message', async function( message ) {
			// 	// var value = message.value.split( "|" );
			// 	// var data = JSON.parse( value[1] );
			// 	console.log( message );
			// })
			// consumer_kafka_client.on( 'error', function( err ) {
			// 	console.log( 'error', err );
			// });
		}

	}

/*
|--------------------------------------------------------------------------
| Module Exports
|--------------------------------------------------------------------------
*/
	module.exports = new KafkaServer();