function allowMenu(Restangular, $state, notification) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            review: "&",
            size: "@",
        },
        link: function(scope, element, attrs) {
            var obj = scope.$parent.datastore._entries; //saves group-related data into variable obj

            scope.review = scope.review();
            scope.type = attrs.type;

            if (scope.review.values['grouprights.allow'] === 1) {
                scope.buttonText = 'Allow';
                scope.buttonClass = 'allowButton';
            }else{
                scope.buttonText = 'Denied';
                scope.buttonClass = 'deniedButton';
            }

            scope.approve = function(method,value) {

                if(!value) value = true
                else value = !value;

                var group_id; //will store the id of the group whose rights are being changed
                for(var i=0; i<Object.keys(obj).length; i++){
                    if(Object.keys(obj)[i].indexOf('Groups_') !== -1) {
                        group_id = obj[Object.keys(obj)[i]]["0"]._identifierValue; //property name and addressing is not constant, search for object named like 'Groups_'
                    }
                }

                var theobj = {};
                theobj.group_id = group_id; // reads the value dynamically from variable set in the loop above, since name of the property can vary
                theobj.api_group_id = scope.review.values.id;
                if(method === 'allow') theobj.allow = value;

                Restangular.one('grouprights').customPUT(theobj)
                    .then(function successCallback(response) {
                        notification.log('Updated successfully', { addnCls: 'humane-flatty-success' });
                        location.reload();
                        }, function errorCallback(response) {
                        notification.log('Could not save changes', { addnCls: 'humane-flatty-error' });
                    });
            }
        },
        template: '<label class="btn btn-default {{buttonClass}}">{{buttonText}}<input type="checkbox" ng-checked="review.values[\'grouprights.allow\'] == 1" ng-click="approve(\'allow\',review.values[\'grouprights.allow\'])" id="default" class="badgebox"><span class="badge">&check;</span></label>'
    };
}

allowMenu.$inject = ['Restangular', '$state', 'notification'];

export default allowMenu;