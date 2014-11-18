function musicBlock (w,h,x,y) {
	this.width = w;
	this.height = h;
	this.posX = x;
	this.posY = y;
	this.id = "";
}

musicBlock.prototype.initBlock = function(el) {
	var section = document.getElementById("main");
	var node=document.createElement("LI");
	node.setAttribute("class", "block");
	section.appendChild(node);
	this.id = el;
	node.setAttribute("id", this.id);
	return this;
	
};

musicBlock.prototype.makeBlock = function() {
	function setStyle( objId, propertyObject )
	{
		 var elem = document.getElementById(objId);
		 for (var property in propertyObject)
		    elem.style[property] = propertyObject[property];
	}
	setStyle(this.id, {'top':this.posY+"px", 'left':this.posX+"px",'width':this.width+"px", 'height':this.height+"px"});
}



var grid = function() {
	var section = document.getElementById("main");
	var cnt = 0;
	section.addEventListener("click", printMousePos);
	
	function printMousePos(e) {
	    var cursorX = e.pageX;
    	var cursorY = e.pageY;
	    var myBlock = new musicBlock(20,20,Math.ceil((e.pageX-25) / 25)*25, Math.ceil((e.pageY-25) / 25)*25);
	    myBlock.initBlock("block"+cnt).makeBlock();
	    cnt++;
	    console.log("X: " + e.pageX + " Y: " + e.pageY);
	}
}();








// var initialize = function() {
// 	var accounts = [];
// 	var randnums = [];
// 	var myArguments = arguments[0];
// 	for (var i = 0; i < 100; i++) {
// 		for (var j = 0; j < 4; j++) {
// 			if(j < 2) {
// 				randnums[j] = Math.floor(Math.random()*myArguments.size);
// 			} else {
// 				randnums[j] = Math.floor(Math.random()*myArguments.position);
// 			}
// 		}
// 		accounts[i] = new musicBlock(randnums[0],randnums[1],randnums[2],randnums[3]);
// 		accounts[i].initBlock("block"+i).makeBlock();
// 	};

// }({"size":25,"position":500});
