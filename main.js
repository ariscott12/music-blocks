var speed = 2;
var blockSize = 26;
var gridSize = 20;
var gridArray = new Array([]);
var objs = [];
var pause = -1;
var advance = -1;
var shiftkey = 0;
var numSelected = 0;
var mode = "create";
var cnt = 0;

function musicBlock(w, h, x, y, s) {
    this.width = w;
    this.height = h;
    this.posX = x;
    this.posY = y;
    this.id = "";
    this.oldDirection = "none";
    this.newDirection = "none";
    this.direction = "none";
    this.speed = s;
    this.isMoving = false;
    this.prevgridX = 0;
    this.prevgridY = 0;
    this.gridX = 0;
    this.gridY = 0;
    this.queued = 1;
    this.selected = false;
    this.active = "#000";
    this.notActive = "#DBA65C";
    this.halfpoint = -1;
    this.snd = new Audio("tiletap.wav");
}

function processCollision(direction, gridX, gridY) {
    if (direction === "up"){
        if (gridY === 0 
            || gridArray[gridX][gridY - 1] !== -1
            || (gridX !== 0 && gridArray[gridX - 1][gridY - 1] !== -1
               && objs[gridArray[gridX - 1][gridY - 1]].oldDirection === "right")
            || (gridX !== gridSize - 1 && gridArray[gridX + 1][gridY - 1] !== -1
               && objs[gridArray[gridX + 1][gridY - 1]].oldDirection === "left"))
                    return "down";                
    }
    else if (direction === "down"){
        if (gridY === gridSize - 1 
            || gridArray[gridX][gridY + 1] !== -1
            || (gridX !== 0 && gridArray[gridX - 1][gridY + 1] !== -1                                    
                && objs[gridArray[gridX - 1][gridY + 1]].oldDirection === "right")
            || (gridX !== gridSize - 1 && gridArray[gridX + 1][gridY + 1] !== -1
                && objs[gridArray[gridX + 1][gridY + 1]].oldDirection === "left"))
                    return "up";
    }
    else if (direction === "left"){
        if (gridX === 0 
            || gridArray[gridX - 1][gridY] !== -1
            || (gridY !== 0 && gridArray[gridX - 1][gridY - 1] !== -1
                && objs[gridArray[gridX - 1][gridY - 1]].oldDirection === "down")
            || (gridY !== gridSize - 1 && gridArray[gridX - 1][gridY + 1] !== -1
                && objs[gridArray[gridX - 1][gridY + 1]].oldDirection === "up"))                            
                    return "right";
    }
    else if (direction === "right"){
        if (gridX === gridSize - 1 
            || gridArray[gridX + 1][gridY] !== -1
            || (gridY !== 0 && gridArray[gridX + 1][gridY - 1] !== -1
                && objs[gridArray[gridX + 1][gridY - 1]].oldDirection === "down")
            || (gridY !== gridSize - 1 && gridArray[gridX + 1][gridY + 1] !== -1
                && objs[gridArray[gridX + 1][gridY + 1]].oldDirection === "up"))
                    return "left";
    }
    return direction;        
}

function updateStyle(blockNum, direction) {
    if(direction === "up" || direction === "down"){
        objs[blockNum].setStyle({
            'top': objs[blockNum].posY + "px"
        });
    }
    else{
        objs[blockNum].setStyle({
            'left': objs[blockNum].posX + "px"
        });
    }
}

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

function removeNode(el) {
    var section = document.getElementById("main");
    var node = document.getElementById(el);
    section.removeChild(node);
    node.remove();
};

musicBlock.prototype.addBlock = function() {
    this.setStyle({
        'top': this.posY + "px",
        'left': this.posX + "px",
        'width': this.width + "px",
        'height': this.height + "px"
    });
};


