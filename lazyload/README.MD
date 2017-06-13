 
 ## jade模版

 ```
 	div.cutline
 	 	ul
 	 	 	li
			    section
					img( src = "xxx", data-thumbsrc="xxx", data-src="xxx" )
```

 ```
     //懒加载
    lazyload.init(".cutline section", {
        url: "data-thumbsrc",
        container: ".cutline ul"
    }); 
 ```

