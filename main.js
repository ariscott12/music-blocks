function musicBlock (w,h,x,y) {
	this.width = w;
	this.height = h;
	this.posX = x;
	this.posY = y;
	this.id = "";
	this.direction= 5;
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


 var currentPos = 5;
// musicBlock.prototype.animateBlock = function() {
// 	currentPos +=5;
// 	console.log(currentPos);

// 	// function setStyle( objId, propertyObject )
// 	// {
// 	// 	 var elem = document.getElementById(objId);
// 	// 	 for (var property in propertyObject)
// 	// 	    elem.style[property] = propertyObject[property];
// 	// }
// 	// setStyle(this.id, {'top':this.posY+currentPos+"px", 'left':this.posX+"px",'width':this.width+"px", 'height':this.height+"px"});
// 	var that = this;
// 	requestAnimationFrame(that.animateBlock()); 
// }


function repeatOften(obj) {
  currentPos +=5;
  requestAnimationFrame(repeatOften);

	

  // console.log(myBlock.posY);
   function setStyle( objId, propertyObject )
	{
		 var elem = document.getElementById(objId);
		 for (var property in propertyObject)
		    elem.style[property] = propertyObject[property];
	}
	for (var i = 0; i < objs.length; i++) {
		
		setStyle(objs[i].id, {'top':objs[i].posY+"px"});
		objs[i].posY += objs[i].direction;

		if(objs[i].posY == 500) {
			objs[i].direction = -5;
		}
		if(objs[i].posY == 0) {
			objs[i].direction = 5;
		}
		
	};
	//setStyle(objs[cnt].id, {'top':objs[cnt].posY+currentPos+"px"});
}



var going = true;

var grid = function() {
	var section = document.getElementById("main");
	var cnt = 0;
	
	objs = [];
	section.addEventListener("click", printMousePos);
	
	function printMousePos(e) {
		console.log(cnt);
	    var cursorX = e.pageX;
    	var cursorY = e.pageY;
	    objs[cnt] = new musicBlock(20,20,Math.ceil((e.pageX-25) / 25)*25, Math.ceil((e.pageY-25) / 25)*25);
	    objs[cnt].initBlock("block"+cnt).makeBlock();
	 	 
	 	 if(going) {
	 		repeatOften();
	 		going = false;
		 }
		 	
	   cnt++;
	    
	
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
