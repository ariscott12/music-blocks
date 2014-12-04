var speed = 5;
var blockSize = 25;
var gridSize = 20;
var gridArray = new Array([]);

function musicBlock(w, h, x, y, s) {
    this.width = w;
    this.height = h;
    this.posX = x;
    this.posY = y;
    this.id = "";
    this.direction = "down";
    //this.orientation = "horizontal";
    this.speed = s;
    this.isMoving = false;
    this.gridX = 0;
    this.gridY = 0;
    this.queued = 1;
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
    var syncounter = -25;


    function animateBlocks() {






        if (syncounter == blockSize) {
            if (cnt !== 0) {
                for (var j = 0; j < objs.length; j++) {
                    gridArray[objs[j].gridX][objs[j].gridY] = -1;
                    if(objs[j].queued == 1 &&  objs[j].speed !== 0) {
                        objs[j].queued = 0;
                        
                    }
                }

                for (var k = 0; k < objs.length; k++) {
                    // gridArray[objs[j].gridX][objs[j].gridY] == -1
                    objs[k].gridX = objs[k].posX / blockSize;
                    objs[k].gridY = objs[k].posY / blockSize;
                    gridArray[objs[k].gridX][objs[k].gridY] = k;



                }

                for (var k = 0; k < objs.length; k++) {
                    // console.log(k);
                    // console.log("gridX: " + objs[k].gridX);
                    // console.log("gridY: " + objs[k].gridY);


                    // console.log("pixelX: " + objs[k].posX);
                    // console.log("pixelY: " + objs[k].posY);
                    // // console.log( objs[k].direction);

                    // console.log(gridArray[objs[k].gridX][objs[k].gridY]);
                    // console.log(gridArray[objs[k].gridX][objs[k].gridY + 1]);

                    if (objs[k].direction == "up" && (objs[k].gridY === 0 || gridArray[objs[k].gridX][objs[k].gridY - 1] !== -1)) {
                        console.log("hit");

                        objs[k].direction = "down";
                    }
                    if (objs[k].direction == "down" && (objs[k].gridY === gridSize - 1 || gridArray[objs[k].gridX][objs[k].gridY + 1] !== -1)) {
                        console.log("hit");
                        objs[k].direction = "up";

                    }
                    console.log(objs[k].direction);

                    //objs[k].speed = 0;

                }
                // console.log(syncounter);
                


            }

            syncounter = 0;
        }
        for (var i = 0; i < objs.length; i++) {
            // console.log("test");
            setStyle(objs[i].id, {

                'top': objs[i].posY + "px"
            });

            // if (objs[i].posY >= 475 || objs[i].posY === 0) {
            //     objs[i].direction = -objs[i].direction;
            // }
            if(objs[i].queued === 0) {
                if (objs[i].direction == "up") {
                    //pconsole.log(objs[i].speed);
                    objs[i].posY += -1 * objs[i].speed;
                }
                if (objs[i].direction == "down") {
                    objs[i].posY += 1 * objs[i].speed;
                }
            }
            //objs[i].posY += objs[i].direction * objs[i].speed;

            // for (var j = 0; j < objs.length; j++) {
            //     if (i !== j) {
            //         if (objs[i].posY === objs[j].posY) {
            //             console.log("test");
            //         }
            //     }
            // }
        }

        syncounter += speed;


        requestAnimationFrame(animateBlocks);
    }
    animateBlocks();



    function setBlockPos(e) {
        var cursorX = e.pageX;
        var cursorY = e.pageY;
        var gridX = Math.floor(cursorX / blockSize);
        var gridY = Math.floor(cursorY / blockSize);


        // alert(cursorY);
        if (gridArray[gridX][gridY] == -1) {
            objs[cnt] = new musicBlock(blockSize, blockSize, Math.ceil((e.pageX - blockSize) / blockSize) * blockSize, Math.ceil((e.pageY - blockSize) / blockSize) * blockSize, 0);
            objs[cnt].initBlock("block" + cnt).makeBlock();
            gridArray[gridX][gridY] = cnt;
            objs[cnt].gridX = gridX;
            objs[cnt].gridY = gridY;
            cnt++;
        } else {
            objs[gridArray[gridX][gridY]].speed = speed;
            // syncounter = 0;

        }

        if (running) {
            running = false;
        }


    }
    section.addEventListener("click", setBlockPos);
}();

var makeGrid = (function() {

    for (var i = 0; i < gridSize; i++) {
        var section = document.getElementById("gridHorizontal");
        var section2 = document.getElementById("gridVertical");
        var node = document.createElement("LI");
        var node2 = document.createElement("LI");
        section.appendChild(node);
        section2.appendChild(node2);
        gridArray.push([]);
        for (var j = 0; j < gridSize; j++) {

            gridArray[i][j] = -1;
        }
    }







})();