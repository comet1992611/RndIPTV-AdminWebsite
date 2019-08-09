import temp from './serverStatus.html';

function serverStatus($stateProvider) {

    $stateProvider.state('serverStatus', {
        parent: 'main',
        url: '/serverStatus',
        controller: ['$http', '$scope', 'notification', function($http, $scope, notification) {

            $scope.statusUrl = window.location.protocol+'//'+window.location.hostname+':'+window.location.port+'/status';

        }],
        template: temp
    });
}

serverStatus.$inject = ['$stateProvider'];

export default serverStatus;