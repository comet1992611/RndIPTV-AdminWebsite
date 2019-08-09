function importvodLogs(Restangular, $uibModal, $q, notification, $state,$http) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            post: '&',
            selection: '=',
            type: '@'
        },
        link: function(scope, element, attrs) {

            scope.see_logs_vod = function () {
                var currentFilename = scope.post().values.filename;
                var data = {'filename': currentFilename};

                $http.post('../api/import_vod', data).then(function successCallback(response) {
                    scope.thead = [
                        "File Name",
                        "Status",
                        "Message",
                        "Errors"
                    ];

                    scope.tbody = [
                        currentFilename,
                        response.data.status,
                        response.data.message,
                        response.data.error
                    ];
                }, function errorCallback(response) {
                    notification.log(response.data.error, { addnCls: 'humane-flatty-error' });
                });
            }
        },
        template:
            '<div class="container">'+
            '<div class="row">'+
            '<div class="btn-group inline pull-right">'+
            '<div class="btn btn-small"><a class="btn btn-default btn-md" ng-click="see_logs_vod()"><i class="fa fa-check fa-md"></i>&nbsp;Submit</a></div>'+
            '<div class="btn btn-small"><ma-back-button class="pull-right" label="Cancel"></ma-back-button></div>'+
            '</div>'+
            '</div>'+
            '<hr><br/><br/><br/><br/>'+
            '<div class="row">'+
            '<table class="table">'+
            '<thead>'+
            '<tr>'+
            '<th style="border-bottom:none;">{{thead[0]}}</th>'+
            '<th style="border-bottom:none;">{{thead[1]}}</th>'+
            '<th style="border-bottom:none;">{{thead[2]}}</th>'+
            '<th style="border-bottom:none;">{{thead[3]}}</th>'+
            '</tr>'+
            '</thead>' +
            '<tbody>' +
            '<tr>'+
            '<td style="border:none;">{{tbody[0]}}</td>' +
            '<td style="border:none;">{{tbody[1]}}</td>' +
            '<td style="border:none;">{{tbody[2]}}</td>'+
            '<td style="border:none;">{{tbody[3]}}</td>'+
            '</tr>'+
            '</tbody>'+
            '</table>'+
            '</div>'+
            '</div>'
    };
}

importvodLogs.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state','$http'];

export default importvodLogs;