var grid = function() {
    var section = document.getElementById("main");
    var dragbox;
    var mousedownX = -1;
    var mousedownY = -1;
    var running = true;
    var syncounter = -blockSize;


    (function startSyncCounter() {
        if ((pause === 1 && advance === 1) || pause === -1) {
            if (syncounter == blockSize) {
                if (cnt !== 0) {
                    //update oldDirection, direction and queue flag
                    for (var n = 0; n < objs.length; n++)    {
                        objs[n].oldDirection = objs[n].direction;
                        objs[n].direction = objs[n].newDirection;
                        if (objs[n].oldDirection === "none")
                            objs[n].oldDirection = objs[n].newDirection;
                        if (objs[n].queued == 1)
                           objs[n].queued = 0;
                        if(objs[n].prevgridX !== objs[n].gridX || objs[n].prevgridY !== objs[n].gridY)
                            gridArray[objs[n].prevgridX][objs[n].prevgridY] = -1;                      
                        objs[n].prevgridX = objs[n].gridX;
                        objs[n].prevgridY = objs[n].gridY;
                    }
                    
                    //first collision check
                    for (var l = 0; l < objs.length; l++){
                        var dir = processCollision(objs[l].direction, objs[l].gridX, objs[l].gridY);
                        objs[l].direction = objs[l].newDirection = dir;

                    }

                    //second collision check if object changed direction
                    for (var o = 0; o < objs.length; o++){
                        if(objs[o].oldDirection !== objs[o].direction){
                            objs[o].snd.pause();
                            objs[o].snd.currentTime = 0;
                            objs[o].snd.play();
                            var dir = processCollision(objs[o].direction, objs[o].gridX, objs[o].gridY);
                            if(dir !== objs[o].direction)
                                objs[o].direction = objs[o].newDirection =  "none";   
                                document.getElementById('audiotag').play();                                                                                     
                        }
                    }
                    
                    //mid-square collision detection
                    for (var m = 0; m < objs.length; m++) {
                        if (objs[m].direction == "up" 
                            && objs[m].gridY > 1
                            && gridArray[objs[m].gridX][objs[m].gridY - 1] === -1
                            && gridArray[objs[m].gridX][objs[m].gridY - 2] !== -1
                            && objs[gridArray[objs[m].gridX][objs[m].gridY - 2]].direction === "down") {
                                objs[m].halfpoint = objs[m].posY - (blockSize / 2);
				        }
                        if (objs[m].direction == "down"
                            && objs[m].gridY < gridSize - 2
                            && gridArray[objs[m].gridX][objs[m].gridY + 1] === -1
                            && gridArray[objs[m].gridX][objs[m].gridY + 2] !== -1
                            && objs[gridArray[objs[m].gridX][objs[m].gridY + 2]].direction === "up") {
                                objs[m].halfpoint = objs[m].posY + (blockSize / 2);
                        }
                        if (objs[m].direction == "left" 
                            && objs[m].gridX > 1
                            && gridArray[objs[m].gridX - 1][objs[m].gridY] === -1
                            && gridArray[objs[m].gridX - 2][objs[m].gridY] !== -1
                            && objs[gridArray[objs[m].gridX - 2][objs[m].gridY]].direction === "right") {
                                objs[m].halfpoint = objs[m].posX - (blockSize / 2);
                        }
                        if (objs[m].direction == "right"
                            && objs[m].gridX < gridSize - 2
                            && gridArray[objs[m].gridX + 1][objs[m].gridY] === -1
                            && gridArray[objs[m].gridX + 2][objs[m].gridY] !== -1
                            && objs[gridArray[objs[m].gridX + 2][objs[m].gridY]].direction === "left") {
                                objs[m].halfpoint = objs[m].posX + (blockSize / 2);
                        }
                    }
                }

                syncounter = 0;
            }

            /////MOVE BLOCKS
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].direction == "up") {
                    if (objs[i].queued === 0) {
                        if (objs[i].halfpoint !== -1 && objs[i].halfpoint > objs[i].posY - objs[i].speed) {
                            objs[i].posY = 2 * objs[i].halfpoint + speed - objs[i].posY;
                            objs[i].direction = objs[i].newDirection = "down";
                            objs[i].halfpoint = -1;
                            objs[i].prevgridY = objs[i].gridY;
                            objs[i].snd.pause();
                            objs[i].snd.currentTime = 0;
                            objs[i].snd.play();
                        }
                        else objs[i].posY += -1 * objs[i].speed;
                    }
                }
                else if (objs[i].direction == "down") {
                    if (objs[i].queued === 0) {
                        if (objs[i].halfpoint !== -1 && objs[i].halfpoint < objs[i].posY + objs[i].speed) {
                            objs[i].posY = 2 * objs[i].halfpoint - speed - objs[i].posY;
                            objs[i].direction = objs[i].newDirection = "up";
                            objs[i].halfpoint = -1;
                            objs[i].prevgridY = objs[i].gridY;
                            objs[i].snd.pause();
                            objs[i].snd.currentTime = 0;
                            objs[i].snd.play();
                        }
                        else objs[i].posY += 1 * objs[i].speed;
                    }
                }
                if (objs[i].direction == "left") {
                    if (objs[i].queued === 0) {
                        if (objs[i].halfpoint !== -1 && objs[i].halfpoint > objs[i].posX - objs[i].speed) {
                            objs[i].posX = 2 * objs[i].halfpoint + speed - objs[i].posX;
                            objs[i].direction = objs[i].newDirection = "right";
                            objs[i].halfpoint = -1;
                            objs[i].prevgridX = objs[i].gridX;
                            objs[i].snd.pause();
                            objs[i].snd.currentTime = 0;
                            objs[i].snd.play();
                        }
                        else objs[i].posX += -1 * objs[i].speed;
                    }
                }
                else if (objs[i].direction == "right") {
                    if (objs[i].queued === 0) {
                        if (objs[i].halfpoint !== -1 && objs[i].halfpoint < objs[i].posX + objs[i].speed) {
                            objs[i].posX = 2 * objs[i].halfpoint - speed - objs[i].posX;
                            objs[i].direction = objs[i].newDirection = "left";
                            objs[i].halfpoint = -1;
                            objs[i].prevgridX = objs[i].gridX;
                            objs[i].snd.pause();
                            objs[i].snd.currentTime = 0;
                            objs[i].snd.play();
                        }
                        else objs[i].posX += 1 * objs[i].speed;
                    }
                }
                updateStyle(i, objs[i].direction);
            }

            //After moving, update all block positions
            for (var k = 0; k < objs.length; k++) {
                //calculate new grid positions, floor handles blocks moving left and up
                objs[k].gridX = Math.floor(objs[k].posX / blockSize);
                objs[k].gridY = Math.floor(objs[k].posY / blockSize);

                //if blocks are moving into a new block, move block reference 1 right or down if needed
                if (objs[k].direction === "right" && (objs[k].posX / blockSize) % 1 !== 0)
                    objs[k].gridX++;            
                if (objs[k].direction === "down" && (objs[k].posY / blockSize) % 1 !== 0)
                    objs[k].gridY++;

                gridArray[objs[k].gridX][objs[k].gridY] = k;

                if(syncounter === blockSize - speed && (objs[k].prevgridX !== objs[k].gridX || objs[k].prevgridY !== objs[k].gridY)){
                            //console.log("Block "+k+" : "+objs[k].prevgridX + ", "+objs[k].prevgridY+" xx " + objs[k].gridX + " sync "+syncounter);
                            gridArray[objs[k].prevgridX][objs[k].prevgridY] = -1;                      
                        }
            }
            
            //log checks on block 0
            if(objs.length > 0){
                //console.log(objs[0].gridX % blockSize);
                //console.log("Block 0 direction: "+objs[0].direction+ " posY: "+objs[0].posY+" gridY: "+objs[0].gridY);
                //console.log(objs[0].direction + " , "+objs[0].newDirection);
            }

            syncounter += speed;
            advance = -1;

        }
        requestAnimationFrame(startSyncCounter);
    })();

    function addBlock(gridX,gridY){
        objs[cnt] = new musicBlock(blockSize, blockSize, gridX * blockSize, gridY * blockSize, 0);
        objs[cnt].createNode("block" + cnt).addBlock();
        gridArray[gridX][gridY] = cnt;
        cnt++;
    }

    //Mousedown listener tracks positions and resets selection to 0
    section.addEventListener("mousedown",function(e){
        //var mouselocation = compareMouse(e);
        dragbox = document.createElement("div");
        dragbox.id = "dragbox";
        section.appendChild(dragbox);
        mousedownX = e.pageX;
        mousedownY = e.pageY;


        setStyles({
            'top': mousedownX,
            'left': mousedownY,
            'width': 0,
            'height': 0
        });


        section.addEventListener('mousemove', mousemover, false);
     
        function mousemover(e) {
       
             var mouselocation = compareMouse(e);
             //console.log(mouselocation);
             if(mouselocation == "different") {

            var move_x = e.pageX,
                move_y = e.pageY,
                width  = Math.abs(move_x - mousedownX),
                height = Math.abs(move_y - mousedownY),
                new_x, new_y;
                console.log(width);

            new_x = (move_x < mousedownX) ? (mousedownX - width) : mousedownX;
            new_y = (move_y < mousedownY) ? (mousedownY - height) : mousedownY;

            setStyles({
              'width': width+ "px",
              'height': height+ "px",
              'top': new_y + "px",
              'left': new_x + "px"
            });
            }
        
    }

        section.addEventListener("mouseup",function(e){
              section.removeEventListener("mousemove", mousemover);
        });


       function setStyles(propertyObject) {
        var elem = document.getElementById("dragbox");
        for (var property in propertyObject)
            elem.style[property] = propertyObject[property];
        };


        /*if (shiftkey === 0){
                for(var q = 0; q < objs.length; q++)
                {
                    objs[q].selected = false;
                    objs[q].setStyle({
                        'background': objs[q].notActive
                    });  
                }
            }*/

    },false);

    //Compares mouseup locationw with mousedown, calls old click function if same, drag select if not
    section.addEventListener("mouseup",function(e){
        var mouselocation = compareMouse(e);
        var leftX = Math.min(mousedownX, e.pageX);
        var rightX = Math.max(mousedownX, e.pageX);
        var topY = Math.min(mousedownY, e.pageY);
        var bottomY = Math.max(mousedownY, e.pageY);
        leftX = Math.floor(leftX / blockSize);
        rightX = Math.ceil(rightX / blockSize);
        topY = Math.floor(topY / blockSize);
        bottomY = Math.ceil(bottomY / blockSize);
       
        if (mode === "select"){
            if (mouselocation === "same" 
                && (numSelected === 1 || shiftkey === 1)
                && gridArray[leftX][topY] !== -1 
                && objs[gridArray[leftX][topY]].selected === true){
                numSelected--;   
                objs[gridArray[leftX][topY]].selected = false;
                objs[gridArray[leftX][topY]].setStyle({
                    'background': objs[gridArray[leftX][topY]].notActive
                }); 
            }
            else{
                if (shiftkey === 0)
                {
                    for(var q = 0; q < objs.length; q++)
                    {
                        objs[q].selected = false;
                        objs[q].setStyle({
                            'background': objs[q].notActive
                        });  
                    }
                }
                for (var p = 0; p < objs.length; p++){
                    var gridX = objs[p].gridX;
                    var gridY = objs[p].gridY;
                    if (gridX < rightX 
                        && gridX >= leftX
                        && gridY < bottomY
                        && gridY >= topY){
                            numSelected++;
                            objs[gridArray[gridX][gridY]].selected = true;
                            objs[gridArray[gridX][gridY]].setStyle({
                                'background': objs[gridArray[gridX][gridY]].active
                            });
                    }
                }
            }
        }
        if (mode === "create"){            
            for (var q = leftX; q < rightX; q++){
                for (var r = topY; r < bottomY; r++){
                    if( gridArray[q][r] === -1){
                        addBlock(q,r);
                    }
                }
            }
        }
        
        //remove dragBox;
        section.removeChild(dragbox);
      
        mousedownX = -1;
        mousedownY = -1;
    },false); 

    function compareMouse(e) {
         if(Math.floor(mousedownX / blockSize) === Math.floor(e.pageX / blockSize) 
            && Math.floor(mousedownY / blockSize) === Math.floor(e.pageY / blockSize)) {
            return "same";
        } else {
            return "different";
        }
    }   

    
}();

