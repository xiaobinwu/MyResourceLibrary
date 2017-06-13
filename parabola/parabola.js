/**
 * js抛物线动画
 * @param  {[object]} origin [起点元素]
 * @param  {[object]} target [目标点元素]
 * @param  {[object]} element [要运动的元素]
 * @param  {[number]} a [抛物线弧度]
 * @param  {[number]} time [动画执行时间]
 * @param  {[function]} callback [抛物线执行完成后回调]
 */

var parabola = function(config){
    var b = 0,
        INTERVAL = 15,
        timer = null,
        x1,y1,x2,y2,originx,originy,diffx,diffy;

    this.config = config || {};
    // 起点
    this.origin = this.config.origin || null;
    // 终点
    this.target = this.config.target || null;
    // 运动的元素
    this.element = this.config.element ? this.config.element.clone() : null;
    // 曲线弧度
    this.a = this.config.a || 0.001;
    // 运动时间(ms)
    this.time = this.config.time || 1000;

    this.init = function(){
        x1 = this.origin.offset().left;
        y1 = this.origin.offset().top;
        x2 = this.target.offset().left;
        y2 = this.target.offset().top;
        originx = x1;
        originy = y1;
        diffx = x2-x1;
        diffy = y2-y1,
        speedx = diffx/this.time;

        // 已知a, 根据抛物线函数 y = a*x*x + b*x + c 将抛物线起点平移到坐标原点[0, 0]，终点随之平移，那么抛物线经过原点[0, 0] 得出c = 0;
        // 终点平移后得出：y2-y1 = a*(x2 - x1)*(x2 - x1) + b*(x2 - x1)
        // 即 diffy = a*diffx*diffx + b*diffx;
        // 可求出常数b的值
        b = (diffy - this.a*diffx*diffx)/diffx;
        this.element.css({
            left: x1,
            top: y1,
            position: 'absolute',
            zIndex: 10000,
            width: this.config.element.width(),
            height: this.config.element.height()
        }).appendTo('body');
        return this;
    }

    this.move = function(){
        var start = new Date().getTime(),
            _this = this;
        timer = setInterval(function(){
            if(new Date().getTime() - start > _this.time){
                clearInterval(timer);
                _this.element.css({
                    left: x2,
                    top: y2,
                    transform: 'scale(0) translateZ(0)',
                    msTransform: 'scale(0) translateZ(0)',
                    mozTransform: 'scale(0) translateZ(0)',
                    webkitTransform: 'scale(0) translateZ(0)'
                })
                typeof _this.config.callback === 'function' && _this.config.callback(_this.element);
                return;
            }
            x = speedx * (new Date().getTime() - start);
            y = _this.a*x*x + b*x;
            var scale = 1- (new Date().getTime() - start)/_this.time,
                deg = (180 * ((new Date().getTime() - start)/_this.time)) + 'deg';
            _this.element.css({
                left: x+originx,
                top: y+originy,
                transform: 'scale('+ scale +') rotate(' + deg + ') translateZ(0)',
                msTransform: 'scale('+ scale +') rotate(' + deg + ') translateZ(0)',
                mozTransform: 'scale('+ scale +') rotate(' + deg + ') translateZ(0)',
                webkitTransform: 'scale('+ scale +') rotate(' + deg + ') translateZ(0)'
            })

        },INTERVAL)
        return this;
    }

    this.init();
}