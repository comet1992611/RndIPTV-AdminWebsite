import temp from './support.html';

function support($stateProvider) {

    $stateProvider.state('support', {
        parent: 'main',
        url: '/support',
        controller: ['$http', '$scope', 'notification', function($http, $scope, notification) {
        }],
        template: temp
    });
}

support.$inject = ['$stateProvider'];

export default support;