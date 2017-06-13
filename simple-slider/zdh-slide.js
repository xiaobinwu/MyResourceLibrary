/*
* 轮播组件（适用于jquery与zepto）
* params:
* container => 轮播容器
* autoplayDisableOnInteraction => 是否自动滑动，默认true
* autoplay =>  每多少秒滚动一次，默认3000
* speed => 滚动速度，默认300
* wrapperClass => 滚动区域容器className
* slideClass => 滑块区域className
* preBtnClass => 向左滚动按钮className
* nextBtnClass => 向右滚动按钮className
* control => 是否需要按钮 
* gestureDistance => 触摸滑动距离，默认50
*/
var SLIDE_TIME;
var defaults = {
	autoplayDisableOnInteraction: true,
	autoplay: 3000,
	speed: 300,
	gestureDistance: 50,
	preBtnClass: 'pre-btn',
	nextBtnClass: 'next-btn',
	wrapperClass: 'zdh-wrapper',
	slideClass: 'zdh-slide',
	control: true
}
//判断是否为移动设备
var isPhone = function(){
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		return true;
	}
	return false;	
}
//判断手势方向
var isGesture = function(s_x, e_x, gestureDistance){
	if(e_x - s_x > gestureDistance){
		return 'right';
	}
	if(s_x - e_x > gestureDistance){
		return 'left';
	}
	return false;
}
var Slider = function(container, options){
	this.options = $.extend({},defaults,options || {});
	if(typeof container === "object"){
		this.$container = container;
	}else{
		this.$container = $(container);
	}
	this.containerWidth = this.$container.width();
	this.$wrapper = this.$container.find('.' + this.options.wrapperClass);
	this.$slide = this.$wrapper.find('.' + this.options.slideClass);
	this.$slide.width(this.containerWidth);
	this.slideLength = this.$slide.length;
	var firstChild = this.$slide.first().clone();
	var lastChild = this.$slide.last().clone();		
	this.$wrapper.append(firstChild);
	this.$wrapper.prepend(lastChild);
	//向上取整，保证容器wrapper宽度大于等于滑块slider宽度总和
	this.wrapperWidth = Math.ceil(this.containerWidth * (this.$slide.length + 2));
	this.currentTarget = 1;
    this.animated = false;
	this.init();
}
Slider.prototype.init = function(){
	this.$wrapper.css({ width: this.wrapperWidth + 'px', marginLeft: -this.containerWidth }); 
	this.createDom();
	this.auto();
	this.bindEvent();
}
Slider.prototype.createDom = function(){
	if(this.options.control){
		var preBtnClass = $('<a href="javascript:void(0);" class="' + this.options.preBtnClass + ' control-btn"><i class="control-icon control-icon-l"></i></a>');
		var nextBtnClass = $('<a href="javascript:void(0);" class="' + this.options.nextBtnClass + ' control-btn"><i class="control-icon control-icon-r"></i></a>');
		this.$container.append(preBtnClass).append(nextBtnClass);
	}
}
Slider.prototype.bindEvent = function(){
	var _self = this,startClintX,endClintX;
	if(isPhone()){
		if(this.options.control){
			$('.' + this.options.preBtnClass).on('tap', function(){
				_self.pre();
			});
			$('.' + this.options.nextBtnClass).on('tap', function(){
				_self.next();
			});	
			this.$container.on('touchstart', function(e){
				e.preventDefault();
				startClintX = e.touches[0].clientX;
				_self.clear();
			});
			this.$container.on('touchend', function(e){
				e.preventDefault();
				endClintX = e.changedTouches[0].clientX;
				var gesture = isGesture(startClintX, endClintX, _self.options.gestureDistance);
				if(gesture && gesture == 'right'){
					_self.pre();
				}else if(gesture && gesture == 'left'){
					_self.next();
				}
				_self.auto();
			});					
		}		
	}else{
		if(this.options.control){
			$('.' + this.options.preBtnClass).on('click', function(e){
				e.preventDefault();
				_self.pre();
			});
			$('.' + this.options.nextBtnClass).on('click', function(e){
				e.preventDefault();
				_self.next();
			});	
			this.$container.on('mouseover', function(e){
				e.preventDefault();
				_self.clear();
			});	
			this.$container.on('mouseout', function(e){
				e.preventDefault();
				_self.auto();
			});										
		}			
	}
}
Slider.prototype.slideAnimate = function(offset){
    if (offset == 0 || this.slideLength == 1) {
        return;
    }
    var _self = this;
	this.animated = true;
    var time = this.options.speed;
    var inteval = 10;
    var speed = offset/(time/inteval);
    var left = parseInt(this.$wrapper.css('margin-left')) + offset;    
	var animateFrame = function(){
		var marginLeft = parseInt(_self.$wrapper.css('margin-left'));
	    if ( (speed > 0 && marginLeft < left) || (speed < 0 && marginLeft > left)) {
	        _self.$wrapper.css('margin-left', (marginLeft + speed));
	        setTimeout(animateFrame, inteval);
	    }
	    else {
	        _self.$wrapper.css('margin-left', left);
	        if(left > -(_self.containerWidth/3)){
	            _self.$wrapper.css('margin-left', (-_self.containerWidth * _self.slideLength));
	        }
	        if(left < (-_self.containerWidth * _self.slideLength)) {
	            _self.$wrapper.css('margin-left', -_self.containerWidth);
	        }
	        _self.animated = false;
	    }	
	}
	animateFrame();
}
Slider.prototype.pre = function(){
    if (this.animated) {
        return;
    }
    if (this.currentTarget == 1) {
        this.currentTarget = this.slideLength;
    }
    else {
        this.currentTarget--;
    }
    this.slideAnimate(this.containerWidth);
}
Slider.prototype.next = function(){
    if (this.animated) {
        return;
    }
    if (this.currentTarget == this.slideLength) {
        this.currentTarget = 1;
    }
    else {
        this.currentTarget++;
    }
    this.slideAnimate(-this.containerWidth);
}
Slider.prototype.auto = function(){
	var _self = this;
	if(this.options.autoplayDisableOnInteraction){
	   	SLIDE_TIME = setInterval(function(){
			_self.next();
		}, this.options.autoplay);
	}
}
Slider.prototype.clear = function(){
	clearInterval(SLIDE_TIME);
}
$.extend($.fn, {
	slider: function(options){
		var _self = $(this),
			params = $.extend({},defaults,options || {}),
			data = _self.data("slider");
		if(!data){
			_self.data("slider",(new Slider(_self,params)));
		}else{
			_self.data("slider").options = params;
			_self.data("slider").init();
		}
	}
});