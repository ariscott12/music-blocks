
var config = {
   speed:4,
   blockSize:32,
   gridSize:20,
   pause: -1,
   advance: -1,
   shiftkey: 0,
   numSelected: 0,
   mode: "create",
   cnt: 0,
   newblock: -1,
   volume: 60,
   note:5,
   octave:3,
   newblock: -1,
   draggingBlocks: false
};
var elements = {
    section: document.getElementById("stage"),
    node: document.createElement("LI"),
    setnote: document.getElementById("note-slider"),
    setvolume: document.getElementById("setvolume"),
    setinstrument: document.getElementById("setinstrument"),
    noteslider: $("#note-slider"),
    volumeslider: $("#volume-slider"),
    octavespinner: $( "#octave-spinner")
};
var gridArray = new Array([]);
var objs = [];


///Make the grid
var makeGrid = (function() {
    for (var i = 0; i < config.gridSize; i++) {
        var section = document.getElementById("gridHorizontal");
        var section2 = document.getElementById("gridVertical");
        var node = document.createElement("LI");
        var node2 = document.createElement("LI");
        section.appendChild(node);
        section2.appendChild(node2);

        ////create empty grid array
        gridArray.push([]);
        for (var j = 0; j < config.gridSize; j++) {
            gridArray[i][j] = -1;
        }
    }
})();

//Gridify translates an amount of pixels to an amount of blocks
function gridify(pixels){
    return Math.floor(pixels / config.blockSize);
}

//////MUSIC BLOCK OBJECT AND PROTOTYPE FUNCTIONS//////
function musicBlock(w, h, x, y, s) {
    this.width = w;
    this.height = h;
    this.posX = x;
    this.posY = y;
    this.id = "";
    this.blocknum = 0;
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
    //this.snd = new Audio("tiletap.wav");
    this.snd = null;
    this.note = 41;
    this.octave = 3;
    this.velocity = 100;
    this.delay = 0;
    this.volume = 60;
    this.program = 0;
    this.waiting = false;
    this.numCollisions = 0;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
}

musicBlock.prototype.setStyle = function(propertyObject) {
    var elem = document.getElementById(this.id);
    for (var property in propertyObject)
        elem.style[property] = propertyObject[property];
};

musicBlock.prototype.createNode = function(el) {
    var node = document.createElement("LI");
    node.setAttribute("class", "block");
    elements.section.appendChild(node);
    this.id = "block" + el;
    this.blocknum = el;
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
     console.log(this.blocknum);
};

musicBlock.prototype.removeNode = function() {
    var node = document.getElementById(this.id);
    elements.section.removeChild(node);
    node.remove();
};

musicBlock.prototype.selectBlock = function() {
    //ONLY SELECT A BLOCK IF IT IS NOT SELECTED
    if(this.selected !== true && config.newblock !== this.blocknum){
        this.selected = true;
        this.setStyle({
            'background': this.active
        });
        config.numSelected++;
    }
};

musicBlock.prototype.deselectBlock = function() {
   //Only deselect block if it is already selected
    if(this.selected === true) {
        this.selected = false;
        this.setStyle({
            'background': this.notActive
        });
        config.numSelected--;
    }
};
musicBlock.prototype.removeBlock = function() {
    this.removeNode();
    objs.splice(this.blocknum,1);
    for (var v = this.blocknum; v < objs.length; v++){
        document.getElementById(objs[v].id).setAttribute("id","block"+v);
        objs[v].id = "block"+v;
        objs[v].blocknum = v;
    }
    for (var t = 0; t < config.gridSize; t++) {
        for (var u = 0; u < config.gridSize; u++){
            if (gridArray[t][u] == this.blocknum)
                gridArray[t][u] = -1;
            if (gridArray[t][u] >= this.blocknum)
                gridArray[t][u]--;
        }
    }
    config.cnt--;
};
musicBlock.prototype.selectNewSingle = function() {
    for (var i = 0; i < objs.length; i++){
        objs[i].deselectBlock();
    }
    this.selectBlock();
    if(this.selected === true) {
        //setMidiBlock(this.blocknum);
        controlPanel.setToBlock(this.blocknum);
    }
   
};

