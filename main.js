var speed = 5;
var blockSize = 25;
var gridSize = 20;
var gridArray = new Array([]);
  var objs = [];

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
    this.selected = false;
    this.active = "#000";
    this.notActive = "#DBA65C"; 
}

// function setStyle(objId, propertyObject) {
//     var elem = document.getElementById(objId);
//     for (var property in propertyObject)
//         elem.style[property] = propertyObject[property];
// }


musicBlock.prototype.setStyle = function(propertyObject) {
    var elem = document.getElementById(this.id);
    for (var property in propertyObject)
        elem.style[property] = propertyObject[property];
};

musicBlock.prototype.createNode = function(el) {
    var section = document.getElementById("main");
    var node = document.createElement("LI");
    node.setAttribute("class", "block");
    section.appendChild(node);
    this.id = el;
    node.setAttribute("id", this.id);
    return this;
};

musicBlock.prototype.addBlock = function() {
    this.setStyle({
        'top': this.posY + "px",
        'left': this.posX + "px",
        'width': this.width + "px",
        'height': this.height + "px"
    });
    //alert(this.width);
};


var grid = function() {
    var section = document.getElementById("main");
    var cnt = 0;
  
    var running = true;
    var syncounter = -25;


    (function startSyncCounter() {
        if (syncounter == blockSize) {
            if (cnt !== 0) {
                for (var j = 0; j < objs.length; j++) {
                    gridArray[objs[j].gridX][objs[j].gridY] = -1;
                    if (objs[j].queued == 1 && objs[j].speed !== 0) {
                        objs[j].queued = 0;

                    }
                }

                for (var k = 0; k < objs.length; k++) {
                    objs[k].gridX = objs[k].posX / blockSize;
                    objs[k].gridY = objs[k].posY / blockSize;
                    gridArray[objs[k].gridX][objs[k].gridY] = k;
                }

                for (var l = 0; l < objs.length; l++) {
                    // console.log(l);
                    // console.log("gridX: " + objs[l].gridX);
                    // console.log("gridY: " + objs[l].gridY);
                    // console.log("pixelX: " + objs[l].posX);
                    // console.log("pixelY: " + objs[l].posY);
                    // console.log( objs[l].direction);
                    // console.log(gridArray[objs[l].gridX][objs[l].gridY]);
                    // console.log(gridArray[objs[l].gridX][objs[l].gridY + 1]);

                    if (objs[l].direction == "up" && (objs[l].gridY === 0 || gridArray[objs[l].gridX][objs[l].gridY - 1] !== -1)) {
                        objs[l].direction = "down";
                    }
                    if (objs[l].direction == "down" && (objs[l].gridY === gridSize - 1 || gridArray[objs[l].gridX][objs[l].gridY + 1] !== -1)) {
                        objs[l].direction = "up";
                    }
                    if (objs[l].direction == "left" && (objs[l].gridX === 0 || gridArray[objs[l].gridX-1][objs[l].gridY] !== -1)) {
                        objs[l].direction = "right";
                    }
                     if (objs[l].direction == "right" && (objs[l].gridX === gridSize - 1 || gridArray[objs[l].gridX+1][objs[l].gridY] !== -1)) {
                        objs[l].direction = "left";
                    }
                   
                    console.log(objs[l].direction);


                }
            }

            syncounter = 0;
        }

        /////MOVE BLOCKS
        for (var i = 0; i < objs.length; i++) {
           
                if (objs[i].direction == "up") {
                    objs[i].setStyle({'top': objs[i].posY + "px"});
                    if (objs[i].queued === 0) {
                        objs[i].posY += -1 * objs[i].speed;
                    }
                }
                if (objs[i].direction == "down") {
                    objs[i].setStyle({'top': objs[i].posY + "px"});
                    if (objs[i].queued === 0) {
                        objs[i].posY += 1 * objs[i].speed;
                    }
                }
                if (objs[i].direction == "left") {
                    objs[i].setStyle({'left': objs[i].posX + "px"});
                    if (objs[i].queued === 0) {
                        objs[i].posX += -1 * objs[i].speed;
                    }
                }
                if (objs[i].direction == "right") {
                    objs[i].setStyle({'left': objs[i].posX + "px"});
                     if (objs[i].queued === 0) {
                        objs[i].posX += 1 * objs[i].speed;
                    }
                }
            
        }

        syncounter += speed;

        requestAnimationFrame(startSyncCounter);
    })();


    function initBlock(e) {
        var cursorX = e.pageX;
        var cursorY = e.pageY;
        var gridX = Math.floor(cursorX / blockSize);
        var gridY = Math.floor(cursorY / blockSize);


        ////ADD A NEW BLOCK TO GRID
        if (gridArray[gridX][gridY] == -1) {
            objs[cnt] = new musicBlock(blockSize, blockSize, Math.ceil((e.pageX - blockSize) / blockSize) * blockSize, Math.ceil((e.pageY - blockSize) / blockSize) * blockSize, 0);
            objs[cnt].createNode("block" + cnt).addBlock();
            gridArray[gridX][gridY] = cnt;
            objs[cnt].gridX = gridX;
            objs[cnt].gridY = gridY;
            cnt++;
        } else {
            //objs[gridArray[gridX][gridY]].speed = speed;
            // for (var i = 0; i < objs.length; i++) {
            //     objs[i].selected = false;
            //     objs[i].setStyle({
            //          'background': objs[i].notActive
            //     });
            // }
            if (objs[gridArray[gridX][gridY]].selected === true) {
                objs[gridArray[gridX][gridY]].selected = false;
                objs[gridArray[gridX][gridY]].setStyle({
                    'background': objs[gridArray[gridX][gridY]].notActive
                });
            } else {
                objs[gridArray[gridX][gridY]].selected = true;
                objs[gridArray[gridX][gridY]].setStyle({
                    'background': objs[gridArray[gridX][gridY]].active
                });
            }
        }
    }
    section.addEventListener("click", initBlock);
}();

var arrowClick = (function() {
    var leftArrow = document.getElementById("left");
    var rightArrow = document.getElementById("right");
    var downArrow = document.getElementById("down");
    var upArrow = document.getElementById("up");
    
    function animateBlock(direction) {
       for (var i = 0; i < objs.length; i++) {
            if(objs[i].selected === true) {
                objs[i].direction = direction;
                objs[i].speed = speed;
            }
             objs[i].selected = false;
                objs[i].setStyle({
                     'background': objs[i].notActive
                });
       }
      
    }

    leftArrow.addEventListener("click", function() {
        animateBlock("left");
    });
    rightArrow.addEventListener("click", function() {
        animateBlock("right");
    });
    upArrow.addEventListener("click", function() {
        animateBlock("up");
    });
    downArrow.addEventListener("click", function() {
        animateBlock("down");
    });




})();



var makeGrid = (function() {

    for (var i = 0; i < gridSize; i++) {
        var section = document.getElementById("gridHorizontal");
        var section2 = document.getElementById("gridVertical");
        var node = document.createElement("LI");
        var node2 = document.createElement("LI");
        section.appendChild(node);
        section2.appendChild(node2);

        ////create empty grid array
        gridArray.push([]);
        for (var j = 0; j < gridSize; j++) {
            gridArray[i][j] = -1;
        }
    }
})();