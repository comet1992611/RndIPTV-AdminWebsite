
/**
 * Module dependencies.
 */
var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    dashboardController = require(path.resolve('./modules/mago/server/controllers/dashboard.server.controller'));


module.exports = function(app) {

    /*========== chart ============ */
    app.route('/api/dashboard/chart/salesreport')
        .all(policy.Authenticate)
      .get(dashboardController.chartsgraph1)
      .post(dashboardController.chartsgraph1);

    app.route('/api/dashboard/chart/salesreport_2')
        .all(policy.Authenticate)
        .get(dashboardController.chart_vis_sales)
        .post(dashboardController.chart_vis_sales);

    app.route('/api/dashboard/chart/salesreport2')
        .all(policy.Authenticate)
        .get(dashboardController.chartsgraph2)
        .post(dashboardController.chartsgraph2);

    app.route('/api/dashboard/chart/salespiechart')
        .all(policy.Authenticate)
        .get(dashboardController.salespiechart);

    app.route('/api/dashboard/chart/salesbyproduct')
        .all(policy.Authenticate)
        .get(dashboardController.salesbyproduct);


};
