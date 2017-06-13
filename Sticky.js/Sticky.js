window.Sticky = (function(){
	var defaultOptions = {
		nav: document.querySelector('#act-nav'), //nav
		navItem: '.act-nav-item', //nav item className
		navFixedClassName: 'nav-fixed', //nav fixed时的className
		section: '.section', //模块元素
		easing: 'swing', //滚动easing
		diff: 0, //偏移量，有多个fixed元素时使用，不使用stickyDom
		stickyDom: null //单个fixed元素时可使用
	}
	//profill for classList(暂时没使用)
	var classNameOperate = {
		hasClass: function(ele, cName){
			return !!ele.className.match(new RegExp( "(\\s|^)" + cName + "(\\s|$)"));
		},
		addClass: function(ele, cName){
			if(!this.hasClass(ele, cName)){
				ele.className += ' ' + cName;
			}
		},
		removeClass: function(ele, cName){
			if(this.hasClass(ele, cName)){
				ele.className.replace(new RegExp( "(\\s|^)" + cName + "(\\s|$)"), '');
			}
		}
	}
	function getOffset(ele){
		var top = 0, left = 0;
		while(ele){
			top += ele.offsetTop;
			left += ele.offsetLeft;
			ele = ele.offsetParent;
		}
		return{
			top: top,
			left: left
		}
	}
	function getStyle(ele){
		if(ele.currentStyle){
			return ele.currentStyle;
		}else if(document.defaultView.getComputedStyle){
			return document.defaultView.getComputedStyle(ele);
		}else{
			return ele.style;
		}
	}
	function Sticky(options){
		var opts = Object.assign({}, defaultOptions, options);
		this.navOffset = 0; //记录初始偏移值
		this.stickyDomDiff = 0; //吸附元素为fixed时的偏差
		this.$stickyDom = opts.stickyDom; //吸附fixed元素
		this.isTapScroll = false; //点击nav时滚动标志位
		this.$nav = opts.nav;
		this.$navItem = this.$nav.querySelectorAll(opts.navItem);
		this.$section = document.querySelectorAll(opts.section);
		this.navFixedClassName = opts.navFixedClassName;
	}
	Sticky.prototype = {
		init: function(){
			this.setIndex();
			this.bind();
		},
		getScrollPos : function(){
			return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
		},
		navAddClass: function(index){
			for (var i = this.$navItem.length - 1; i >= 0; i--) {
				if(this.$navItem[i].classList.contains('active') || typeof index === 'undefined'){
					this.$navItem[i].classList.remove('active');
				}
			};
            if(typeof index !== 'undefined'){
            	this.$navItem[index].classList.add('active');
            }
		},
		bind: function(){
			var _self = this;
			this.hasStickyDom();
			var sectionsOffset = [];
			var navHeight = this.$nav.offsetHeight;
			for (var i = 0; i < this.$section.length; i++) {
				sectionsOffset.push(getOffset(this.$section[i]).top);
			}
			// console.log(sectionsOffset)
			window.onscroll = function(e){
				var scrollTop = _self.getScrollPos();
				var navTop = getOffset(_self.$nav);
				if(!_self.navOffset){
					_self.navOffset = navTop.top;
				}
				// console.log(scrollTop + ':' + _self.navOffset)
				if(scrollTop > _self.navOffset - _self.stickyDomDiff){
					_self.$nav.classList.add(_self.navFixedClassName);
				}else{
					_self.$nav.classList.remove(_self.navFixedClassName);
				}
				// TODO
				if(!_self.isTapScroll){
					for (var i = 0; i < _self.$section.length; i++) {
						var scrollPos = _self.getScrollPos(),
							diff = navHeight * 2 + _self.stickyDomDiff;
						//scrollTop值为0，移除所有
						if(scrollPos == 0){
							_self.navAddClass();
						}
						//scrollTop在0至i-1个时处理逻辑
						if((sectionsOffset[i] - diff) < scrollPos && scrollPos < (sectionsOffset[i+1] - diff)){
							_self.navAddClass(i);
						}
						//scrollTop在i===_self.$section.length - 1时处理逻辑
						if(sectionsOffset[_self.$section.length - 1] - diff < scrollPos){
							_self.navAddClass(_self.$section.length - 1);
						}
					}
				}
			}
			this.$nav.onclick = function(e){
				var ev = ev || window.event;
                var target = ev.target || ev.srcElement;
                if(target.getAttribute('index')){
					var index = parseInt(target.getAttribute('index'));
					// 第一种方法，定位不是很准确
					//_self.navAddClass(index);
	                // 为了保证nav定位准确，需要减去fixed元素，一般会通过设置主容器padding-top,来为其占位，所以需要减去fixed元素的offset+height，
	                // 以及为了保证nav始终在定位模块的上方，所以也需要减去nav height
     				//	var top = getOffset(_self.$section[index]).top - _self.stickyDomDiff - _self.$nav.offsetHeight,
					// 	b = _self.getScrollPos(),
					// 	c = (top - _self.getScrollPos()),
					// 	d = 15,
					// 	t = 0;
					// _self.isTapScroll = true;
					// _self.animate( t, b, c, d );

					// 第二种方法，引入velocity动画库
					_self.isTapScroll = true;
					Velocity(_self.$section[index], "scroll",  {
						easing: _self.easing,
						offset: (- _self.stickyDomDiff - _self.$nav.offsetHeight) + 'px',
						complete: function(){
							//500毫秒的延时
							setTimeout(function(){ _self.isTapScroll = false;}, 500);
							_self.navAddClass(index);
						}
					});
                }
			}
		},
		//模拟窗口滚动 
		easeOut : function( t, b, c, d ){
			return c*t/d + b;
		},
		animate : function( t, b, c, d ){
			var _self = this;
			var a = Math.ceil( _self.easeOut( t, b, c, d ) );
			window.scrollTo( 0, a );
			if ( t<d ){ 
				t++; 
				setTimeout(function(){ _self.animate( t, b, c, d ); }, 20);
			}else{
				setTimeout(function(){ _self.isTapScroll = false;}, 20);
			}
		},
		setIndex: function(){
			for (var i = 0; i < this.$navItem.length; i++) {
				this.$navItem[i].setAttribute('index', i);
			};
		},
		hasStickyDom: function(){
			this.stickyDomDiff = this.getStickyDomOffset();
			this.$nav.style.top = this.stickyDomDiff + 'px';
		},
		getStickyDomOffset: function(){
			return this.$stickyDom ? getOffset(this.$stickyDom).top + this.$stickyDom.offsetHeight :
				   this.diff !== 0 ? this.diff : 0;
		},
		isNavFixed: function(){
			//有兼容性
			return this.$nav.classList.contains(this.navFixedClassName);
		}

	}
	return{
		init: function(options){
			new Sticky(options).init();
		}
	}
	
})();