var advance = (function() {
    var pauseBtn = document.getElementById("pause");
    var advanceBtn = document.getElementById("advance");

    pauseBtn.addEventListener("click", function() {
        pauseBlock();
    });
    advanceBtn.addEventListener("click", function() {
        advanceBlock();
    });

    function pauseBlock() {
        pause = pause * -1;
    }

    function advanceBlock() {
        advance *= -1;
    }

})();

var arrowClick = (function() {
    var leftArrow = document.getElementById("left");
    var rightArrow = document.getElementById("right");
    var downArrow = document.getElementById("down");
    var upArrow = document.getElementById("up");
    var stopArrow = document.getElementById("stop");

    function animateBlock(direction) {
        for (var i = 0; i < objs.length; i++) {
            if (objs[i].selected === true) {
                objs[i].newDirection = direction;
                objs[i].speed = speed;
            }
            /*objs[i].selected = false;
            objs[i].setStyle({
                'background': objs[i].notActive
            });*/
        }

    }

    //Keydown handler for keyboard input
    window.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 16: // Shift
                shiftkey = 1;
            break;

            case 32: // Space
                pause = pause * -1;
            break;

            case 37: // Left
                animateBlock("left");
            break;

            case 38: // Up
                animateBlock("up");
            break;

            case 39: // Right
                animateBlock("right");
            break;

            case 40: // Down
                animateBlock("down");
            break;

            case 46: // Del
                for (var s = 0; s < objs.length; s++){
                    if(objs[s].selected === true){
                        removeNode(objs[s].id);
                        objs.splice(s,1);
                        for (var v = s; v < objs.length;v++){
                            document.getElementById(objs[v].id).setAttribute("id","block"+v);                        
                            objs[v].id = "block"+v;
                        }
                        for (var t = 0; t < gridSize; t++)
                            for (var u = 0; u < gridSize; u++){
                                if (gridArray[t][u] == s)
                                    gridArray[t][u] = -1;
                                if (gridArray[t][u] >= s)
                                    gridArray[t][u]--;
                            }
                        cnt--;
                        s--;  
                    }
                }
            break;

            case 65: // a
                advance *= -1;
            break;

            case 68: // d
            console.log("D");
                var out = "FULL GRID DUMPMONSTER";
                for (var i = 0;i<gridSize; i++){
                    out = out + "\n";
                    for (var j = 0; j<gridSize;j++){
                        if((gridArray[j][i]+"").length === 1)
                            out = out + " ";
                        out = out + gridArray[j][i]+" ";
                    }       
                }
                console.log(out);
            break;

            case 77: // m
                if (mode === "select")
                    mode = "create";
                else
                    mode = "select";
            break;
        }
    }, false);

    //Keyup handler for held key operations
    window.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case 16: //Shift
                shiftkey = 0;
            break;
        }
    }, false);

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
    stopArrow.addEventListener("click", function() {
        animateBlock("none");
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