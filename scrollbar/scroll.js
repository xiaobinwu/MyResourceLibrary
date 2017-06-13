/*
        box => 主体区域
        bar => 滚动条
        rightBox => 滚动区域
        content => 滚动内容
        scrollContent => 内容可视区
     */
    function scroll(opitons){
        this.$box = document.querySelector(opitons.box);
        this.$bar = document.querySelector(opitons.bar);
        this.$rightBox = document.querySelector(opitons.rightBox); 
        this.$contentBox = document.querySelector(opitons.content);
        this.$scrollContent = document.querySelector(opitons.scrollContent); 
        //算滚动快的高度
        this.$bar.style.height=this.$scrollContent.offsetHeight/this.$contentBox.offsetHeight*this.$rightBox.offsetHeight+'px';
        this.initEvent();
    }
    scroll.prototype={
        initEvent: function(){
            var _self = this;
            //添加滚动块拖动的事件
            this.$bar.onmousedown = function(ev){
                var oEvent=ev || event;
                var disY=oEvent.clientY-_self.$bar.offsetTop;
                document.onmousemove=function(ev){
                    var oEvent=ev || event;
                    var t=oEvent.clientY-disY;
                    _self.setTop(t);
                }
                document.onmouseup=function(){
                    document.onmousemove=null;
                    document.onmouseup=null;
                    //关闭鼠标捕获
                    _self.$bar.releaseCapture && _self.$bar.releaseCapture();
                }
                ev.preventDefault();
            }
            this.addWheel(this.$bar, function(bDown){
                var t=_self.$bar.offsetTop;
                if(bDown){
                    t+=10;
                }else{
                    t-=10;
                }
                _self.setTop(t);
            });
        },
        setTop: function(t){
            t<0 && (t=0);
            t>this.$rightBox.offsetHeight-this.$bar.offsetHeight&&(t=this.$rightBox.offsetHeight-this.$bar.offsetHeight);
            this.$bar.style.top=t+'px';
            var scale=t/(this.$rightBox.offsetHeight-this.$bar.offsetHeight);
            this.$contentBox.style.marginTop=-(this.$contentBox.offsetHeight-this.$scrollContent.offsetHeight)*scale+'px';
        },
        addWheel: function(obj, fn){
            function fnWheel(ev){
                var oEvent=ev || event;
                var bDown=false;
                if(oEvent.wheelDelta){
                    if(oEvent.wheelDelta<0){
                        bDown=true;
                    }else{
                        bDown=false;
                    }
                }else{
                    if(oEvent.detail>0){  //ff浏览器
                        bDown=true;
                    }else{
                        bDown=false;
                    }
                }
                fn && fn(bDown);
                oEvent.preventDefault && oEvent.preventDefault();
                return false;
            }
            //ff浏览器滚动事件特殊
            if(window.navigator.userAgent.toLowerCase().indexOf('firefox')!=-1){
                obj.addEventListener('DOMMouseScroll',fnWheel,false);
            }else{
                obj.onmousewheel=fnWheel;
            }
    }
}
