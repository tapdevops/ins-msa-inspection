/*
 |--------------------------------------------------------------------------
 | Setup
 |--------------------------------------------------------------------------
 */
// Node Modules
const RoutesVersioning = require('express-routes-versioning')();

// Controllers
const Controllers = {
	v_1_2: {
		ExportController: require(_directory_base + '/app/v1.2/Http/Controllers/ExportController.js'),
		ExportKafkaController: require(_directory_base + '/app/v1.2/Http/Controllers/ExportKafkaController.js'),
		InspectionDetailController: require(_directory_base + '/app/v1.2/Http/Controllers/InspectionDetailController.js'),
		InspectionGenbaController: require(_directory_base + '/app/v1.2/Http/Controllers/InspectionGenbaController.js'),
		InspectionHeaderController: require(_directory_base + '/app/v1.2/Http/Controllers/InspectionHeaderController.js'),
		InspectionTrackingController: require(_directory_base + '/app/v1.2/Http/Controllers/InspectionTrackingController.js'),
		InspectionReportController: require(_directory_base + '/app/v1.2/Http/Controllers/InspectionReportController.js'),
		SummaryController: require(_directory_base + '/app/v1.2/Http/Controllers/SummaryController.js'),
	},
	v_1_1: {
		ExportController: require(_directory_base + '/app/v1.1/Http/Controllers/ExportController.js'),
		ExportKafkaController: require(_directory_base + '/app/v1.1/Http/Controllers/ExportKafkaController.js'),
		InspectionDetailController: require(_directory_base + '/app/v1.1/Http/Controllers/InspectionDetailController.js'),
		InspectionGenbaController: require(_directory_base + '/app/v1.1/Http/Controllers/InspectionGenbaController.js'),
		InspectionHeaderController: require(_directory_base + '/app/v1.1/Http/Controllers/InspectionHeaderController.js'),
		InspectionTrackingController: require(_directory_base + '/app/v1.1/Http/Controllers/InspectionTrackingController.js'),
		InspectionReportController: require(_directory_base + '/app/v1.1/Http/Controllers/InspectionReportController.js'),
		SummaryController: require(_directory_base + '/app/v1.1/Http/Controllers/SummaryController.js'),
	},
	v_1_0: {
		ExportController: require(_directory_base + '/app/v1.0/Http/Controllers/ExportController.js'),
		InspectionDetailController: require(_directory_base + '/app/v1.0/Http/Controllers/InspectionDetailController.js'),
		InspectionGenbaController: require(_directory_base + '/app/v1.0/Http/Controllers/InspectionGenbaController.js'),
		InspectionHeaderController: require(_directory_base + '/app/v1.0/Http/Controllers/InspectionHeaderController.js'),
		InspectionTrackingController: require(_directory_base + '/app/v1.0/Http/Controllers/InspectionTrackingController.js'),
		InspectionReportController: require(_directory_base + '/app/v1.0/Http/Controllers/InspectionReportController.js'),
		SummaryController: require(_directory_base + '/app/v1.0/Http/Controllers/SummaryController.js'),
	}
}

// Middleware
const Middleware = {
	v_1_2: {
		VerifyToken: require(_directory_base + '/app/v1.2/Http/Middleware/VerifyToken.js')
	},
	v_1_1: {
		VerifyToken: require(_directory_base + '/app/v1.1/Http/Middleware/VerifyToken.js')
	},
	v_1_0: {
		VerifyToken: require(_directory_base + '/app/v1.0/Http/Middleware/VerifyToken.js')
	}
}

/*
 |--------------------------------------------------------------------------
 | Routing
 |--------------------------------------------------------------------------
 */
