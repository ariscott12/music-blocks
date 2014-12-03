function musicBlock(w, h, x, y) {
    this.width = w;
    this.height = h;
    this.posX = x;
    this.posY = y;
    this.id = "";
    this.direction = 1;
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
    var id = 0;
    var objs = [];
    var running = true;
    var cnt = 0;

    for (var i = 0; i < 25; i++) {
        objs[i] = [];
    }

    function animateBlocks() {
        for (var i = 0; i < objs.length; i++) {
            if (objs.length !== 0) {
                for (var j = 0; j < objs[i].length; j++) {
                    setStyle(objs[i][j].id, {
                        'top': objs[i][j].posY + "px"
                    });
                    objs[i][j].posY += objs[i][j].direction * objs[i][j].speed;
                }
            }
           


            // if (objs[i].posY >= 475 || objs[i].posY === 0) {
            //     objs[i].direction = -objs[i].direction;
            // }


            // for (var j = 0; j < objs.length; j++) {
            //     if (i !== j) {
            //         if (objs[i].posY === objs[j].posY) {
            //             console.log("test");
            //         }
            //     }
            // }
        }
        requestAnimationFrame(animateBlocks);
    }

    function setBlockPos(e) {

        var cursorX = e.pageX;
        var cursorY = e.pageY;
        var col = Math.floor(cursorX / 25);

        // objs[id] = [];
        cnt = (objs[col].length);

        //console.log(cnt);

        objs[col][cnt] = new musicBlock(25, 25, Math.ceil((e.pageX - 25) / 25) * 25, Math.ceil((e.pageY - 25) / 25) * 25);
        objs[col][cnt].initBlock("block" + id).makeBlock();

        if (running) {
            animateBlocks();
            running = false;
        }
        id++;

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