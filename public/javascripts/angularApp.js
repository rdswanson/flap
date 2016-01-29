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
			controller: 'PostsCtrl',
			resolve: {
				postPromise: ['posts', '$stateParams' function(posts, $stateParams) {
					posts.getPost($stateParams.id)
				}]
			}
		});

		$urlRouterProvider.otherwise('home');
	}]);

	app.factory('posts', ['$http', function($http) {
		var o = {
			posts: []
		};

		o.getPost = function(id) {
			return $http.get('/posts' + id).then(function(res) {
				res.data;
			})
		}

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

		o.upvote = function(post) {
			return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
				post.upvotes += 1;
			});
		};

		return o;
	}]);

	app.controller('MainCtrl', [
		'$scope',
		'posts',
		function($scope, posts) {
			$scope.posts = posts.posts;
			$scope.addPost = function(){
				if(!$scope.title || $scope.title === '') { return; }
				posts.create({
					title: $scope.title,
					link: $scope.link,
				});
				$scope.title = '';
				$scope.link = '';
			};
			$scope.incrementUpvotes = function(post) {
				posts.upvote(post);
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