module.exports = (app) => {

	/*
	 |--------------------------------------------------------------------------
	 | Welcome Message
	 |--------------------------------------------------------------------------
	 */
	app.get('/', (req, res) => {
		return res.json({
			application: {
				name: config.app.name,
				env: config.app.env,
				port: config.app.port[config.app.env]
			}
		})
	});

	/*
	 |--------------------------------------------------------------------------
	 | Versi 1.2
	 |--------------------------------------------------------------------------
	 */
	// Inspection Detail
	app.get('/api/v1.2/detail/:id', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionDetailController.find_one);
	app.post('/api/v1.2/detail', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionDetailController.create);

	// Inspection Header
	app.post('/api/v1.2/genba', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionGenbaController.create);

	// Inspection Header
	app.get('/api/v1.2/find', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionHeaderController.find);
	app.post('/api/v1.2/header', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionHeaderController.create);
	app.get('/api/v1.2/header/:id', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionHeaderController.find_one);

	// Inspection Tracking
	app.post('/api/v1.2/tracking', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionTrackingController.create);

	// Inspection Report
	app.get('/api/v1.2/report', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.InspectionReportController.find);

	// Summary
	app.post('/api/v1.2/summary', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.SummaryController.inspeksi);
	app.get('/api/v1.2/summary/generate', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.SummaryController.process_weekly);

	// Export
	app.get('/api/v1.2/export/premi/:first_date/:end_date', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportController.premi);
	app.get('/api/v1.2/export/tap-dw/tr-inspection/:first_date/:end_date', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportController.tap_dw_tr_inspection);

	//Export-Kafka
	app.get('/api/v1.2/export-kafka/inspection-detail', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportKafkaController.export_inspection_detail);
	app.get('/api/v1.2/export-kafka/inspection-header', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportKafkaController.export_inspection_header);
	app.get('/api/v1.2/export-kafka/inspection-genba', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportKafkaController.export_inspection_genba);
	app.get('/api/v1.2/export-kafka/inspection-tracking', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportKafkaController.export_inspection_tracking);

	// GET Inspection Header, Detail, Genba, Track By Month
	app.get('/api/v1.2/inspection-month/:month', Middleware.v_1_2.VerifyToken, Controllers.v_1_2.ExportKafkaController.find_by_month);

	/*
   /*
	|--------------------------------------------------------------------------
	| Versi 1.1
	|--------------------------------------------------------------------------
	*/
	// Inspection Detail
	app.get('/api/v1.1/detail/:id', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionDetailController.find_one);
	app.post('/api/v1.1/detail', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionDetailController.create);

	// Inspection Header
	app.post('/api/v1.1/genba', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionGenbaController.create);

	// Inspection Header
	app.get('/api/v1.1/find', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionHeaderController.find);
	app.post('/api/v1.1/header', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionHeaderController.create);
	app.get('/api/v1.1/header/:id', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionHeaderController.find_one);

	// Inspection Tracking
	app.post('/api/v1.1/tracking', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionTrackingController.create);

	// Inspection Report
	app.get('/api/v1.1/report', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.InspectionReportController.find);

	// Summary
	app.post('/api/v1.1/summary', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.SummaryController.inspeksi);
	app.get('/api/v1.1/summary/generate', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.SummaryController.process_weekly);

	// Export
	app.get('/api/v1.1/export/premi/:first_date/:end_date', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportController.premi);
	app.get('/api/v1.1/export/tap-dw/tr-inspection/:first_date/:end_date', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportController.tap_dw_tr_inspection);

	//Export-Kafka
	app.get('/api/v1.1/export-kafka/inspection-detail', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportKafkaController.export_inspection_detail);
	app.get('/api/v1.1/export-kafka/inspection-header', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportKafkaController.export_inspection_header);
	app.get('/api/v1.1/export-kafka/inspection-genba', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportKafkaController.export_inspection_genba);
	app.get('/api/v1.1/export-kafka/inspection-tracking', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportKafkaController.export_inspection_tracking);

	// GET Inspection Header, Detail, Genba, Track By Month
	app.get('/api/v1.1/inspection-month/:month', Middleware.v_1_1.VerifyToken, Controllers.v_1_1.ExportKafkaController.find_by_month);
	/*
	/*
	 |--------------------------------------------------------------------------
	 | Versi 1.0
	 |--------------------------------------------------------------------------
	 */
	// Inspection Detail
	app.get('/api/v1.0/detail/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionDetailController.find_one);
	app.post('/api/v1.0/detail', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionDetailController.create);

	// Inspection Header
	app.post('/api/v1.0/genba', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionGenbaController.create);

	// Inspection Header
	app.get('/api/v1.0/find', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionHeaderController.find);
	app.post('/api/v1.0/header', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionHeaderController.create);
	app.get('/api/v1.0/header/:id', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionHeaderController.find_one);

	// Inspection Tracking
	app.post('/api/v1.0/tracking', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionTrackingController.create);

	// Inspection Report
	app.get('/api/v1.0/report', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.InspectionReportController.find);

	// Summary
	app.post('/api/v1.0/summary', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.SummaryController.inspeksi);
	app.get('/api/v1.0/summary/generate', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.SummaryController.process_weekly);

	// Export
	app.get('/api/v1.0/export/premi/:first_date/:end_date', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.ExportController.premi);
	app.get('/api/v1.0/export/tap-dw/tr-inspection/:first_date/:end_date', Middleware.v_1_0.VerifyToken, Controllers.v_1_0.ExportController.tap_dw_tr_inspection);

	/*
	 |--------------------------------------------------------------------------
	 | Old API
	 |--------------------------------------------------------------------------
	 */
	// Export
	app.get('/export/premi/:first_date/:end_date', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.ExportController.premi
	}));

	// Inspection Detail
	app.get('/inspection-detail/:id', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionDetailController.find_one
	}));

	app.post('/inspection-detail', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionDetailController.create
	}));

	// Inspection Header
	app.get('/inspection-find', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionHeaderController.find
	}));

	app.post('/inspection-header', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionHeaderController.create
	}));

	app.get('/inspection-header/:id', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionHeaderController.find_one
	}));

	// Inspection Tracking
	app.post('/inspection-tracking', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionTrackingController.create
	}));

	// Inspection Report
	app.get('/inspection-report/q', Middleware.v_1_0.VerifyToken, RoutesVersioning({
		"1.0.0": Controllers.v_1_0.InspectionReportController.find
	}));

}