musicBlock.prototype.updatePosition = function() {
     //if(this.direction === "up" || this.direction === "down"){
        this.setStyle({
            'top': this.posY + "px",
            'left': this.posX + "px"
        });
    /*}
    else{
        this.setStyle({
            'left': this.posX + "px"
        });
    }*/

};
musicBlock.prototype.playmidi = function() {
    var delay = 0; // play one note every quarter second
    var note = this.note;
    var velocity = this.velocity;
    var volume = this.volume;

    MIDI.setVolume(0, volume);
    MIDI.noteOn(this.program, note, velocity, delay);
    MIDI.noteOff(this.program, note, delay + 1);
};





function processCollision(direction, gridX, gridY, blockref) {
    if (direction === "up"){
        if (gridY === 0
            || gridArray[gridX][gridY - 1] !== -1
            || (gridX !== 0 && gridArray[gridX - 1][gridY - 1] !== -1
                && objs[gridArray[gridX - 1][gridY - 1]].waiting === false
                && objs[gridArray[gridX - 1][gridY - 1]].oldDirection === "right")
            || (gridX !== config.gridSize - 1 && gridArray[gridX + 1][gridY - 1] !== -1
                && objs[gridArray[gridX + 1][gridY - 1]].waiting === false
                && objs[gridArray[gridX + 1][gridY - 1]].oldDirection === "left")) {
                    objs[blockref].numCollisions++;
                    return "down";                
            }
    }
    else if (direction === "down"){
        if (gridY === config.gridSize - 1 
            || gridArray[gridX][gridY + 1] !== -1
            || (gridX !== 0 && gridArray[gridX - 1][gridY + 1] !== -1
                && objs[gridArray[gridX - 1][gridY + 1]].waiting === false
                && objs[gridArray[gridX - 1][gridY + 1]].oldDirection === "right")
            || (gridX !== config.gridSize - 1 && gridArray[gridX + 1][gridY + 1] !== -1
                && objs[gridArray[gridX + 1][gridY + 1]].waiting === false
                && objs[gridArray[gridX + 1][gridY + 1]].oldDirection === "left")){
                    objs[blockref].numCollisions++;
                    return "up";
                }
    }
    else if (direction === "left"){
        if (gridX === 0 
            || gridArray[gridX - 1][gridY] !== -1
            || (gridY !== 0 && gridArray[gridX - 1][gridY - 1] !== -1
                && objs[gridArray[gridX - 1][gridY - 1]].waiting === false
                && objs[gridArray[gridX - 1][gridY - 1]].oldDirection === "down")
            || (gridY !== config.gridSize - 1 && gridArray[gridX - 1][gridY + 1] !== -1
                && objs[gridArray[gridX - 1][gridY + 1]].waiting === false
                && objs[gridArray[gridX - 1][gridY + 1]].oldDirection === "up")){    
                    objs[blockref].numCollisions++;                   
                    return "right";
            }
    }
    else if (direction === "right"){
        if (gridX === config.gridSize - 1 
            || gridArray[gridX + 1][gridY] !== -1
            || (gridY !== 0 && gridArray[gridX + 1][gridY - 1] !== -1
                && objs[gridArray[gridX + 1][gridY - 1]].waiting === false
                && objs[gridArray[gridX + 1][gridY - 1]].oldDirection === "down")
            || (gridY !== config.gridSize - 1 && gridArray[gridX + 1][gridY + 1] !== -1
                && objs[gridArray[gridX + 1][gridY + 1]].waiting === false
                && objs[gridArray[gridX + 1][gridY + 1]].oldDirection === "up")){
                    objs[blockref].numCollisions++;
                    return "left";
            }
    }
    return direction;        
}





