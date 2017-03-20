var app = angular.module('mainApp', ['ngMaterial', 'ngMessages', 'ngSanitize', 'ngRoute'])

.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "inner-pages/books-template.html",
        controller : "BookCtrl",
        resolve: {
             bookListData: function($http, $q){
                var whenReady = $q.defer();
                var dataURL = 'http://localhost/ateam/scripts/data.json';
                $http.get(dataURL)
                    .success(function (data) {
                        whenReady.resolve(data);
                });
                return whenReady.promise;
             }
            
         }
     })
})


            
.controller('BookCtrl', function ($scope,$mdDialog,  bookListData, $timeout) {
    
/*make 3 version*/
    $scope.allBooks = bookListData; //from Json
    $scope.NewBooks =angular.copy($scope.allBooks); //to ng-repeat
    $scope.lastSaved = angular.copy($scope.NewBooks); //to fetch
    
    
/*Edit book */
    $scope.editBook = function(ev, bookName) {
        
        $mdDialog.saveBook = function(Title, Autuor, Cover, date,  Location){ 
            $scope.Title = Title;
            $scope.Autuor = Autuor;
            $scope.Cover = Cover;
            $scope.myDate = date;
            $scope.bookLocation = Location;
            $scope.saveBook();
        }
        
        $mdDialog.editBooks = $scope.NewBooks;
        $mdDialog.editBookTitle = bookName;
        $mdDialog.show({
          controller: DialogController,
          templateUrl: 'inner-pages/edit-book.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true,
          fullscreen: $scope.customFullscreen 
        })
    };
    
    function DialogController($scope, $mdDialog, $timeout) {
        $scope.Books =  $mdDialog.editBooks;
        $scope.Title = $mdDialog.editBookTitle;
        $scope.saveBtn="Save";
        $scope.cancelBtn = "Cancel"
        for(i=0; i<$scope.Books.length; i++){
            if ($scope.Books[i].Title == $scope.Title){
                $scope.Autuor= $scope.Books[i].Autuor;
                $scope.Cover =  $scope.Books[i].Cover;
                $scope.myDate = new Date($scope.Books[i].Date.Month+","+ $scope.Books[i].Date.Year);
                $scope.BookLocation = i;
            }
            
        }
        
        /*Date dialog*/
        function buildLocaleProvider(formatString) {
            return {
            formatDate: function (date) {
                if (date) return moment(date).format(formatString);
                else return null;
                    },
                    parseDate: function (dateString) {
                        if (dateString) {
                            var m = moment(dateString, formatString, true);
                            return m.isValid() ? m.toDate() : new Date(NaN);
                        }
                        else return null;
                    }
                };
            }

        $scope.dateFields ={ mode: 'month',locale:  buildLocaleProvider("MMM-YYYY")};
        /*end Date dialog*/
        
        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            if(!$scope.Title || !$scope.Autuor || !$scope.Cover){
                $scope.saveError="All fileds are requierd";
                $scope.saveBtn="";
                $scope.cancelBtn="";
                $timeout(function(){
                    $scope.saveError =""
                    $scope.saveBtn="Save";
                    $scope.cancelBtn="Cancel";
                }, 4000)
                
            }
            else{
                $mdDialog.hide();
                $mdDialog.saveBook($scope.Title, $scope.Autuor, $scope.Cover, $scope.myDate, $scope.BookLocation)
            }
        };
  };
    
    
    $scope.monthNames = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
        ];
    $scope.saveBook = function(){
            $scope.NewBooks[$scope.bookLocation].Title = $scope.Title;
            $scope.NewBooks[$scope.bookLocation].Autuor = $scope.Autuor;
            $scope.NewBooks[$scope.bookLocation].Cover = $scope.Cover;
            $scope.NewBooks[$scope.bookLocation].Date.Month = $scope.monthNames[$scope.myDate.getMonth()];
            $scope.NewBooks[$scope.bookLocation].Date.Year = $scope.myDate.getFullYear();
            $scope.lastSaved = angular.copy($scope.NewBooks);
        };
/*End Edit boook */
    
/*remove book*/
    $scope.removeBook = function(ev, bookName) {
        var confirm = $mdDialog.confirm()
              .title('Book Delete')
              .textContent('Please confirm you want to delete the book')
              .targetEvent(ev)
              .ok('OK')
              .cancel('cancel');
        $mdDialog.show(confirm).then(function() {
           for(i=0; i< $scope.NewBooks.length; i++){
               if ($scope.NewBooks[i].Title == bookName){
                   $scope.NewBooks.splice(i, 1);
                   $scope.lastSaved = angular.copy($scope.NewBooks);
               }
           }
         
            
        });
    };
/*end remove book*/
    
/*Toolbar*/
    $scope.sortBy = function(propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
         $scope.propertyName = propertyName;
    };
    $scope.sortBy("Title");
    
    
    $scope.fetch = function(){
         $scope.NewBooks = angular.copy($scope.lastSaved);
    }
    $scope.reset = function(){
        $scope.NewBooks =angular.copy($scope.allBooks);
    }
    
    
    
    $scope.letterLimit = 24;
    $scope.search = function (item) { 
        if ($scope.searchText == undefined) {
            return true; 
        }
        else {
            if (item.Title.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1 ||
                //item.Date.Year.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1 ||
                item.Autuor.toLowerCase().indexOf($scope.searchText.toLowerCase()) != -1) {
                return true; 
            } 
        } return false; 
    } 
    
/*end Toolbar*/
      
  
})



.directive('enterKey', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
})


.directive('fitImage', function($sce) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div ng-bind-html="data"></div>',
    scope: {
      'image': '@'
    },
    link: 
    function(scope, elem, attrs) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
        var canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 152;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        scope.data = $sce.trustAsHtml('<img src="' + canvas.toDataURL('image/jpeg',1) + '">');
        scope.$apply();
      };
      
      scope.$watch('image', function(value) {
        img.src = value;
      });
    }
  };
})

.filter('capitalize', function() {
    return function(input) {
        input = input.replace(/[^\w\s]/gi, '');
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});



