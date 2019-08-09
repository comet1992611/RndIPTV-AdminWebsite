'use strict';


var path = require('path'),
    policy = require('../policies/mago.server.policy'),
    salesReports = require(path.resolve('./modules/mago/server/controllers/salesreport.server.controller'));

module.exports = function(app) {


    /* ===== salesreports the table ===== */

    app.route('/api/salesreports')
        .all(policy.Authenticate)
        .get(salesReports.list);

    app.route('/api/salesreports')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(salesReports.create);

    app.route('/api/salesreports/:salesReportId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(salesReports.read)
        .put(salesReports.update)
        .delete(salesReports.delete);

    app.route('/api/annul')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(salesReports.annul);

    app.param('salesReportId', salesReports.dataByID);

    //todo: set rights
    app.route('/api/sales_by_product')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(salesReports.sales_by_product);

    /* ===== Salesreport for Resellers ===== */
    app.route('/api/MySales')
        .all(policy.Authenticate)
        .get(salesReports.list);

    app.route('/api/MySales')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .post(salesReports.create);

    app.route('/api/MySales/:MySalesId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(salesReports.read)
        .put(salesReports.update)
        .delete(salesReports.delete);

    app.param('MySalesId', salesReports.dataByID);

    app.route('/api/MySales/annul/:MySalesId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .put(salesReports.annul);

    /* ===== Dashboard ===== */
    app.route('/api/salesreports/annul/:salesReportId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .put(salesReports.annul);

    app.route('/api/sales_by_product')
        .all(policy.Authenticate)
        .get(salesReports.sales_by_product);
    app.route('/api/sales_by_date')
        .all(policy.Authenticate)
        .get(salesReports.sales_by_date);
    app.route('/api/sales_by_month')
        .all(policy.Authenticate)
        .get(salesReports.sales_by_month);
    app.route('/api/sales_monthly_expiration')
        .all(policy.Authenticate)
        .get(salesReports.sales_monthly_expiration);
    app.route('/api/sales_by_expiration')
        .all(policy.Authenticate)
        .get(salesReports.sales_by_expiration);

    app.route('/api/invoice')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(salesReports.invoice);

    app.route('/api/invoice/download/:invoiceID')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(salesReports.download_invoice);

};