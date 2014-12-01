function musicBlock(w, h, x, y) {
    this.width = w;
    this.height = h;
    this.posX = x;
    this.posY = y;
    this.id = "";
    this.direction = 1	;
    this.speed = 5;
}

function setStyle(objId, propertyObject) {
    var elem = document.getElementById(objId);
    for (var property in propertyObject)
        elem.style[property] = propertyObject[property];
}

musicBlock.prototype.initBlock = function(el) {
    var section = document.getElementById("main");
    var node = document.createElement("LI");
    node.setAttribute("class", "block");
    section.appendChild(node);
    this.id = el;
    node.setAttribute("id", this.id);
    return this;
};

musicBlock.prototype.makeBlock = function() {
    setStyle(this.id, {
        'top': this.posY + "px",
        'left': this.posX + "px",
        'width': this.width + "px",
        'height': this.height + "px"
    });
};


var grid = function() {
    var section = document.getElementById("main");
    var cnt = 0;
    var objs = [];
    var running = true;


    function animateBlocks() {
        for (var i = 0; i < objs.length; i++) {
            setStyle(objs[i].id, {
                'top': objs[i].posY + "px"
            });
         
            if (objs[i].posY >= 475 || objs[i].posY === 0 ) {
                objs[i].direction = -objs[i].direction;
            }
            objs[i].posY += objs[i].direction * objs[i].speed;

            for (var j = 0; j < objs.length; j++) {
                if (i !== j) {
                    if (objs[i].posY === objs[j].posY) {
                        console.log("test");
                    }
                }
            }
        }
        requestAnimationFrame(animateBlocks);
    }

    function setBlockPos(e) {
        var cursorX = e.pageX;
        var cursorY = e.pageY;
        objs[cnt] = new musicBlock(25, 25, Math.ceil((e.pageX - 25) / 25) * 25, Math.ceil((e.pageY - 25) / 25) * 25);
        objs[cnt].initBlock("block" + cnt).makeBlock();

        if (running) {
            animateBlocks();
            running = false;
        }
        cnt++;
    }
    section.addEventListener("click", setBlockPos);
}();

var makeGrid = (function() {

    for (var i = 0; i < 20; i++) {
        var section = document.getElementById("gridHorizontal");
        var section2 = document.getElementById("gridVertical");
        var node = document.createElement("LI");
        var node2 = document.createElement("LI");
        section.appendChild(node);
        section2.appendChild(node2);
    }



})();