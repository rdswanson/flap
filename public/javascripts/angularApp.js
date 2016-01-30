angular.module('flapperNews', ['ui.router'])

.config([
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
						return posts.getAll();
					}]
				}
			})

			.state('posts', {
				url: '/posts/{id}',
				templateUrl: '/posts.html',
				controller: 'PostsCtrl',
				resolve: {
					post: ['$stateParams', 'posts', function($stateParams,posts) {
						return posts.get($stateParams.id);
					}]
				}
			});

		$urlRouterProvider.otherwise('home');
	}
])

// Main controller
.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){

	$scope.posts = posts.posts;
	$scope.addPost = function() {
		if ($scope.title === '') { return; }
		posts.create({
			title: $scope.title,
			link: $scope.link,
		});
		$scope.title = '';
		$scope.link = '';
	};

	$scope.deletePost = function(post) {
		posts.delete(post);
	}

	$scope.incrementUpvotes = function(post) {
		posts.upvote(post);
	};
}])

// Post controller
.controller('PostsCtrl', [
'$scope',
'posts',
'post',
function($scope, posts, post) {
	$scope.post = post;
	$scope.addComment = function() {
		if ($scope.body === '') { return; }
		console.log(post._id);
		posts.addComment(post, {
			body: $scope.body,
			author: 'user',
		}).success(function(comment) {
			debugger;
			$scope.post.comments.push(comment);
		});
		$scope.body = '';
	};
    $scope.incrementUpvotes = function (comment) {
        comment.upvotes += 1;
    };
    $scope.incrementUpvotes = function (comment) {
        posts.upvoteComment(post, comment);
    };
}])

// Angular service
.factory('posts', ['$http', function($http){
	// service body
	var o = {
		posts: []
	};
	// get all posts
	o.getAll = function() {
		return $http.get('/posts').success(function(data) {
			angular.copy(data, o.posts);
		});
	};
	// create new posts
	o.create = function(post) {
		return $http.post('/posts', post).success(function(data) {
			o.posts.push(data);
		});
	};
	// upvote
	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
			post.upvotes += 1;
		});
	};
	// get single post
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res) {
			return res.data;
		});
	};
	// delete single post
	o.delete = function(post) {
		return $http.delete('/posts/' + post._id).success(function(data) {
			angular.copy(data, o.posts);
		});
	}
	// add comment
	o.addComment = function(post, comment) {
		return $http.post('/posts/' + post._id + '/comments', comment);
	};
	// upvote comment
	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
			.success(function(data) {
				comment.upvotes += 1;
			});
	};
	return o;
}])
