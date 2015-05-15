// ==UserScript==
// @id             smoozy
// @name           smoozy
// @version        0.0.1
// @namespace      
// @author         Serg Ushakov
// @description    
// @include        *
// @run-at         window-load
// ==/UserScript==

function curry(handler, arity) {
		arity = arity || handler.length;
		var _curry = function(){
			var args = Array.prototype.slice.call(arguments);
			if (args.length == arity) {
				return handler.apply(null, args);
			}
			var inner = function () {
				return _curry.apply(null, args.concat(Array.prototype.slice.call(arguments)));
			};
			return inner;
		};
		return _curry;
}

var config =
    {
        themes: 
        {
            evening: {
                bg: "rgb(90,90,90)",
                fg: "rgb(190,190,190)",
                link: "rgb(200,200,200)",
                header: "rgb(150,150,150)",
                images: "grayscale(100%)"
            }
        },
        blacklist: ["META","SCRIPT","HEAD"]
    }
;

function smoozify(x){
    switch (x.tagName){
    case "A":
        x.style.backgroundColor = config.themes.evening.bg;
        x.style.color = config.themes.evening.link;
        x.style.textDecoration = "underline";
        break;
    case "H1":
    case "H2":
    case "H3":
        x.style.backgroundColor = config.themes.evening.bg;
        x.style.color = config.themes.evening.header;
        break;
    case "IMG":
        x.style["filter"] = config.themes.evening.images;
        x.style["-webkit-filter"] = config.themes.evening.images;
        break;
    case "BODY":
        x.style.backgroundColor = config.themes.evening.bg;
        x.style.color = config.themes.evening.fg;
        break;
    default:
        x.style.backgroundColor = config.themes.evening.bg;
        x.style.color = config.themes.evening.fg;
    }
    
    if(getComputedStyle(x).background.match(/url/) !== null || getComputedStyle(x)["background-image"].match(/url/) !== null){
        if(getComputedStyle(x)["background-repeat"] !== "no-repeat"){
            x.style["background"] = "none";//config.themes.evening.bg;
        }
        x.style["filter"] = config.themes.evening.images;;
        x.style["-webkit-filter"] = config.themes.evening.images;
    }else{
        x.style["background"] = "none";
        // x.style["background-image"] = "none";//config.themes.evening.bg;
        // x.style["background-color"] = "none";//config.themes.evening.bg;
    }
}


Array.prototype.forEach.call(
    document.querySelectorAll("*"),
    function(x){
        if(config.blacklist[x.tagName] === undefined){
            smoozify(x);                        
        }
    }
);
