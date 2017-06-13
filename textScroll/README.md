```
    var speed = 40;//数值越大，速度越慢
    var demo2 = document.getElementById("demo2");
    var demo1 = document.getElementById("demo1");
    var demo = document.getElementById("demo");
    demo2.innerHTML = demo1.innerHTML;
    demo.scrollTop = demo.scrollHeight;
    function MarqueeUp(){
        if(demo2.offsetTop-demo.scrollTop <= 0)
            demo.scrollTop -= demo2.offsetHeight;
        else{
            demo.scrollTop++;
        }
    }
    var MyMar = setInterval(MarqueeUp,speed);
    demo.onmouseover = function() { clearInterval(MyMar); }
    demo.onmouseout = function() { MyMar=setInterval(MarqueeUp,speed); }
```