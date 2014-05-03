angular
  .module('zen.lift.proxy', [])
  .factory('liftProxy', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
    return function (requestData) {
      var random = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 20; i++ )
          text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
      };

      var q = $q.defer();
      var id = random();
      var req = requestData.name+'='+encodeURIComponent(JSON.stringify({id:id, data:requestData.data}));
      var cleanup = $rootScope.$on('lift-ng-future', function(e, response){
        if(id === response.id) {
          responseToQ(response);
        }
      });

      var responseToQ = function(data) {
        if (data.success) {
          if (data.data) {
            q.resolve(data.data);
          }
          else {
            q.resolve();
          }
        } else {
          q.reject(data.msg)
        }
        cleanup();
      };

      var returnQ = function(response) {
        var data = response.data;
        if(!data.future) {
          responseToQ(data)
        }
        return q.promise;
      };

      return $http.post('/ajax_request/' + lift_page + '/', req, {
        headers : {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).then(returnQ);
    };
  }]);