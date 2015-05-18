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

Node.prototype._sm_eq = function(x){
    return x._sm_getStyle("width") === this._sm_getStyle("width") && x._sm_getStyle("height") === this._sm_getStyle("height");
};

Node.prototype._sm_lt = function(x){
    return parseInt(this._sm_getStyle("width")) < parseInt(x._sm_getStyle("width")) && parseInt(this._sm_getStyle("height")) < parseInt(x._sm_getStyle("height"));
};

Node.prototype._sm_gt = function(x){
    return !this._sm_lt(x);
};

Node.prototype._sm_calculateBgColor = function(){
    var color = this._sm_getStyle("background-color");
    return (color !== theme.bg && color !== theme.transparent) ? theme.bg : color;
};

Node.prototype._sm_hasImageSibling = function(){
    var me = this;
    return Array.prototype.filter.call(this.parentNode.childNodes,function(x){
        return (me !== x && x.tagName === "IMG" && x._sm_eq(me));
    }).length > 0 || Array.prototype.filter.call(this.parentNode.parentNode.childNodes,function(x){
        return (me !== x && x.tagName === "IMG" && x._sm_eq(me));
    }).length > 0;
};

Node.prototype._sm_fixBorder = function(){
    return true;
    // if(this._sm_getStyle("border-width")
};

Node.prototype._sm_overlflowImage = function(){
    var me = this;
    return Array.prototype.filter.call(this.parentNode.childNodes,function(x){
        return (me !== x && x.tagName === "IMG" && x._sm_gt(me));
    }).length > 0 || Array.prototype.filter.call(this.parentNode.parentNode.childNodes,function(x){
        return (me !== x && x.tagName === "IMG" && x._sm_gt(me));
    }).length > 0;
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
                borderColor: "rgb(50,50,50)",
                borderWidth: "2px",
                smoozy: new Color("rgb(150,150,150)")
            }
        },
        blacklist: {"META":true,"SCRIPT":true,"HEAD":true,"HTML":true,"OBJECT":true,"IFRAME":true}
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
        smoozify.cache = {html: {"background-color": theme.bg}};
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
                // $["background-color"] = "none"; // 1
                $["background-color"] = x._sm_calculateBgColor();
            } else {
                // $["background-color"] = theme.bg; // 1
                $["background-color"] = x._sm_calculateBgColor();
                $["filter"] = theme.images;
                $["-webkit-filter"] = theme.images;
            }
        } else {
            // $["background-color"] = x._sm_calculateBgColor();
            $["background-color"] = theme.transparent;
            // if(x.parentNode._sm_hasImage()){
            //     $["background-color"] = "transparent";
            //     // $["background-color"] = x._sm_calculateBgColor();
            // } else if(x.parentNode._sm_getStyle("width") === x._sm_getStyle("width")){
            //     $["background-color"] = theme.transparent;                
            // }else{
            //     $["background-color"] = theme.transparent;
            //     // $["background-color"] = config.themes.evening.bg;
            // }
        }
        break;
    case "H1":
    case "H2":
    case "H3":
        // $["background-color"] = theme.transparent;
        $["background-color"] = x._sm_calculateBgColor();
        $["color"] = theme.header;
        break;
    case "IMG":
        $["filter"] = theme.images;
        $["-webkit-filter"] = theme.images;
        break;
    case "SECTION":
        $1["background"] = config.themes.evening.BG;
        $2["background"] = config.themes.evening.BG;
        $["background"] = "none repeat scroll 0% 0% rgb(90,90,90)";
        break;
    case "BODY":    
        $["background"] = "none repeat scroll 0% 0% rgb(90,90,90)";
        $["color"] = theme.fg;
        break;
    case "SPAN":        
        $["color"] = theme.fg;
        if(x._sm_hasImage()){
            $["filter"] = config.themes.evening.images;
            $["-webkit-filter"] = config.themes.evening.images;
            
            // if(x._sm_isWallpaper()){
            //     // $["background"] = "none no-repeat scroll 0% 0% rgb(90,90,90)";
            // }else{
            //     $["filter"] = config.themes.evening.images;
            //     $["-webkit-filter"] = config.themes.evening.images;
            // }
        } else {
            if(x.parentNode._sm_hasImage()){
                //$["background-color"] = theme.transparent;
                $["background-color"] = x._sm_calculateBgColor();
            } else if(x.parentNode._sm_getStyle("width") === x._sm_getStyle("width")){
                //$["background-color"] = theme.transparent;
                $["background-color"] = x._sm_calculateBgColor();
            }else{
                // $["background"] = theme.BG;                
                $["background-color"] = x._sm_calculateBgColor();
            }
        }
        break;
    // case "SECTION":
    //     $["background-color"] = x._sm_calculateBgColor();
    //     break;
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
        $["background-color"] = x._sm_calculateBgColor();
        $["color"] = theme.fg;
        break;
    case "EM":    
        $["background-color"] = "none";
        $["color"] = config.themes.evening.fg;
        break;
    default:
        $["color"] = config.themes.evening.fg;
        $1["background"] = config.themes.evening.BG;
        $2["background"] = config.themes.evening.BG;
        if(x._sm_hasImage()){
            if(x._sm_isWallpaper()){
                $["background-color"] = x._sm_calculateBgColor();
                // $["background-color"] = theme.transparent;
                $["background"] = "none no-repeat scroll 0% 0%";
            } else {                
                // $["background-color"] = config.themes.evening.bg; //1
                $["background-color"] = x._sm_calculateBgColor();
                $["filter"] = config.themes.evening.images;
                $["-webkit-filter"] = config.themes.evening.images;
            }
        } else if(x._sm_hasImageSibling() || x._sm_overlflowImage() || (x._sm_gt(x.parentNode) && x._sm_getStyle("background-color") === x.parentNode._sm_getStyle("background-color"))){
            //$["background-color"] = theme.transparent;
            $["background-color"] = x._sm_calculateBgColor();
        }else{
            if(x._sm_hasGradient()){
                $["background"] = theme.BG;
            }else{
                $["background-color"] = x._sm_calculateBgColor();
                // $["background-color"] = theme.bg;
            }
        }
    }
    x._sm_fixBorder();
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
