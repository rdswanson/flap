var app = angular.module('flapperNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {

		$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: ['posts', function(posts) {
					posts.getAll();
				}]
			}
		})
		.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl'
		});

		$urlRouterProvider.otherwise('home');
	}]);

	app.factory('posts', ['$http', function($http) {
		var o = {
			posts: []
		};

		o.getAll = function() {
			return $http.get('/posts').success(function(data) {
				angular.copy(data, o.posts);
			});
		};

		o.create = function(post) {
			return $http.post('/posts', post).success(function(data){
				o.posts.push(data);
			});
		};

		return o;
	}]);

	app.controller('MainCtrl', [
		'$scope',
		'posts',
		function($scope, posts) {
			$scope.posts = posts.posts;
			$scope.addPost = function() {
				if (!$scope.title || $scope.title == '') { return; }
				posts.create({
					tilte: $scope.title,
					link: $scope.link
				});
				$scope.title = '';
				$scope.link = '';
			};
			$scope.incrementUpvotes = function(post) {
				post.upvotes += 1;
			};
			$scope.decrementUpvotes = function(post) {
				if (post.upvotes > 0) {post.upvotes -= 1;}
			};
			$scope.removePost = function(post) {
				var index = $scope.posts.indexOf(post);
				$scope.posts.splice(index, 1);
			};
		}]);

		app.controller('PostsCtrl', [
			'$scope',
			'$stateParams',
			'posts',
			function($scope, $stateParams, posts) {
				$scope.post = posts.posts[$stateParams.id];
				$scope.addComment = function() {
					if ($scope.body === '') {return;}
					$scope.post.comments.push({body: $scope.body, author: 'user', upvotes: 0});
					$scope.body = '';
				};
				$scope.incrementUpvotes = function(comment) {
					comment.upvotes += 1;
				}
			}]);