var startSyncCounter = function() {
    var running = true;
    var syncounter = -config.blockSize;

    (function syncCounter() {
        if ((config.pause === 1 && config.advance === 1) || config.pause === -1) {
            if (syncounter == config.blockSize) {
                if (config.cnt !== 0) {
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
                        var dir = processCollision(objs[l].direction, objs[l].gridX, objs[l].gridY, l);
                        objs[l].direction = objs[l].newDirection = dir; 
                    }

                    //Update oldDirection for second collision
                    for (var l = 0; l < objs.length; l++){
                        objs[l].oldDirection = objs[l].direction;
                    }

                    //second collision check if object changed direction
                    for (var o = 0; o < objs.length; o++){                    
                        var dir = processCollision(objs[o].direction, objs[o].gridX, objs[o].gridY, o);
                        objs[o].direction = dir;    
                        
                        //Check if block was moving and had a collision
                        if(objs[o].numCollisions >= 1 && objs[o].waiting === false){
                            objs[o].playmidi();                                                         
                        }

                        objs[o].waiting = false;

                        //If block collided twice, wait
                        if(objs[o].numCollisions >= 2){
                            objs[o].waiting = true;
                        }

                        //reset numcollisions
                        objs[o].numCollisions = 0;
                    }
                    
                    //mid-square collision detection
                    for (var m = 0; m < objs.length; m++) {
                        if (objs[m].direction == "up" 
                            && objs[m].waiting === false
                            && objs[m].gridY > 1
                            && gridArray[objs[m].gridX][objs[m].gridY - 1] === -1
                            && gridArray[objs[m].gridX][objs[m].gridY - 2] !== -1
                            && objs[gridArray[objs[m].gridX][objs[m].gridY - 2]].waiting === false
                            && objs[gridArray[objs[m].gridX][objs[m].gridY - 2]].direction === "down") {
                                objs[m].halfpoint = objs[m].posY - (config.blockSize / 2);
                        }
                        if (objs[m].direction == "down"
                            && objs[m].waiting === false
                            && objs[m].gridY < config.gridSize - 2
                            && gridArray[objs[m].gridX][objs[m].gridY + 1] === -1
                            && gridArray[objs[m].gridX][objs[m].gridY + 2] !== -1
                            && objs[gridArray[objs[m].gridX][objs[m].gridY + 2]].waiting === false
                            && objs[gridArray[objs[m].gridX][objs[m].gridY + 2]].direction === "up") {
                                objs[m].halfpoint = objs[m].posY + (config.blockSize / 2);
                        }
                        if (objs[m].direction == "left" 
                            && objs[m].waiting === false
                            && objs[m].gridX > 1
                            && gridArray[objs[m].gridX - 1][objs[m].gridY] === -1
                            && gridArray[objs[m].gridX - 2][objs[m].gridY] !== -1
                            && objs[gridArray[objs[m].gridX - 2][objs[m].gridY]].waiting === false
                            && objs[gridArray[objs[m].gridX - 2][objs[m].gridY]].direction === "right") {
                                objs[m].halfpoint = objs[m].posX - (config.blockSize / 2);
                        }
                        if (objs[m].direction == "right"
                            && objs[m].waiting === false
                            && objs[m].gridX < config.gridSize - 2
                            && gridArray[objs[m].gridX + 1][objs[m].gridY] === -1
                            && gridArray[objs[m].gridX + 2][objs[m].gridY] !== -1
                            && objs[gridArray[objs[m].gridX + 2][objs[m].gridY]].waiting === false
                            && objs[gridArray[objs[m].gridX + 2][objs[m].gridY]].direction === "left") {
                                objs[m].halfpoint = objs[m].posX + (config.blockSize / 2);
                        }
                    }
                }
                syncounter = 0;
            }

            /////set block direction play note on collision
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].waiting === false){
                    if (objs[i].direction == "up") {
                        if (objs[i].queued === 0) {
                            if (objs[i].halfpoint !== -1 && objs[i].halfpoint > objs[i].posY - objs[i].speed) {
                                objs[i].posY = 2 * objs[i].halfpoint +config.speed - objs[i].posY;
                                objs[i].direction = objs[i].newDirection = "down";
                                objs[i].halfpoint = -1;
                                objs[i].prevgridY = objs[i].gridY;
                                objs[i].playmidi();   
                                
                            }
                            else objs[i].posY += -1 * objs[i].speed;
                        }
                    }
                    else if (objs[i].direction == "down") {
                        if (objs[i].queued === 0) {
                            if (objs[i].halfpoint !== -1 && objs[i].halfpoint < objs[i].posY + objs[i].speed) {
                                objs[i].posY = 2 * objs[i].halfpoint -config.speed - objs[i].posY;
                                objs[i].direction = objs[i].newDirection = "up";
                                objs[i].halfpoint = -1;
                                objs[i].prevgridY = objs[i].gridY;
                                objs[i].playmidi();   
                                
                            }
                            else objs[i].posY += 1 * objs[i].speed;
                        }
                    }
                    if (objs[i].direction == "left") {
                        if (objs[i].queued === 0) {
                            if (objs[i].halfpoint !== -1 && objs[i].halfpoint > objs[i].posX - objs[i].speed) {
                                objs[i].posX = 2 * objs[i].halfpoint +config.speed - objs[i].posX;
                                objs[i].direction = objs[i].newDirection = "right";
                                objs[i].halfpoint = -1;
                                objs[i].prevgridX = objs[i].gridX;
                                objs[i].playmidi();    
                                
                            }
                            else objs[i].posX += -1 * objs[i].speed;
                        }
                    }
                    else if (objs[i].direction == "right") {
                        if (objs[i].queued === 0) {
                            if (objs[i].halfpoint !== -1 && objs[i].halfpoint < objs[i].posX + objs[i].speed) {
                                objs[i].posX = 2 * objs[i].halfpoint -config.speed - objs[i].posX;
                                objs[i].direction = objs[i].newDirection = "left";
                                objs[i].halfpoint = -1;
                                objs[i].prevgridX = objs[i].gridX;
                                objs[i].playmidi();    
                                
                            }
                            else objs[i].posX += 1 * objs[i].speed;
                        }
                    }
                    objs[i].updatePosition();
                }
            }

            //After moving, update all block positions
            for (var k = 0; k < objs.length; k++) {
                //calculate new grid positions, floor handles blocks moving left and up
                objs[k].gridX = gridify(objs[k].posX);
                objs[k].gridY = gridify(objs[k].posY);

                //if blocks are moving into a new block, move block reference 1 right or down if needed
                if (objs[k].direction === "right" && (objs[k].posX / config.blockSize) % 1 !== 0)
                    objs[k].gridX++;            
                if (objs[k].direction === "down" && (objs[k].posY / config.blockSize) % 1 !== 0)
                    objs[k].gridY++;

                gridArray[objs[k].gridX][objs[k].gridY] = k;

                if(syncounter === config.blockSize -config.speed && (objs[k].prevgridX !== objs[k].gridX || objs[k].prevgridY !== objs[k].gridY)) {
                    gridArray[objs[k].prevgridX][objs[k].prevgridY] = -1;                      
                }
            }
            
            syncounter +=config.speed;
            config.advance = -1;

        }
        requestAnimationFrame(syncCounter);
    })();  
}();





