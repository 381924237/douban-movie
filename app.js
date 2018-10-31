var helpers = {
	isToBottom: function($viewpoint,$content) {
		return $viewpoint.height() + $viewpoint.scrollTop() + 30 > $content.height() ;
	},

	createNode: function(movie) {
		var item = `<div class="item">
									<a href="#">
										<div class="cover">
											<img src="http://img7.doubanio.com/view/photo/s_ratio_poster/public/p480747492.jpg" alt="">
										</div>
										<div class="detail">
											<h2>肖申克的救赎</h2>
												<div class="extra"><span class="score">9.6</span><span>分</span> / <span class="collect">25424</span>收藏</div>
												<div class="extra"><span class="year">1994</span> / <span class="type">犯罪、剧情</span></div>
												<div class="extra">导演：<span class="directors">弗兰克·德拉邦特</span></div>
												<div class="extra">主演：<span class="actors">蒂姆·罗宾斯、摩根·弗里曼、鲍勃·冈顿</span></div>
										</div>
									</a>
								</div>`
		var $node = $(item);
		$node.find('a').attr('href',movie.alt);
		$node.find('.cover img').attr('src',movie.images.small);
		$node.find('.detail h2').text(movie.title);
		$node.find('.detail .score').text(function() {
		return (movie.rating.average === 0) ? '暂无评' : (movie.rating.average);
		});
		$node.find('.detail .collect').text(movie.collect_count);
		$node.find('.detail .year').text(movie.year);
		$node.find('.detail .type').text(movie.genres.join('、'));
		$node.find('.detail .directors').text(movie.directors.map(function(v){return v.name}).join('、'));
		$node.find('.detail .actors').text(function(){
		var actors = [];
		movie.casts.forEach(function(ele){
		actors.push(ele.name);
		});
		return actors.join('、');
		});
		return $node
	}
}



var top250 = {
	init: function() {
		this.$parents = $('#top250');
		this.isLoading = false;
		this.index = 0;
		this.isFinish = false;
		this.bind();
		this.start();
		this.$content = this.$parents.find('.container');
	},	
	bind: function() {
		var _this = this;
		this.$parents.scroll(function(){
			// var clock
			// if(clock) {
			// 	clearTimeout(clock)
			// }
			// clock = setTimeout(function(){
				if(  helpers.isToBottom(_this.$parents, _this.$content) && !_this.isFinish) {
					_this.start();
					console.log(helpers.isToBottom(_this.$parents, _this.$content));
					console.log('to bottom');
				}
			// },100)
		});
	},	
	start: function() {
		var _this = this;
		this.getData(function(data){
			_this.render(data);
		});
	},	
	getData: function(callback) {
		var _this = this;
		if(_this.isLoading) return;
		_this.isLoading = true;
		_this.$parents.find('.loading').show();
		$.ajax({
			url: 'https://api.douban.com/v2/movie/top250',
			type: 'GET',
			data: {
				start: _this.index,
				count: 10
			},
			dataType: 'jsonp'
		}).done(function(ret){
			console.log(ret);
			_this.index += 10;
     if(_this.index >= ret.total) {
		    _this.isFinish = true;    
			}
			_this.$parents.find('.loading').hide();
			_this.isLoading = false;
			callback(ret);
		}).fail(function(){
			console.log('error');
		})
	},
	render: function(data) {
		var _this = this;
		data.subjects.forEach(function(movie) {
			var $node = helpers.createNode(movie);
			_this.$parents.find('.container').append($node);
		});
	},

};



var usBox = {
	init: function() {
		this.$parents = $('#usBox');
		this.start();
	},
	start: function() {
		var _this = this;
		this.getData(function(data){
			_this.render(data);
		});
	},
	getData: function(callback) {
		var _this = this;
		_this.$parents.find('.loading').show();
		$.ajax({
			url: 'https://api.douban.com/v2/movie/us_box',
			type: 'GET',
			dataType: 'jsonp'
		}).done(function(ret){
			console.log(ret);
			callback(ret);
			_this.$parents.find('.loading').hide();
		}).fail(function(){
			console.log('error');
		})
	},	
	render: function(data) {
		var _this = this;
		data.subjects.forEach(function(movie) {
			movie = movie.subject;
			var $node = helpers.createNode(movie);
			_this.$parents.find('.container').append($node);
		});
	}
};



var search = {
	init: function() {
		this.$parents = $('#search');
		this.keyword = '';
		this.bind();
		this.start();
	},
	bind: function() {
		var _this = this;
		this.$parents.find('.button').click(function(){
			_this.keyword = _this.$parents.find('input').val();
			_this.start();
		});
	},
	start: function() {
		var _this = this;
		this.getData(function(data){
			_this.render(data);
		})
	},
	getData: function(callback) {
		var _this = this;
		_this.$parents.find('.loading').show();
		$.ajax({
			url: 'http://api.douban.com/v2/movie/search',
			data: {
				q: _this.keyword
			},
			type: 'GET',
			dataType: 'jsonp'
		}).done(function(ret){
			console.log(ret);
			callback(ret);
		}).fail(function(){
			console.log('error');
		}).always(function(){
			_this.$parents.find('.loading').hide();
		});
	},
	render: function(data) {
		var _this = this;
		data.subjects.forEach(function(movie) {
			var $node = helpers.createNode(movie);
			_this.$parents.find('.container').append($node);
		});
	}
};



var app = {
	init: function() {
		this.$tabs = $('footer>div');
		this.$panels = $('main section');
		this.bind();
		
		top250.init();
		usBox.init();
		search.init();
	},
	bind: function() {
		var _this = this;
		this.$tabs.click(function(){
			$(this).addClass('active').siblings().removeClass('active');
			_this.$panels.eq($(this).index()).fadeIn().siblings().hide();    
		});
	}
};

app.init();
