// ==UserScript==
// @name         Smoozy
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       Me
// @match        http://www.brigitte.de/beauty/schoen/echte-schoenheit-1209401/?utm_source=RUN_ntv&utm_medium=text&utm_campaign=veeseo_RUN
// @grant        none
// ==/UserScript==

function curry(handler, arity) {
		if (handler.curried) {
			return handler;
		}
		arity = arity || handler.length;
		var _curry = function(){
			var args = Array.prototype.slice.call(arguments);
			if (args.length == arity) {
				return handler.apply(null, args);
			}
			var inner = function () {
				return _curry.apply(null, args.concat(Array.prototype.slice.call(arguments)));
			};
			inner.curried = true;
			return inner;
		};
		_curry.curried = true;
		return _curry;
}

var rules =
    {
        default: {
            BODY: { bg: new Color("rgb(90,90,90)"),
                    fg: new Color("rgb(190,190,190)")
                  }
        },
        blacklist: ["META","SCRIPT","HEAD"]
    },
    config = {
    }
;

function Color(str){
    var r = str.match(/[0-9]+/g);    
    this.R = parseFloat(r[0]);
    this.G = parseFloat(r[1]);
    this.B = parseFloat(r[2]);
}

Color.prototype.isSmoozy = function(isDark,x){
    var me = this;
    return ["R","G","B"].filter(function(p){
        return isDark ? me[p] <= x[p] : me[p] >= x[p];
    }).length === 3;
};

Color.prototype.toString = function(){
    return "rgb("+[this.R,this.G,this.B].join(",")+")";
};

Color.prototype.invert = function(){
    this.R = 255-this.R;
    this.G = 255-this.G;
    this.B = 255-this.B;
    return this;
};

function smoozify(x){
    var color = new Color(getComputedStyle(x)["background-color"]);
    if(color === false || color.isSmoozy(true,rules.default.BODY.bg)) return false;
    console.log(x.tagName," is no smoozy");
    x.style.backgroundColor = color.invert().toString();
    // x.setAttribute("style","background-color:"+color.invert().toString()+";opacity:"+opacity);
}


Array.prototype.forEach.call(
    document.querySelectorAll("*"),
    function(x){
        if(rules.blacklist[x.tagName] === undefined){
            smoozify(x);                        
        }else{
            //console.log(x.tagName," is already smoozy");
        }
    }
);