////////SET MIDI PARAMETERS ON MUSIC BLOCKS
var setMidiParams = (function() {
  
    //LOAD MIDI SOUNDFONTS
    window.onload = function () {
        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instruments: [ "acoustic_grand_piano", "steel_drums", "tinkle_bell" ],
            callback: function() {
                MIDI.programChange(0, 0);
                MIDI.programChange(1, 114);
                MIDI.programChange(2, 112);
                console.log("loaded");
            }
        });
    };
    return {
        selectNote: function(note) {
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].selected === true) {
                    if(note == "default") {
                        objs[i].note = (12*objs[i].octave);
                    } else {
                        objs[i].note = note+(12*objs[i].octave);
                    }
                 console.log(objs[i].note);
                }
            }
            return this;
        },
        selectOctave: function(octave) {
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].selected === true) {
                    objs[i].octave = octave;
                }
            }
           // selectNote("default");
            return this;
        },
        selectVolume: function(volume) {
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].selected === true) {
                    objs[i].volume = volume;
                }
            }
            return this;
        },
        selectInstrument: function(program) {
             for (var i = 0; i < objs.length; i++) {
                if (objs[i].selected === true) {
                    objs[i].program = program;
                }
            }
            return this;
        },
        getNote:function(val) {
            var noteArray = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
            return noteArray[val];
        }
    }   
})();

var controlPanel = (function() {
    return {
        setDefault: function() {
            elements.noteslider.slider( "value", config.note );
            elements.noteslider.find("input").val(setMidiParams.getNote(config.note));
            elements.volumeslider.slider( "value", config.volume);
            elements.volumeslider.find("input").val(config.volume);
            elements.octavespinner.val(config.octave);



        },
        setToBlock: function(num) {
            elements.noteslider.slider( "value", objs[num].note % 12);
            elements.noteslider.find("input").val(setMidiParams.getNote(objs[num].note % 12));
            elements.volumeslider.slider( "value", objs[num].volume );
            elements.volumeslider.find("input").val(objs[num].volume);
            elements.octavespinner.val(objs[num].octave);
        }
    }
   
})();



