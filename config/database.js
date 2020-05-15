/*
 |--------------------------------------------------------------------------
 | Database Connections
 |--------------------------------------------------------------------------
 |
 | Here are each of the database connections setup for your application.
 | Of course, examples of configuring each database platform that is
 | supported by NodeJS is shown below to make development simple.
 |
 */
module.exports = {
	inspection: {
		dev: {
			url: 'mongodb://s_inspeksi:s_inspeksi@dbmongodev.tap-agri.com:4848/s_inspeksi?authSource=s_inspeksi',
			ssl: false
		},
		qa: {
			url: 'mongodb://s_inspeksi:1nsp3k5i2019@dbmongoqa.tap-agri.com:4848/s_inspeksi?authSource=s_inspeksi',
			ssl: false
		},
		prod: {
			url: 'mongodb://s_inspeksi:1nsp3k5i2019@dbmongo.tap-agri.com:4848/s_inspeksi?authSource=s_inspeksi',
			ssl: false
		}
	}
}
