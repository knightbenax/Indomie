'use strict';

/**
 * @ngdoc function
 * @name oblivionApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the oblivionApp
 */
var app = angular.module("oblivionApp");

/*app.controller('MainCtrl', function ($scope, $http) {

    function createUnknownError(status) {
      return {
        status: status,
        statusText: 'Internal Server Error',
        description: 'No details available'
      };
    }

    $scope.awesomeThings = [];
    $scope.loading = true;

    // Get awesome things list
    $http({method: 'GET', url: '/api/features'}).

      success(function (data) {
        $scope.loading = false;
        $scope.awesomeThings = data;

        // Get description of each thing
        $scope.awesomeThings.forEach(function (thing) {
          thing.loading = true;

          $http({method: 'GET', url: thing.href}).
            success(function (data) {
              thing.loading = false;
              thing.description = data.description;
            }).
            error(function (data, status) {
              thing.loading = false;
              thing.error = data && data.description ? data : createUnknownError(status);
            });
        });
      }).

      error(function (data, status) {
        $scope.loading = false;
        $scope.error = data && data.description ? data : createUnknownError(status);
      });
  });*/

  app.service('MetaService', function() {
       var title = 'Web App';
       var metaDescription = '';
       var metaImage = '';
       return {
          set: function(newTitle, newMetaDescription, newImage) {
              metaImage = newImage;
              metaDescription = newMetaDescription;
              title = newTitle;
          },
          metaTitle: function(){ return title; },
          metaDescription: function() { return metaDescription; },
          metaImage: function() { return metaImage; }
       }
  });

  app.directive('fileModel', ['$parse', function ($parse) {
    return {
    restrict: 'A',
    link: function(scope, element, attrs) {
        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;

        element.bind('change', function(){
            scope.$apply(function(){
                modelSetter(scope, element[0].files[0]);
            });
        });
    }
   };
 }]);


 app.service('fileUpload', ['$http', '$rootScope', function ($http, $rootScope, $location) {

    this.uploadFileToUrl = function(file, uploadUrl, name, reason, x1, y1, x2, y2, width, height){
         var fd = new FormData();
         fd.append('file', file);
         fd.append('name', name);
         fd.append('reason', reason);
         fd.append('x1', x1);
         fd.append('y1', y1);
         fd.append('x2', x2);
         fd.append('y2', y2);
         fd.append('width', width);
         fd.append('height', height);
         $http.post(uploadUrl, fd, {
             transformRequest: angular.identity,
             headers: {'Content-Type': undefined,'Process-Data': false}
         })
         .success(function(data){
           NProgress.done();
           $rootScope.$emit("CallSharePicBoxGlobal", {message: data});
           //window.location = "#/share/" + data;
           //$location.path("/share/" + data);
           console.log("Success" + data);
         })
         .error(function(){
           NProgress.done();
           console.log("Failure");
         });
     }
 }]);

  app.controller('HeadController', ['$scope', '$rootScope', function($scope, $rootScope){

    $scope.getHeaderImage = function(){
      return $location.host() + "/indomie/images/assets/headers/"  + $rootScope.avatarimage;
    };

  }]);

  app.controller('CreateController', ['$scope', '$http', 'fileUpload', '$location', '$rootScope', '$sce', 'MetaService', function($scope, $http, fileUpload, $location, $rootScope, $sce, MetaServic){
    $scope.appflow = "create-message";
    $scope.avatarimage = "";
    $scope.avatardate = "";

    $rootScope.$on("CallSharePicBoxGlobal", function(event, data){
          $scope.parentmethod(data);
    });

    $scope.getNameForDisplay = function(){
        return $sce.trustAsHtml($scope.myName.replace(' ', '<br/>'));
    };

    //$scope.thisCanBeusedInsideNgBindHtml = $sce.trustAsHtml(getNameForDisplay());

    $scope.parentmethod = function(avatarimage) {
        // task
        //$scope.appflow = 'edit-pic';
        $scope.appflow = 'share-pic';

        $scope.avatarimage = avatarimage["message"];
        $rootScope.avatarimage = $location.protocol() + "://" + $location.host() + "/indomie/images/assets/headers/" + avatarimage["message"];
        $rootScope.myName = $scope.myName;
        //$rootScope.metaservice = MetaService;
        //$rootScope.metaservice.set($scope.singleuser[0].Name, $scope.singleuser[0].Reason, location.host + "/api/assets/headers/" + $scope.singleuser[0].Image);
        //console.log(avatarimage["message"]);
        //console.log(avatarimage.message);
        //console.log(avatarimage);
    };

    $scope.changeview=function(toview){
        $scope.appflow = toview;
        console.log(toview);
    };

    $scope.download = function(){

        /*var config = {
            params: {
             user_location: $scope.singleuser[0].Image
            }
        }

       $http.get('api/get_image', config).success(function(data){

         console.log($scope.singleuser);
       });*/

      jQuery.fileDownload('api/get_image?user_location=' + $scope.avatarimage);
    };

    //$scope.modal= new ModalFactory();

    $scope.facescount = -1;
    $scope.start = true;
    $scope.webcam = false;
    $scope.continue = false;

    $scope.pattern = 70;
    $scope.numlevels = 6;
    $scope.edgemethod = 1;
    $scope.edgeamount = 4;
    $scope.brightness = 100;
    $scope.saturation = 150;
    $scope.myName = "";
    $scope.myReason = "";
    $scope.x1 = 0;
    $scope.y1 = 0;
    $scope.x2 = 0;
    $scope.y2 = 0;
    $scope.files = [];

    $scope.imgWidth = 0;
    $scope.imgHeight = 0;

    $scope.continueFirstPart = function(){
      if ($scope.myName == "" || $scope.myReason == ""){
        return true;
      } else {
        return false;
      }
    };

    $scope.checkNoFaceCount = function(){
      if($scope.facescount == 0 && $scope.continue == false){
        return true;
      } else {
        return false;
      }
    };

    $scope.checkSingleFaceCount = function(){
      if($scope.facescount == 1 && $scope.continue == false){
        return true;
      } else {
        return false;
      }
    };

    $scope.checkFaceCount = function(){
      if($scope.facescount > 1 && $scope.continue == false){
        return true;
      } else {
        return false;
      }
    };

    $scope.proceed = function(){
      if($scope.myName!= "" && $scope.myReason != "" && $scope.continue == true){
        return true;
      } else {
        return false;
      }
    };

    $scope.editPicture = function(){
      NProgress.start();
            var data = $.param({
                m_pattern: $scope.pattern,
                m_numlevels: $scope.numlevels,
                m_edgemethod: $scope.edgemethod,
                m_edgeamount: $scope.edgeamount,
                m_brightness: $scope.brightness,
                m_saturation: $scope.saturation,
                m_file: $scope.avatarimage
            });

            var config = {
              headers : {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
            }

      $http.post('api/edit_picture', data, config).success(function(return_data){
        $scope.avatarimage = return_data;
        $scope.avatardate = "?" + Date.now();
        NProgress.done();
        //console.log($scope.singleuser.Name);
      });
    };

    //$http.post('/api/upload', "").success(function(){
      //$scope.reset();
      //$scope.activePath = $location.path('/');
    //});

    $scope.uploadFile = function(){
      NProgress.start();
        var file = $scope.myFile;
        console.log('file is ' );
        console.dir(file);

        var uploadUrl = "api/upload";
        var name = $scope.myName;
        var reason = $scope.myReason;
        var x1 = $scope.x1;
        var y1 = $scope.y1;
        var x2 = $scope.x2;
        var y2 = $scope.y2;
        var width = $scope.imgWidth;
        var height = $scope.imgHeight;
        fileUpload.uploadFileToUrl(file, uploadUrl, name, reason, x1, y1, x2, y2, width, height);
   };
    //$scope.response = JSON.parse(content); // Presumed content is a json string!


    $scope.draw=function(){
      var canvas = document.getElementById("image_canvas");
      var context = canvas.getContext("2d");
      var imageObj = new Image();
      imageObj.onload = function(){
          context.drawImage(imageObj, 10, 10);
          context.font = "40pt Calibri";
          context.fillText("My TEXT!", 20, 20);
      };
      imageObj.src = "images/assets/headers/" + $scope.avatarimage; //"darth-vader.jpg";
     }

    //text wrap function
     $scope.wrapText=function(context, text, x, y, maxWidth, lineHeight) {
         text=text.replace(/\./g, ". ")
         var words = text.split(' ');
         var line = '';
         for(var n = 0; n < words.length; n++) {
           var testLine = line + words[n] + ' ';
           var metrics = context.measureText(testLine);
           var testWidth = metrics.width;
           if(words[n].indexOf('.')>0 || words[n].indexOf(':')>0 ){
             line=line+words[n];
             context.fillText(line, x, y);
             y += lineHeight*2;
             line='';
             continue;

             //console.log(words[n])
         }
           if (testWidth > maxWidth && n > 0) {
             context.fillText(line, x, y);
             line = words[n] + ' ';
             y += lineHeight;

           }
           else {
             line = testLine;
           }
         }
         context.fillText(line, x, y);
     }

    //to save the image
    $scope.saveimg=function(){
         $scope.message=true;
         var c = document.getElementById("image_canvas");
         var img = c.toDataURL("image/jpeg"); //coverts to base64;
         var form_data=parsetoformdata(img); //call this function to parse into form data
         $http.post('server/upload.php',  form_data, { //phpcode to process the image
                     transformRequest: angular.identity,
                     headers: {'Content-Type': undefined}                })
          .then(function(response){

              var url='http://indomie.com/images/'+response.data;

           },
          function(err){  $scope.note_message='error'});
     }

     var parsetoformdata= function(data){
         var form_data = new FormData();
         if(typeof(data)==='object'){
             for ( var key in data ) {
                 form_data.append(key, data[key]);
             }
         }
         else if(data!=''){
             form_data.append('data', data);
         }
         else{form_data.append('data', '');}
         return form_data;
     }

  }]);


  app.controller('VoteController', function($http, $scope, $routeParams){
    $scope.users = [];
    $scope.that = "balls";

    $http.get('api/users').success(function(data){
      $scope.users = data;
    });

    $scope.getUser = function (){
      $scope.userid = $routeParams.userid;
      /*$http({
          url: "api/user",
          method: "GET",
          params: {user_id: $scope.userid}
       });*/
       var config = {
           params: {
            user_id: $scope.userid
           }
       }
      $http.get('api/user', config).success(function(data){
        $scope.singleuser = data;
        //console.log($scope.singleuser.Name);
      });
    };
  });


  app.controller('SingleVoteController', function($http, $scope, $routeParams, $cookies, $cookieStore){
    //$cookieStore.remove("voted");

    $scope.singleuser = [];
    $scope.userid = $routeParams.userid;
    $scope.voted = false;

    var favoriteCookie = $cookieStore.get('voted');
    console.log(favoriteCookie);
    //alert(favoriteCookie);
    //the user has already voted. Don't let them for another hour
    if(favoriteCookie){
      $scope.voted = true;
    }




    $scope.voteUser = function(userid){
      NProgress.start();

      var data = $.param({
                user_id: userid
            });

      var config = {
        headers : {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
        }
      }

      $http.post('api/vote_user', data, config).success(function(data){
        if(data == "success"){
          var now = new Date();
          now.setDate(now.getDate() + 1);
          $scope.voted = true;
          $cookieStore.put('voted', 'yes' , {expires: now});
        }
        NProgress.done();
        //console.log($scope.singleuser.Name);
      });

    };
    /*$http({
        url: "api/user",
        method: "GET",
        params: {user_id: $scope.userid}
     });*/
     var config = {
         params: {
          user_id: $scope.userid
         }
     }

    $http.get('api/user', config).success(function(data){
      $scope.singleuser = data;
      console.log($scope.singleuser);
    });

  });

  app.controller("ShareController", function($scope, $http, $rootScope, $routeParams, MetaService, $location){
    $scope.singleuser = [];
    $scope.userid = $routeParams.userid;

    var config = {
        params: {
         user_id: $scope.userid
        }
    }
   $http.get('api/user', config).success(function(data){
     $scope.singleuser = data;
     $rootScope.metaservice = MetaService;
     $rootScope.metaservice.set($scope.singleuser[0].Name, $scope.singleuser[0].Reason, location.host + "/api/assets/headers/" + $scope.singleuser[0].Image);
     //console.log($scope.singleuser);
   });

   $scope.download = function(){

       /*var config = {
           params: {
            user_location: $scope.singleuser[0].Image
           }
       }

      $http.get('api/get_image', config).success(function(data){

        console.log($scope.singleuser);
      });*/
     jQuery.fileDownload('api/get_image?user_location=' + $scope.singleuser[0].Image);
   };


  });