var setMouseEvents = (function() {
    var mousedownX = -1;
    var mousedownY = -1;
    var blockDragLeftX = config.gridSize, 
        blockDragLeftY = config.gridSize, 
        blockDragWidth = 0,
        blockDragHeight = 0,
        blockDragOffsetX = 0,
        blockDragOffsetY = 0;

    var gridCheck = false;
   

    resetBlockDrag();

    function resetBlockDrag(){
        blockDragLeftX = config.blockSize;
        blockDragLeftY = config.blockSize;
        blockDragRightX = 0;
        blockDragRightY = 0; 
    }

    function setStyles(propertyObject) {
        var elem = document.getElementById("dragbox");
        for (var property in propertyObject){
            elem.style[property] = propertyObject[property];
        }
    };

    function compareMouse(e) {
         if(gridify(mousedownX) === gridify(e.pageX) 
            && gridify(mousedownY) === gridify(e.pageY)) {
            return "same";
        } else {
            return "different";
        }
    }; 

    function mousedrag(e) {
        e = e || window.event;
        mouselocation = compareMouse(e);
        if(mouselocation == "different") {
            var mousedowngridX = gridify(mousedownX);
            var mousedowngridY = gridify(mousedownY);            

            if(gridArray[mousedowngridX][mousedowngridY] != -1 
                && objs[gridArray[mousedowngridX][mousedowngridY]].selected === true
                && config.draggingBlocks === false){
                config.draggingBlocks = true;
                config.pause = 1;
                var blockDragRightX = 0, blockDragRightY = 0;
                //Set the bounds of the blocks being dragged
                for (var i = 0; i < objs.length;i++){
                    if(objs[i].selected === true){
                        blockDragLeftX = Math.min(blockDragLeftX, objs[i].gridX);
                        blockDragLeftY = Math.min(blockDragLeftY, objs[i].gridY);
                        blockDragRightX = Math.max(blockDragRightX, objs[i].gridX);
                        blockDragRightY = Math.max(blockDragRightY, objs[i].gridY);
                    }
                }
                blockDragWidth = blockDragRightX - blockDragLeftX;
                blockDragHeight = blockDragRightY - blockDragLeftY;
                blockDragOffsetX = gridify(mousedownX) - blockDragLeftX;
                blockDragOffsetY = gridify(mousedownY) - blockDragLeftY;

                //Set each block's drag offset from the drag corner
                for (var i = 0; i < objs.length;i++){
                    if(objs[i].selected === true){
                        objs[i].dragOffsetX = objs[i].gridX - blockDragLeftX;
                        objs[i].dragOffsetY = objs[i].gridY - blockDragLeftY;
                        objs[i].direction = "none";
                    }
                }
            }

            if(config.draggingBlocks === true){
                //Check for new blockDrag positions being outside the grid
                var gridpos = gridify(e.pageX)-blockDragOffsetX;
                if(gridpos + blockDragWidth < config.gridSize
                    && gridpos >= 0){
                    blockDragLeftX = gridpos;
                }

                gridpos = gridify(e.pageY) - blockDragOffsetY;
                if(gridpos + blockDragHeight < config.gridSize
                    && gridpos >= 0){
                    blockDragLeftY = gridpos;
                }

                var validMove = true;
                
                //Check all blocks if their new position conflicts with existing blocks
                for (var i = 0; i < objs.length;i++){
                    if (objs[i].selected === true 
                        && gridArray[blockDragLeftX+objs[i].dragOffsetX][blockDragLeftY+objs[i].dragOffsetY] !== -1
                        && objs[gridArray[blockDragLeftX+objs[i].dragOffsetX][blockDragLeftY+objs[i].dragOffsetY]].selected === false){
                        validMove = false;
                    }
                }

                //Update block positions based on the drag block
                if(validMove === true){
                    for (var i = 0; i < objs.length;i++){
                        if(objs[i].selected === true){
                            //Update gridArray to remove block from previous locations
                            gridArray[objs[i].prevgridX][objs[i].prevgridY] = -1
                            gridArray[objs[i].gridX][objs[i].gridY] = -1

                            //set the new position
                            objs[i].gridX = objs[i].prevGridX = objs[i].dragOffsetX + blockDragLeftX;
                            objs[i].gridY = objs[i].prevGridY = objs[i].dragOffsetY + blockDragLeftY;
                            objs[i].posX = objs[i].gridX * config.blockSize;
                            objs[i].posY = objs[i].gridY * config.blockSize;

                            //Update the new gridArray location
                            gridArray[objs[i].gridX][objs[i].gridY] = i;
                            objs[i].updatePosition();
                        }
                    }
                }
            }

            if(config.draggingBlocks === false){
                if(config.mode == "create"){
                    var gridX = gridify(e.pageX);
                    var gridY = gridify(e.pageY);
                    
                    ///Add music block to the grid
                    addBlock(gridX,gridY);
                }
                else {
                    var move_x = e.pageX,
                        move_y = e.pageY,
                        width  = Math.abs(move_x - mousedownX),
                        height = Math.abs(move_y - mousedownY),
                        new_x, new_y;

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
        }            
    }

    // Compares mouseup location with mousedown, calls old click function if same, drag select if not
    function mouseUp(e) {

        if (gridCheck == true) {
            if (config.mode === "select"){
                elements.section.removeChild(dragbox);
            }

            if(config.draggingBlocks === true){
                config.draggingBlocks = false;
                config.pause = -1;
                blockDragLeftX = config.gridSize;
                blockDragLeftY = config.gridSize;
                blockDragWidth = 0;
                blockDragHeight = 0;
            }

            else{
                var leftX = Math.min(mousedownX, e.pageX);
                var rightX = Math.max(mousedownX, e.pageX);
                var topY = Math.min(mousedownY, e.pageY);
                var bottomY = Math.max(mousedownY, e.pageY);

                leftX = gridify(leftX);
                rightX = Math.ceil(rightX / config.blockSize);
                topY = gridify(topY);
                bottomY = Math.ceil(bottomY / config.blockSize);        

                var blockref = gridArray[leftX][topY];
                e = e || window.event;

                mouselocation = compareMouse(e);

                //Check mouse click for single click
                if (mouselocation === "same"){
                    //Check if block exists
                    if (blockref != -1){
                        //Check if block is not selected
                        if (objs[blockref].selected === false){
                            //Check if shift is off
                            if(config.shiftkey === 0){
                                objs[blockref].selectNewSingle();
                            }
                            //Shift is on
                            else {
                                objs[blockref].selectBlock();
                            }
                        }
                        //Block is selected
                        else {
                            //Check for multiple blocks selected
                            if(config.numSelected > 1 && config.shiftkey === 0) {
                                objs[blockref].selectNewSingle();
                            }
                            //Block is only one selected or shift is pressed
                            else {
                                objs[blockref].deselectBlock();
                            }
                        }
                    }
                    //Clicked square is empty
                    else if (config.mode === "create"){
                        addBlock(leftX,topY);
                    }
                }

                //Mouse button was dragged to other squares
                else {
                    //Handle select mode
                    if (config.mode === "select") {                  
                        //Check for shift key off
                        if (config.shiftkey === 0) {
                            //If shift is off, deselect all blocks currently selected
                            for(var q = 0; q < objs.length; q++) {
                                objs[q].deselectBlock(); 
                            }
                        }
                    
                        //Select all blocks in the dragbox
                        var cnt = 0;
                        for (var p = 0; p < objs.length; p++) {
                            var gridX = objs[p].gridX;
                            var gridY = objs[p].gridY;
                          
                            if (gridX < rightX 
                                && gridX >= leftX
                                && gridY < bottomY
                                && gridY >= topY) {
                                
                                objs[p].selectBlock();
                                var t = p;
                                cnt++;
                           
                               
                            }
                        } 
                        if(cnt === 1) {
                            controlPanel.setToBlock(t);  
                        } else {
                            controlPanel.setDefault();  
                        }
                    }
                }  
            }

            config.newblock = -1;
            mousedownX = -1;
            mousedownY = -1;

            gridCheck = false;

            //Remove drag event on mouseup
            elements.section.removeEventListener("mousemove", mousedrag);
        }
    }

    //Add mousedown listener, tracks positions and resets selection to 0
    function mouseDown(e) {

        var mouselocation = compareMouse(e);
        var dragbox;
        e = e || window.event;

        gridCheck = true;
        
        if(config.mode === "select"){
            dragbox = document.createElement("div");
            dragbox.id = "dragbox";
            dragbox.setAttribute('draggable', true);
            elements.section.appendChild(dragbox);
            setStyles({
                'top': mousedownX,
                'left': mousedownY,
                'width': 0,
                'height': 0
            });
        }
        mousedownX = Math.min(e.pageX, config.blockSize * config.gridSize);
        mousedownY = Math.min(e.pageY, config.blockSize * config.gridSize);
      //  console.log(e.pageX);

        if(config.mode === "create"){
            addBlock(gridify(mousedownX),gridify(mousedownY));
        }

        //Add drag event on mousedown
        elements.section.addEventListener('mousemove', mousedrag, false);
    }
    
    function addBlock(gridX,gridY){
        if (gridArray[gridX][gridY] === -1){

            objs[config.cnt] = new musicBlock(config.blockSize, config.blockSize, gridX * config.blockSize, gridY * config.blockSize, 0);
            objs[config.cnt].createNode(config.cnt).addBlock();
            gridArray[gridX][gridY] = config.cnt;
            config.newblock = config.cnt;
            config.cnt++;

            //Reset Control Panel
            controlPanel.setDefault();  
        }

    }

    ////Add event listerners to window and grid
    window.addEventListener("mouseup",mouseUp,false);
    elements.section.addEventListener("mousedown",mouseDown,false);


    ///UI PANEL
    elements.noteslider.slider({
        value:5,
        min: 0,
        max: 11,
        step: 1,
        range: "min",
        slide: function( event, ui ) {
            elements.noteslider.find("input").val(setMidiParams.getNote(ui.value));
            setMidiParams.selectNote(ui.value);
        }
    });
    elements.noteslider.find("input").val(setMidiParams.getNote(elements.noteslider.slider("value")));

    elements.volumeslider.slider({
        value:60,
        min: 0,
        max: 120,
        range: "min",
        slide: function( event, ui ) {
            elements.volumeslider.find("input").val(ui.value);
            setMidiParams.selectVolume(ui.value);
        }
    });
    elements.volumeslider.find("input").val(elements.volumeslider.slider("value"));

    elements.octavespinner.spinner({
           min: 1,
           max: 7,
           start: 3
    });
    $( ".ui-spinner-button" ).click(function() {
        var value = elements.octavespinner.spinner( "value");  
        setMidiParams.selectOctave(value).selectNote("default");
    });
    elements.octavespinner.val(3);

    
})();




var advance = (function() {

    var pauseBtn = document.getElementById("pause");
    var advanceBtn = document.getElementById("advance");
    var clearBtn = document.getElementById("clearall");
    var selectAllBtn = document.getElementById("selectall");

    pauseBtn.addEventListener("click", function() {
        pauseBlock();
    });
    advanceBtn.addEventListener("click", function() {
        advanceBlock();
    });
    clearBtn.addEventListener("click", function() {
        for (var i = 0; i<objs.length; i++){
            objs[i].removeBlock();
            i--;
        }
    });
    selectAllBtn.addEventListener("click", function() {
        for (var i = 0; i<objs.length;i++){
            console.log(i);
            objs[i].selectBlock();
        }
    });

    function pauseBlock() {
        config.pause = config.pause * -1;
    }

    function advanceBlock() {
        config.advance *= -1;
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
                objs[i].speed =config.speed;
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
                config.shiftkey = 1;
            break;

            case 32: // Space
                config.pause = config.pause * -1;
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

            case 49: // 1
                for (var s = 0; s < objs.length; s++){
                    if(objs[s].selected === true){
                        objs[s].removeBlock();
                        s--;  
                    }
                }
            break;

            case 65: // a
                config.advance *= -1;
            break;

            case 68: // d
            console.log("D");
                var out = "FULL GRID DUMPMONSTER";
                for (var i = 0;i<config.gridSize; i++){
                    out = out + "\n";
                    for (var j = 0; j<config.gridSize;j++){
                        if((gridArray[j][i]+"").length === 1)
                            out = out + " ";
                        out = out + gridArray[j][i]+" ";
                    }       
                }
                console.log(out);
            break;

            case 77: // m
                if (config.mode === "select")
                    config.mode = "create";
                else
                    config.mode = "select";
            break;
        }
    }, false);

    //Keyup handler for held key operations
    window.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case 16: //Shift
                config.shiftkey = 0;
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



