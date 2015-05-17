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

function Color(str){
    var r = str.match(/[0-9]+/g);
    if(r===null) r = config.themes.evening.smoozy;
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


Node.prototype._sm_getStyle = function(x){
    return getComputedStyle(this)[x];
};

Node.prototype._sm_hasImage = function(){
    return getComputedStyle(this)["background-image"].match(/url/) !== null;
};

Node.prototype._sm_isWallpaper = function(){
    return getComputedStyle(this)["background-repeat"] !== "no-repeat";
};

Node.prototype._sm_selector = function(){
    classList = Array.prototype.join.call(this.classList,".");
    return [this.tagName.toLowerCase(),(classList === "" ? "" : "."),classList].join("");
};

Node.prototype._sm_hasGradient = function(){
    return getComputedStyle(this)["background-image"].match(/gradient/) !== null;
};


var config =
    {
        themes: 
        {
            evening: {
                bg: "rgb(90,90,90)",
                BG: "none no-repeat scroll 0% 0% rgb(90,90,90)",
                fg: "rgb(190,190,190)",
                link: "rgb(200,200,200)",
                header: "rgb(150,150,150)",
                images: "grayscale(100%)",
                transparent: "transparent",
                smoozy: new Color("rgb(150,150,150)")
            }
        },
        blacklist: {"META":true,"SCRIPT":true,"HEAD":true,"HTML":true}
    }
, theme = config.themes.evening
;

function makeCssRule(x){
    return Object.keys(x).map(function(r){
        return [r,":",x[r]," !important"].join("");
    }).join(";");
}

function smoozify(x){
    if (smoozify.cache === undefined){
        smoozify.cache = {};
    }
    var sel = x._sm_selector();
    if(smoozify.cache[sel] !== undefined){
        return true;
    }else{
        $ = smoozify.cache[sel] = {};
        $1 = smoozify.cache[sel+":before"] = {};
        $2 = smoozify.cache[sel+":after"] = {};
    }
    switch (x.tagName){
    case "A":
        $["background-color"] = "none";
        $["color"] = theme.link;
        $["text-decoration"] = "underline";
        if(x._sm_hasImage()){
            if(x._sm_isWallpaper()){
                $["background-color"] = "none";
            } else {
                $["background-color"] = theme.bg;
                $["filter"] = theme.images;
                $["-webkit-filter"] = theme.images;
            }
        } else {
            if(x.parentNode._sm_hasImage()){
                $["background-color"] = "transparent";
            } else if(x.parentNode._sm_getStyle("width") === x._sm_getStyle("width")){
                $["background-color"] = theme.transparent;
            }else{
                $["background-color"] = theme.transparent;
                // $["background-color"] = config.themes.evening.bg;
            }
        }
        break;
    case "H1":
    case "H2":
    case "H3":
        $["background-color"] = theme.transparent;
        $["color"] = config.themes.evening.header;
        break;
    case "IMG":
        $["filter"] = config.themes.evening.images;
        $["-webkit-filter"] = config.themes.evening.images;
        break;
    case "BODY":
        $["background"] = "none repeat scroll 0% 0% rgb(90,90,90)";
        $["color"] = config.themes.evening.fg;
        break;
    case "SPAN":        
        $["color"] = config.themes.evening.fg;
        if(x._sm_hasImage()){
            if(x._sm_isWallpaper()){
                // $["background"] = "none no-repeat scroll 0% 0% rgb(90,90,90)";
            }else{
                $["filter"] = config.themes.evening.images;
                $["-webkit-filter"] = config.themes.evening.images;
            }
        } else {
            if(x.parentNode._sm_hasImage()){
                $["background-color"] = "transparent";
            } else if(x.parentNode._sm_getStyle("width") === x._sm_getStyle("width")){
                $["background-color"] = theme.transparent;                
            }else{
                // $["background"] = theme.BG;                
                $["background-color"] = config.themes.evening.bg;
            }
        }
        break;
    case "P":
        $["background-color"] = "none";
        $["color"] = config.themes.evening.fg;
        break;
    case "BUTTON":
        $["background-color"] = "red";
        $["color"] = config.themes.evening.fg;
        break;
    case "INPUT":
        $["background-color"] = "purple";
        $["color"] = config.themes.evening.fg;
        break;
    case "I":
        $["background-color"] = "none";
        $["color"] = config.themes.evening.fg;
        break;
    default:
        $["color"] = config.themes.evening.fg;
        // $1["background-color"] = config.themes.evening.bg;
        // $2["background-color"] = config.themes.evening.bg;
        $1["background"] = config.themes.evening.BG;
        $2["background"] = config.themes.evening.BG;
        if(x._sm_hasImage()){
            if(x._sm_isWallpaper()){
                $["background-color"] = "none";//config.themes.evening.bg;
                $["background"] = "none no-repeat scroll 0% 0%";
            } else {                
                $["background-color"] = config.themes.evening.bg;
                $["filter"] = config.themes.evening.images;
                $["-webkit-filter"] = config.themes.evening.images;
            }
        }else{
            // $["background"] = config.themes.evening.BG;            
            if(x._sm_hasGradient()){
                $["background"] = theme.BG;
            }else{
                $["background-color"] = theme.bg;
            }
        }
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

var style = document.createElement("style");
style.appendChild(document.createTextNode(""));
document.head.appendChild(style);

Promise.all(
    Object.keys(smoozify.cache).map(function(x){
        return new Promise(function(resolve,reject){
            try{
                style.sheet.insertRule([x,"{",makeCssRule(smoozify.cache[x]),"}"].join(""),0);
            } catch(err){
                // alert([x,"{",makeCssRule(smoozify.cache[x]),"}"].join(""));
            }
            resolve(true);
        });
    })
).then(function(){
    document.body.removeChild(document.querySelector("#smoozy"));
}).catch(function(err){
    // alert(err);
})
;
