var
    config = {
        newBlockType: "",
        randomVolumeType: "rnd-vol-block",
        randomOctaveType: "rnd-octave-block",
        randomNoteType: "rnd-note-block",
        musicBlockType: "block",
        defaultVolumeMin: 30,
        defaultVolumeMax: 70,
        defaultOctaveMin: 3,
        defaultOctaveMax: 5,
        defaultNoteMin: 0,
        defaultNoteMax: 11,
        speed: 4,
        blockSize: 32,
        gridSize: 20,
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        minGridX: 0,
        minGridY: 0,
        maxGridX: 0,
        maxGridY: 0,
        pause: -1,
        advance: -1,
        shiftkey: 0,
        numSelected: 0,
        mode: "create",
        cnt: 0,
        volume: 60,
        velocity: 60,
        duration: 30,
        note: 5,
        octave: 3,
        newblock: -1,
        draggingBlocks: false,
        colorArray: ["#d27743", "#cf5a4c", "#debe4e", "#ccc"]
    },
    elements = {
        section: document.getElementById("stage")
    },
    gridArray = new Array([]),
    blocks = [];

config.maxX = config.maxY = config.blockSize * config.gridSize;
config.maxGridX = config.maxGridY = config.gridSize - 1;
config.newBlockType = config.musicBlockType;

///Make the grid
(function makeGrid() {
    var size = config.gridSize,
        section,
        section2,
        node,
        node2,
        gridH,
        gridV;

    for (var i = 0; i < size; i++) {
        gridH = document.getElementById("gridHorizontal");
        gridV = document.getElementById("gridVertical");
        node = document.createElement("LI");
        node2 = document.createElement("LI");
        gridH.appendChild(node);
        gridV.appendChild(node2);

        ////create empty grid array
        gridArray.push([]);
        for (var j = 0; j < size; j++) {
            gridArray[i][j] = -1;
        }
    }
})();

//////MUSIC BLOCK OBJECT AND PROTOTYPE FUNCTIONS//////
var proto = {
    id: "",
    blocknum: 0,
    oldDirection: "none",
    newDirection: "none",
    direction: "none",
    staticDirection: "none",
    isMoving: "false",
    queued: 1,
    selected: false,
    active: "#000",
    halfpoint: -1,
    snd: null,
    note: config.note,
    octave: config.octave,
    volume: config.volume,
    duration: config.duration,
    veloctiy: config.veloctiy,
    program: 0,
    waiting: "false",
    numCollisions: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    rngMin: 0,
    rngMax: 0,

    setStyle: function(propertyObject) {
        var elem = document.getElementById(this.id);
        for (var property in propertyObject)
            elem.style[property] = propertyObject[property];
    },
    createNode: function(el, type) {
        var node = document.createElement("LI");
        // var direction = elements.selectDirection.children('.active').attr("id");
        //var blockclass = type + " " + direction;
        var blockclass = type;

        node.setAttribute("class", blockclass);
        elements.section.appendChild(node);
        this.id = type + el;
        this.blocknum = el;
        node.setAttribute("id", this.id);
        return this;
    },
    addBlock: function() {
        //var direction = elements.selectDirection.children('.active').attr("id");
        this.setStyle({
            'top': this.posY + "px",
            'left': this.posX + "px",
            'width': this.width + "px",
            'height': this.height + "px",
            'background': config.colorArray[this.program]
        });
        this.notActive = config.colorArray[this.program];
        //this.staticDirection = direction;
    },
    removeNode: function() {
        var node = document.getElementById(this.id);
        elements.section.removeChild(node);
        node.remove();
    },
    selectBlock: function() {
        //ONLY SELECT A BLOCK IF IT IS NOT SELECTED
        if (this.selected !== true && config.newblock !== this.blocknum) {
            this.selected = true;
            this.setStyle({
                'background': this.active
            });
            config.numSelected++;
        }
    },
    deselectBlock: function() {
        //Only deselect block if it is already selected
        if (this.selected === true) {
            this.selected = false;
            this.setStyle({
                'background': this.notActive
            });
            config.numSelected--;
        }
    },
    convertBlock: function(type) {
        var elem = document.getElementById(this.id);
        this.type = type;
        elem.setAttribute("class", type);
    },
    removeBlock: function() {
        this.removeNode();
        blocks.splice(this.blocknum, 1);
        for (var v = this.blocknum; v < blocks.length; v++) {
            document.getElementById(blocks[v].id).setAttribute("id", config.musicBlockType + v);
            blocks[v].id = config.musicBlockType + v;
            blocks[v].blocknum = v;
        }
        for (var t = 0; t < config.gridSize; t++) {
            for (var u = 0; u < config.gridSize; u++) {
                if (gridArray[t][u] == this.blocknum)
                    gridArray[t][u] = -1;
                if (gridArray[t][u] >= this.blocknum)
                    gridArray[t][u]--;
            }
        }
        config.cnt--;
        config.numSelected--;
    },
    selectNewSingle: function() {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].deselectBlock();
        }
        this.selectBlock();
        if (this.selected === true) {
            //setMidiBlock(this.blocknum);
            controlPanel.setToBlock(this.blocknum);
        }

    },
    updatePosition: function() {
        this.setStyle({
            'top': this.posY + "px",
            'left': this.posX + "px"
        });
    },
    playmidi: function() {
        if (this.type === config.musicBlockType) {
            var duration = this.duration / 120,
                note = this.note + 12 * this.octave;

            setMidiParams.triggerMidi(this.volume, this.program, note, this.velocity, duration);
        }
    },
    setInitValues: function(el) {
        this.volume = el.volume;
        this.note = el.note;
        this.duration = el.duration;
        this.velocity = el.velocity;
        this.octave = el.octave;
        this.program = el.instrument;
        this.staticDirection = el.direction;

    },
    setMidiValues: function(type, value) {
        switch (type) {
            case "volume":
                this.volume = value;
                break;
            case "octave":
                this.octave = value;
                break;
            case "duration":
                this.duration = value;
                break;
            case "velocity":
                this.velocity = value;
                break;
            case "note":
                this.note = value;
                break;
            case "instrument":
                this.program = value;
                break;
            case "direction":
                this.staticDirection = value;
                break;
            default:
                this.volume = value;
                break;
        }
    }

};

var makeBlock = function(w, h, x, y, s, t) {
    var block = Object.create(proto);
    block.width = w;
    block.height = h;
    block.posX = x;
    block.posY = y;
    block.speed = s;
    block.type = t;
    block.gridX = gridify(block.posX);
    block.gridY = gridify(block.posY);
    block.prevgridX = block.gridX;
    block.prevgridY = block.gridY;
    block.notActive = getBlockColor(block.type);

    return block;
};




function musicBlock(w, h, x, y, s, t) {
    // this.width = w;
    // this.height = h;
    // this.posX = x;
    // this.posY = y;
    // this.id = "";
    // this.blocknum = 0;
    // this.oldDirection = "none";
    // this.newDirection = "none";
    // this.direction = "none";
    // this.staticDirection = "none";
    // this.speed = s;
    // this.isMoving = false;
    // this.gridX = gridify(this.posX);
    // this.gridY = gridify(this.posY);
    // this.prevgridX = this.gridX;
    // this.prevgridY = this.gridY;
    // this.queued = 1;
    // this.selected = false;
    // this.type = t;
    // this.active = "#000";
    // this.notActive = getBlockColor(this.type);
    // this.halfpoint = -1;
    // this.snd = null;
    // this.note = 0;
    // this.octave = 5;
    // this.delay = 0;
    // this.volume = config.volume;
    // this.duration = config.duration;
    // this.velocity = 60;
    // this.program = 0;
    // this.waiting = false;
    // this.numCollisions = 0;
    // this.dragOffsetX = 0;
    // this.dragOffsetY = 0;
    // this.rngMin = 0;
    // this.rngMax = 0;
}

// musicBlock.prototype.setStyle = function(propertyObject) {
//     var elem = document.getElementById(this.id);
//     for (var property in propertyObject)
//         elem.style[property] = propertyObject[property];
// };

// musicBlock.prototype.createNode = function(el, type) {
//     var node = document.createElement("LI");
//     // var direction = elements.selectDirection.children('.active').attr("id");
//     //var blockclass = type + " " + direction;
//     var blockclass = type;

//     node.setAttribute("class", blockclass);
//     elements.section.appendChild(node);
//     this.id = type + el;
//     this.blocknum = el;
//     node.setAttribute("id", this.id);
//     return this;
// };

// musicBlock.prototype.addBlock = function() {
//     //var direction = elements.selectDirection.children('.active').attr("id");
//     this.setStyle({
//         'top': this.posY + "px",
//         'left': this.posX + "px",
//         'width': this.width + "px",
//         'height': this.height + "px",
//         'background': config.colorArray[this.program]
//     });
//     this.notActive = config.colorArray[this.program];
//     //this.staticDirection = direction;

// };

// musicBlock.prototype.removeNode = function() {
//     var node = document.getElementById(this.id);
//     elements.section.removeChild(node);
//     node.remove();
// };

// musicBlock.prototype.selectBlock = function() {
//     //ONLY SELECT A BLOCK IF IT IS NOT SELECTED
//     if (this.selected !== true && config.newblock !== this.blocknum) {
//         this.selected = true;
//         this.setStyle({
//             'background': this.active
//         });
//         config.numSelected++;
//     }
// };

// musicBlock.prototype.deselectBlock = function() {
//     //Only deselect block if it is already selected
//     if (this.selected === true) {
//         this.selected = false;
//         this.setStyle({
//             'background': this.notActive
//         });
//         config.numSelected--;
//     }
// };

// musicBlock.prototype.convertBlock = function(type) {
//     this.type = type;
//     var elem = document.getElementById(this.id);
//     elem.setAttribute("class", type);
// };

// musicBlock.prototype.removeBlock = function() {
//     this.removeNode();
//     blocks.splice(this.blocknum, 1);
//     for (var v = this.blocknum; v < blocks.length; v++) {
//         document.getElementById(blocks[v].id).setAttribute("id", config.musicBlockType + v);
//         blocks[v].id = config.musicBlockType + v;
//         blocks[v].blocknum = v;
//     }
//     for (var t = 0; t < config.gridSize; t++) {
//         for (var u = 0; u < config.gridSize; u++) {
//             if (gridArray[t][u] == this.blocknum)
//                 gridArray[t][u] = -1;
//             if (gridArray[t][u] >= this.blocknum)
//                 gridArray[t][u]--;
//         }
//     }
//     config.cnt--;
//     config.numSelected--;
// };
// musicBlock.prototype.selectNewSingle = function() {
//     for (var i = 0; i < blocks.length; i++) {
//         blocks[i].deselectBlock();
//     }
//     this.selectBlock();
//     if (this.selected === true) {
//         //setMidiBlock(this.blocknum);
//         controlPanel.setToBlock(this.blocknum);
//     }

// };
// musicBlock.prototype.updatePosition = function() {
//     this.setStyle({
//         'top': this.posY + "px",
//         'left': this.posX + "px"
//     });
// };
// musicBlock.prototype.playmidi = function() {
//     if (this.type === config.musicBlockType) {
//         var duration = this.duration / 120;
//         var note = this.note + 12 * this.octave;
//         var velocity = this.velocity;
//         var volume = this.volume;

//         MIDI.setVolume(0, volume);
//         MIDI.noteOn(this.program, note, velocity, 0);
//         MIDI.noteOff(this.program, note, duration);
//     }
// };
// musicBlock.prototype.setInitValues = function(el) {
//     this.volume = el.volume;
//     this.note = el.note;
//     this.duration = el.duration;
//     this.velocity = el.velocity;
//     this.octave = el.octave;
//     this.program = el.instrument;
//     this.staticDirection = el.direction;

// };
// musicBlock.prototype.setMidiValues = function(type, value) {
//     switch (type) {
//         case "volume":
//             this.volume = value;
//             break;
//         case "octave":
//             this.octave = value;
//             break;
//         case "duration":
//             this.duration = value;
//             break;
//         case "velocity":
//             this.velocity = value;
//             break;
//         case "note":
//             this.note = value;
//             break;
//         case "instrument":
//             this.program = value;
//             break;
//         case "direction":
//             this.staticDirection = value;
//             break;
//         default:
//             this.volume = value;
//             break;
//     }
// };





//Display block info
function displayBlockInfo(blockref) {
    console.log("Block " + blockref +
        " GridX: " + blocks[blockref].gridX +
        " GridY: " + blocks[blockref].gridY +
        " prevGridX: " + blocks[blockref].prevgridX +
        " prevGridY: " + blocks[blockref].prevgridY +
        " Direction: " + blocks[blockref].direction +
        " Waiting: " + blocks[blockref].waiting);
}

//Gridify translates an amount of pixels to an amount of blocks
function gridify(pixels) {
    return Math.floor((pixels - config.minX) / config.blockSize);
}

function rangedRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Returns a hex color based on the block type
function getBlockColor(type) {
    switch (type) {
        case config.musicBlockType:
            return "#DBA65C";
        case config.randomVolumeType:
            return "#5C91DB";
        case config.randomNoteType:
            return "#CE6262";
        case config.randomOctaveType:
            return "#7771C1";
    }
}

collisions = function() {
    var
        processType,
        process,
        oppositeDirection;

    oppositeDirection = function(direction) {
        switch (direction) {
            case "up":
                return "down";
            case "down":
                return "up";
            case "left":
                return "right";
            case "right":
                return "left";
            default:
                return "none";
        }
    };

    processType = function(mblockref, eblockref) {
        switch (blocks[eblockref].type) {
            case config.randomVolumeType:
                blocks[mblockref].volume = rangedRandom(blocks[eblockref].rngMin, blocks[eblockref].rngMax);
                break;
            case config.randomOctaveType:
                blocks[mblockref].octave = rangedRandom(blocks[eblockref].rngMin, blocks[eblockref].rngMax);
                break;
            case config.randomNoteType:
                blocks[mblockref].note = rangedRandom(blocks[eblockref].rngMin, blocks[eblockref].rngMax);
                break;
            default:
                break;
        }

        if (config.numSelected === 1 && blocks[mblockref].selected === true && eblockref.type !== config.musicBlockType) {
            controlPanel.setToBlock(mblockref);
        }
    };
    process = function(direction, gridX, gridY, blockref, skipcheck) {
        var
            directGridX,
            directGridY,
            diag1GridX,
            diag1GridY,
            diag1Direction,
            diag2GridX,
            diag2GridY,
            diag2Direction;
        // Based on the direction passed to the function, determine which grid locations to check
        // 1st check the grid square directly in the path of the block
        // 2nd check the grid square clockwise to that square
        // 3rd check the grid square counter-clockwise to that square
        switch (direction) {
            case "up":
                directGridX = gridX;
                directGridY = gridY - 1;
                diag1GridX = gridX - 1;
                diag1GridY = gridY - 1;
                diag1Direction = "right";
                diag2GridX = gridX + 1;
                diag2GridY = gridY - 1;
                diag2Direction = "left";
                break;

            case "down":
                directGridX = gridX;
                directGridY = gridY + 1;
                diag1GridX = gridX - 1;
                diag1GridY = gridY + 1;
                diag1Direction = "right";
                diag2GridX = gridX + 1;
                diag2GridY = gridY + 1;
                diag2Direction = "left";
                break;

            case "left":
                directGridX = gridX - 1;
                directGridY = gridY;
                diag1GridX = gridX - 1;
                diag1GridY = gridY - 1;
                diag1Direction = "down";
                diag2GridX = gridX - 1;
                diag2GridY = gridY + 1;
                diag2Direction = "up";
                break;

            case "right":
                directGridX = gridX + 1;
                directGridY = gridY;
                diag1GridX = gridX + 1;
                diag1GridY = gridY - 1;
                diag1Direction = "down";
                diag2GridX = gridX + 1;
                diag2GridY = gridY + 1;
                diag2Direction = "up";
                break;
            case "none":
                return direction;
        }

        //Check for boundary collision
        if ((direction === "up" && gridY === config.minGridY) || (direction === "down" && gridY === config.maxGridY) || (direction === "left" && gridX === config.minGridX) || (direction === "right" && gridX === config.maxGridX)) {
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        }

        //Check for collision with object directly in path
        else if (gridArray[directGridX][directGridY] !== -1) {
            processType(blockref, gridArray[directGridX][directGridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 1 collision
        else if (diag1GridX >= config.minGridX && diag1GridY >= config.minGridY && diag1GridX <= config.maxGridX && diag1GridY <= config.maxGridY && gridArray[diag1GridX][diag1GridY] !== -1 && blocks[gridArray[diag1GridX][diag1GridY]].waiting === false && (blocks[gridArray[diag1GridX][diag1GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag1GridX][diag1GridY]].oldDirection === diag1Direction) {
            processType(blockref, gridArray[diag1GridX][diag1GridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 2 collision
        else if (diag2GridX >= config.minGridX && diag2GridY >= config.minGridY && diag2GridX <= config.maxGridX && diag2GridY <= config.maxGridY && gridArray[diag2GridX][diag2GridY] !== -1 && blocks[gridArray[diag2GridX][diag2GridY]].waiting === false && (blocks[gridArray[diag2GridX][diag2GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag2GridX][diag2GridY]].oldDirection === diag2Direction) {
            processType(blockref, gridArray[diag2GridX][diag2GridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        } else
            return direction;
    };

    return {
        process: process,
        processType: processType
    };

}();

// function processTypeCollision(mblockref, eblockref) {
//     switch (blocks[eblockref].type) {
//         case config.randomVolumeType:
//             blocks[mblockref].volume = rangedRandom(blocks[eblockref].rngMin, blocks[eblockref].rngMax);
//             break;
//         case config.randomOctaveType:
//             blocks[mblockref].octave = rangedRandom(blocks[eblockref].rngMin, blocks[eblockref].rngMax);
//             break;
//         case config.randomNoteType:
//             blocks[mblockref].note = rangedRandom(blocks[eblockref].rngMin, blocks[eblockref].rngMax);
//             break;
//         default:
//             break;
//     }
//     if (config.numSelected === 1 && blocks[mblockref].selected === true && eblockref.type !== config.musicBlockType) {
//         controlPanel.setToBlock(mblockref);
//     }
// }

// function processCollision(direction, gridX, gridY, blockref, skipcheck) {
//     var directGridX, directGridY,
//         diag1GridX, diag1GridY, diag1Direction,
//         diag2GridX, diag2GridY, diag2Direction;
//     // Based on the direction passed to the function, determine which grid locations to check
//     // 1st check the grid square directly in the path of the block
//     // 2nd check the grid square clockwise to that square
//     // 3rd check the grid square counter-clockwise to that square
//     switch (direction) {
//         case "up":
//             directGridX = gridX;
//             directGridY = gridY - 1;
//             diag1GridX = gridX - 1;
//             diag1GridY = gridY - 1;
//             diag1Direction = "right";
//             diag2GridX = gridX + 1;
//             diag2GridY = gridY - 1;
//             diag2Direction = "left";
//             break;

//         case "down":
//             directGridX = gridX;
//             directGridY = gridY + 1;
//             diag1GridX = gridX - 1;
//             diag1GridY = gridY + 1;
//             diag1Direction = "right";
//             diag2GridX = gridX + 1;
//             diag2GridY = gridY + 1;
//             diag2Direction = "left";
//             break;

//         case "left":
//             directGridX = gridX - 1;
//             directGridY = gridY;
//             diag1GridX = gridX - 1;
//             diag1GridY = gridY - 1;
//             diag1Direction = "down";
//             diag2GridX = gridX - 1;
//             diag2GridY = gridY + 1;
//             diag2Direction = "up";
//             break;

//         case "right":
//             directGridX = gridX + 1;
//             directGridY = gridY;
//             diag1GridX = gridX + 1;
//             diag1GridY = gridY - 1;
//             diag1Direction = "down";
//             diag2GridX = gridX + 1;
//             diag2GridY = gridY + 1;
//             diag2Direction = "up";
//             break;
//         case "none":
//             return direction;
//     }

//     //Check for boundary collision
//     if ((direction === "up" && gridY === config.minGridY) || (direction === "down" && gridY === config.maxGridY) || (direction === "left" && gridX === config.minGridX) || (direction === "right" && gridX === config.maxGridX)) {
//         blocks[blockref].numCollisions++;
//         return oppositeDirection(direction);
//     }

//     //Check for collision with object directly in path
//     else if (gridArray[directGridX][directGridY] !== -1) {
//         processTypeCollision(blockref, gridArray[directGridX][directGridY]);
//         blocks[blockref].numCollisions++;
//         return oppositeDirection(direction);
//     }

//     //Check for diagonal 1 collision
//     else if (diag1GridX >= config.minGridX && diag1GridY >= config.minGridY && diag1GridX <= config.maxGridX && diag1GridY <= config.maxGridY && gridArray[diag1GridX][diag1GridY] !== -1 && blocks[gridArray[diag1GridX][diag1GridY]].waiting === false && (blocks[gridArray[diag1GridX][diag1GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag1GridX][diag1GridY]].oldDirection === diag1Direction) {
//         processTypeCollision(blockref, gridArray[diag1GridX][diag1GridY]);
//         blocks[blockref].numCollisions++;
//         return oppositeDirection(direction);
//     }

//     //Check for diagonal 2 collision
//     else if (diag2GridX >= config.minGridX && diag2GridY >= config.minGridY && diag2GridX <= config.maxGridX && diag2GridY <= config.maxGridY && gridArray[diag2GridX][diag2GridY] !== -1 && blocks[gridArray[diag2GridX][diag2GridY]].waiting === false && (blocks[gridArray[diag2GridX][diag2GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag2GridX][diag2GridY]].oldDirection === diag2Direction) {
//         processTypeCollision(blockref, gridArray[diag2GridX][diag2GridY]);
//         blocks[blockref].numCollisions++;
//         return oppositeDirection(direction);
//     } else
//         return direction;
// }

// function oppositeDirection(direction) {
//     switch (direction) {
//         case "up":
//             return "down";
//         case "down":
//             return "up";
//         case "left":
//             return "right";
//         case "right":
//             return "left";
//         default:
//             return "none";
//     }
// }

startSyncCounter = function() {
    var dir,
        running = true,
        syncounter = -config.blockSize,
        blocklength;

    (function syncCounter() {
        blocklength = blocks.length;

        if ((config.pause === 1 && config.advance === 1) || config.pause === -1) {
            if (syncounter == config.blockSize) {
                if (config.cnt !== 0) {
                    //update oldDirection, direction and queue flag
                    for (var n = 0; n < blocklength; n++) {
                        blocks[n].oldDirection = blocks[n].direction = blocks[n].newDirection;
                        if (blocks[n].queued == 1) {
                            blocks[n].queued = 0;
                        }
                        blocks[n].prevgridX = blocks[n].gridX;
                        blocks[n].prevgridY = blocks[n].gridY;
                        blocks[n].waiting = false;

                        //reset numcollisions
                        blocks[n].numCollisions = 0;
                    }

                    //first collision check
                    for (var l = 0; l < blocklength; l++) {
                        dir = collisions.process(blocks[l].direction, blocks[l].gridX, blocks[l].gridY, l, true);
                        blocks[l].direction = blocks[l].newDirection = dir;
                    }

                    //Update oldDirection for second collision
                    for (var k = 0; k < blocklength; k++) {
                        blocks[k].oldDirection = blocks[k].direction;
                    }

                    //second collision check
                    for (var o = 0; o < blocklength; o++) {
                        dir = collisions.process(blocks[o].direction, blocks[o].gridX, blocks[o].gridY, o, false);
                        blocks[o].direction = dir;

                        //If block collided twice, wait
                        if (blocks[o].numCollisions >= 2) {
                            blocks[o].waiting = true;
                        }

                        //Check if block was moving and had a collision
                        if (blocks[o].numCollisions >= 1 && blocks[o].waiting === false) {
                            blocks[o].playmidi();
                        }
                    }

                    //mid-square collision detection
                    for (var m = 0; m < blocklength; m++) {
                        if (blocks[m].direction == "up" && blocks[m].waiting === false && blocks[m].gridY > 1 && gridArray[blocks[m].gridX][blocks[m].gridY - 1] === -1 && gridArray[blocks[m].gridX][blocks[m].gridY - 2] !== -1 && blocks[gridArray[blocks[m].gridX][blocks[m].gridY - 2]].waiting === false && blocks[gridArray[blocks[m].gridX][blocks[m].gridY - 2]].direction === "down") {
                            blocks[m].halfpoint = blocks[m].posY - (config.blockSize / 2);
                        }
                        if (blocks[m].direction == "down" && blocks[m].waiting === false && blocks[m].gridY < config.gridSize - 2 && gridArray[blocks[m].gridX][blocks[m].gridY + 1] === -1 && gridArray[blocks[m].gridX][blocks[m].gridY + 2] !== -1 && blocks[gridArray[blocks[m].gridX][blocks[m].gridY + 2]].waiting === false && blocks[gridArray[blocks[m].gridX][blocks[m].gridY + 2]].direction === "up") {
                            blocks[m].halfpoint = blocks[m].posY + (config.blockSize / 2);
                        }
                        if (blocks[m].direction == "left" && blocks[m].waiting === false && blocks[m].gridX > 1 && gridArray[blocks[m].gridX - 1][blocks[m].gridY] === -1 && gridArray[blocks[m].gridX - 2][blocks[m].gridY] !== -1 && blocks[gridArray[blocks[m].gridX - 2][blocks[m].gridY]].waiting === false && blocks[gridArray[blocks[m].gridX - 2][blocks[m].gridY]].direction === "right") {
                            blocks[m].halfpoint = blocks[m].posX - (config.blockSize / 2);
                        }
                        if (blocks[m].direction == "right" && blocks[m].waiting === false && blocks[m].gridX < config.gridSize - 2 && gridArray[blocks[m].gridX + 1][blocks[m].gridY] === -1 && gridArray[blocks[m].gridX + 2][blocks[m].gridY] !== -1 && blocks[gridArray[blocks[m].gridX + 2][blocks[m].gridY]].waiting === false && blocks[gridArray[blocks[m].gridX + 2][blocks[m].gridY]].direction === "left") {
                            blocks[m].halfpoint = blocks[m].posX + (config.blockSize / 2);
                        }
                    }
                }
                syncounter = 0;
            }

            /////set block direction play note on collision
            for (var i = 0; i < blocklength; i++) {
                if (blocks[i].waiting === false) {
                    if (blocks[i].direction == "up") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint > blocks[i].posY - blocks[i].speed) {
                                blocks[i].posY = 2 * blocks[i].halfpoint + config.speed - blocks[i].posY;
                                blocks[i].direction = blocks[i].newDirection = "down";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridY = blocks[i].gridY;
                                blocks[i].playmidi();

                            } else blocks[i].posY += -1 * blocks[i].speed;
                        }
                    } else if (blocks[i].direction == "down") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint < blocks[i].posY + blocks[i].speed) {
                                blocks[i].posY = 2 * blocks[i].halfpoint - config.speed - blocks[i].posY;
                                blocks[i].direction = blocks[i].newDirection = "up";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridY = blocks[i].gridY;
                                blocks[i].playmidi();

                            } else blocks[i].posY += 1 * blocks[i].speed;
                        }
                    }
                    if (blocks[i].direction == "left") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint > blocks[i].posX - blocks[i].speed) {
                                blocks[i].posX = 2 * blocks[i].halfpoint + config.speed - blocks[i].posX;
                                blocks[i].direction = blocks[i].newDirection = "right";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridX = blocks[i].gridX;
                                blocks[i].playmidi();

                            } else blocks[i].posX += -1 * blocks[i].speed;
                        }
                    } else if (blocks[i].direction == "right") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint < blocks[i].posX + blocks[i].speed) {
                                blocks[i].posX = 2 * blocks[i].halfpoint - config.speed - blocks[i].posX;
                                blocks[i].direction = blocks[i].newDirection = "left";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridX = blocks[i].gridX;
                                blocks[i].playmidi();

                            } else blocks[i].posX += 1 * blocks[i].speed;
                        }
                    }
                    blocks[i].updatePosition();
                }
            }

            //After moving, update all block positions
            for (var q = 0; q < blocklength; q++) {
                //calculate new grid positions, floor handles blocks moving left and up
                blocks[q].gridX = gridify(blocks[q].posX);
                blocks[q].gridY = gridify(blocks[q].posY);

                //if blocks are moving into a new block, move block reference 1 right or down if needed
                if (blocks[q].direction === "right" && (blocks[q].posX / config.blockSize) % 1 !== 0)
                    blocks[q].gridX++;
                if (blocks[q].direction === "down" && (blocks[q].posY / config.blockSize) % 1 !== 0)
                    blocks[q].gridY++;

                gridArray[blocks[q].gridX][blocks[q].gridY] = q;

                if (syncounter === config.blockSize - config.speed && (blocks[q].prevgridX !== blocks[q].gridX || blocks[q].prevgridY !== blocks[q].gridY)) {
                    gridArray[blocks[q].prevgridX][blocks[q].prevgridY] = -1;
                }
            }

            syncounter += config.speed;
            config.advance = -1;

        }
        requestAnimationFrame(syncCounter);
    })();
}();





// Load MIDI library and set params 
setMidiParams = function() {
    var
        setParams,
        getNote,
        tiggerMidi;
    //LOAD MIDI SOUNDFONTS
    window.onload = function() {
        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instruments: ["acoustic_grand_piano", "steel_drums", "tinkle_bell"],
            callback: function() {
                MIDI.programChange(0, 0);
                MIDI.programChange(1, 114);
                MIDI.programChange(2, 112);
                console.log("loaded");
            }
        });
    };
    triggerMidi = function(vol, pro, note, vel, dur) {
        MIDI.setVolume(0, vol);
        MIDI.noteOn(pro, note, vel, 0);
        MIDI.noteOff(pro, note, dur);
    };

    getNote = function(val) {
        var noteArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        return noteArray[val];
    };
    return {
        getNote: getNote,
        setParams: setParams,
        triggerMidi: triggerMidi
    };
}();

controlPanel = function() {
    var
        elements = {
            noteslider: $("#note-slider"),
            volumeknob: $("#volume"),
            durationknob: $("#duration"),
            velocityknob: $("#velocity"),
            octavespinner: $("#octave-spinner"),
            selectDirection: $("#selectDirection"),
            modeSelect: $(".modeSelect li"),
            pianoroll: $(".piano-roll li"),
            sendBlocks: document.getElementById("sendBlocks"),
            setInstrument: document.getElementById("setInstrument")
        },

        knobparams = {
            fgColor: '#6f6e6d',
            bgColor: '#adacaa',
            width: '27',
            thickness: '.55',
            cursor: 11,
            height: '27 ',
        },
        valprev = "",
        setDefault,
        getDirection,
        setDirection,
        setToBlock,
        syncNoteSelection,
        sendBlocks,
        createDial;


    getDirection = function() {
        return elements.selectDirection.find("li.active").attr("id");
    };
    setDirection = function(d) {
        elements.selectDirection.find("li#" + d).addClass("active").siblings().removeClass("active");
    };
    getPanelValues = function() {
        return {
            volume: elements.volumeknob.val(),
            duration: elements.durationknob.val(),
            note: elements.noteslider.val(),
            velocity: elements.velocityknob.val(),
            instrument: elements.setInstrument.value,
            octave: elements.octavespinner.slider("value"),
            direction: getDirection()
        };
    };

    syncNoteSelection = function(value, type) {
        if (type === "piano-roll") {
            elements.pianoroll.eq(value - 1).addClass("active").siblings().removeClass('active');
        } else {
            elements.noteslider.val(value);
            elements.noteslider.trigger('change');
        }

    };
    sendBlocks = function() {
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].selected === true && blocks[i].type === config.musicBlockType) {
                //console.log( blocks[i].direction);
                blocks[i].newDirection = blocks[i].staticDirection;
                blocks[i].speed = config.speed;
            }
        }
    };
    setDefault = function() {
        elements.noteslider.val(config.note);
        elements.noteslider.trigger('change');
        elements.volumeknob.val(config.volume);
        elements.volumeknob.trigger('change');
        elements.durationknob.val(config.duration);
        elements.durationknob.trigger('change');
        elements.velocityknob.val(config.velocity);
        elements.velocityknob.trigger('change');
        elements.octavespinner.slider("value", config.octave);
        elements.octavespinner.find("input").val(config.octave);
        setDirection("up");
    };
    setToBlock = function(num) {
        elements.noteslider.val(blocks[num].note);
        elements.noteslider.trigger('change');
        elements.volumeknob.val(blocks[num].volume);
        elements.volumeknob.trigger('change');
        elements.durationknob.val(blocks[num].duration);
        elements.durationknob.trigger('change');
        elements.velocityknob.val(blocks[num].velocity);
        elements.velocityknob.trigger('change');
        elements.octavespinner.slider("value", blocks[num].octave);
        elements.octavespinner.find("input").val(blocks[num].octave);
        elements.setInstrument.value = blocks[num].program;
        setDirection(blocks[num].staticDirection);


    };
    createDial = function(obj, startVal, type, min, max) {
        obj.val(startVal)
            .knob({
                'min': min,
                'max': max,
                'fgColor': knobparams.fgColor,
                'bgColor': knobparams.bgColor,
                'width': knobparams.width,
                'thickness': knobparams.thickness,
                'cursor': knobparams.cursor,
                'height': knobparams.height,
                'format': function(value) {
                    if (valprev != value) {
                        if (type === "note") {
                            syncNoteSelection(value, "piano-roll");
                        }
                        setParams(type, value);
                        return value;
                    }
                    valprev = value;
                }
            });
    };

    setParams = function(type, value) {
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].selected === true) {
                blocks[i].setMidiValues(type, value);
            }
        }
    };

    elements.modeSelect.click(function() {
        var mode = $(this).attr("class");
        $(this).addClass("active").siblings().removeClass("active");
        mode = mode.replace("active", "");
        config.mode = mode;
    });

    // Create dials
    createDial(elements.volumeknob, config.volume, "volume", 1, 120);
    createDial(elements.durationknob, config.duration, "duration", 1, 120);
    createDial(elements.velocityknob, config.velocity, "velocity", 1, 120);
    createDial(elements.noteslider, config.note, "note", 1, 12);

    elements.setInstrument.onchange = function() {
        var program = $(this).val();
        setParams("instrument", program);
        return false;
    };
    elements.selectDirection.find("li").click(function() {
        var direction = $(this).attr("id");
        $(this).addClass("active").siblings().removeClass("active");
        setParams("direction", direction);
    });
    elements.octavespinner.slider({
        orientation: "vertical",
        value: 4,
        min: 0,
        max: 7,
        step: 1,
        range: "min",
        slide: function(event, ui) {
            elements.octavespinner.find("input").val(ui.value);
            setParams("octave", ui.value);
        }
    });
    elements.pianoroll.click(function() {
        var index = $(this).index() + 1;
        $(this).addClass("active").siblings().removeClass('active');
        setParams("note", index);
        syncNoteSelection(index, "dial");

    });
    elements.sendBlocks.addEventListener("mousedown", sendBlocks, false);

    return {
        setToBlock: setToBlock,
        setDefault: setDefault,
        getPanelValues: getPanelValues
    };
}();



setStageEvents = function() {
    var
        mousedownX = -1,
        mousedownY = -1,
        blockDragLeftX = config.gridSize,
        blockDragLeftY = config.gridSize,
        blockDragWidth = 0,
        blockDragHeight = 0,
        blockDragOffsetX = 0,
        blockDragOffsetY = 0,
        gridCheck = false;


    resetBlockDrag();

    function resetBlockDrag() {
        blockDragLeftX = config.blockSize;
        blockDragLeftY = config.blockSize;
        blockDragRightX = 0;
        blockDragRightY = 0;
    }

    function setStyles(propertyObject) {
        var elem = document.getElementById("dragbox");
        for (var property in propertyObject) {
            elem.style[property] = propertyObject[property];
        }
    }

    function compareMouse(e) {
        if (gridify(mousedownX) === gridify(e.pageX) && gridify(mousedownY) === gridify(e.pageY) && config.draggingBlocks === false) {
            return "same";
        } else {
            return "different";
        }
    }

    function mousedrag(e) {
        e = e || window.event;
        mouselocation = compareMouse(e);
        if (mouselocation == "different") {
            var mousedowngridX = gridify(mousedownX);
            var mousedowngridY = gridify(mousedownY);

            if (gridArray[mousedowngridX][mousedowngridY] != -1 && blocks[gridArray[mousedowngridX][mousedowngridY]].selected === true && config.draggingBlocks === false) {
                config.draggingBlocks = true;
                config.pause = 1;
                var blockDragRightX = 0,
                    blockDragRightY = 0;
                //Set the bounds of the blocks being dragged
                for (var i = 0; i < blocks.length; i++) {
                    if (blocks[i].selected === true) {
                        blockDragLeftX = Math.min(blockDragLeftX, blocks[i].gridX);
                        blockDragLeftY = Math.min(blockDragLeftY, blocks[i].gridY);
                        blockDragRightX = Math.max(blockDragRightX, blocks[i].gridX);
                        blockDragRightY = Math.max(blockDragRightY, blocks[i].gridY);
                    }
                }
                blockDragWidth = blockDragRightX - blockDragLeftX;
                blockDragHeight = blockDragRightY - blockDragLeftY;
                blockDragOffsetX = gridify(mousedownX) - blockDragLeftX;
                blockDragOffsetY = gridify(mousedownY) - blockDragLeftY;

                //Set each block's drag offset from the drag corner
                for (var i = 0; i < blocks.length; i++) {
                    if (blocks[i].selected === true) {
                        blocks[i].dragOffsetX = blocks[i].gridX - blockDragLeftX;
                        blocks[i].dragOffsetY = blocks[i].gridY - blockDragLeftY;
                    }
                }
            }

            if (config.draggingBlocks === true) {
                //Check for new blockDrag positions being outside the grid
                var gridpos = gridify(e.pageX) - blockDragOffsetX;
                if (gridpos + blockDragWidth < config.gridSize && gridpos >= 0) {
                    blockDragLeftX = gridpos;
                }

                gridpos = gridify(e.pageY) - blockDragOffsetY;
                if (gridpos + blockDragHeight < config.gridSize && gridpos >= 0) {
                    blockDragLeftY = gridpos;
                }

                var validMove = true;

                //Check all blocks if their new position conflicts with existing blocks
                for (var i = 0; i < blocks.length; i++) {
                    if (blocks[i].selected === true && gridArray[blockDragLeftX + blocks[i].dragOffsetX][blockDragLeftY + blocks[i].dragOffsetY] !== -1 && blocks[gridArray[blockDragLeftX + blocks[i].dragOffsetX][blockDragLeftY + blocks[i].dragOffsetY]].selected === false) {
                        validMove = false;
                    }
                }

                //Update block positions based on the drag block
                if (validMove === true) {
                    for (var i = 0; i < blocks.length; i++) {
                        if (blocks[i].selected === true) {
                            //Update gridArray to remove block from previous locations
                            gridArray[blocks[i].prevgridX][blocks[i].prevgridY] = -1;
                            gridArray[blocks[i].gridX][blocks[i].gridY] = -1;

                            //set the new position
                            blocks[i].gridX = blocks[i].prevGridX = blocks[i].dragOffsetX + blockDragLeftX;
                            blocks[i].gridY = blocks[i].prevGridY = blocks[i].dragOffsetY + blockDragLeftY;
                            blocks[i].posX = blocks[i].gridX * config.blockSize;
                            blocks[i].posY = blocks[i].gridY * config.blockSize;

                            //Update the new gridArray location
                            gridArray[blocks[i].gridX][blocks[i].gridY] = i;
                            blocks[i].direction = "none";
                            blocks[i].updatePosition();
                        }
                    }
                }
            }

            if (config.draggingBlocks === false) {
                if (config.mode == "create") {
                    var gridX = gridify(e.pageX);
                    var gridY = gridify(e.pageY);

                    ///Add music block to the grid
                    addBlock(gridX, gridY, config.newBlockType);
                } else {
                    var move_x = e.pageX,
                        move_y = e.pageY,
                        width = Math.abs(move_x - mousedownX),
                        height = Math.abs(move_y - mousedownY),
                        new_x, new_y;

                    new_x = (move_x < mousedownX) ? (mousedownX - width) : mousedownX;
                    new_y = (move_y < mousedownY) ? (mousedownY - height) : mousedownY;

                    setStyles({
                        'width': width + "px",
                        'height': height + "px",
                        'top': new_y + "px",
                        'left': new_x + "px"
                    });
                }
            }
        }
    }

    // Compares mouseup location with mousedown, calls old click function if same, drag select if not
    function mouseUp(e) {

        if (gridCheck === true) {
            if (config.mode === "select") {
                elements.section.removeChild(dragbox);
            }

            if (config.draggingBlocks === true) {
                config.draggingBlocks = false;
                config.pause = -1;
                blockDragLeftX = config.gridSize;
                blockDragLeftY = config.gridSize;
                blockDragWidth = 0;
                blockDragHeight = 0;
            } else {
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
                if (mouselocation === "same") {
                    //Check if block exists
                    if (blockref != -1) {
                        //Check if block is not selected
                        if (blocks[blockref].selected === false) {
                            //Check if shift is off
                            if (config.shiftkey === 0) {
                                blocks[blockref].selectNewSingle();
                            }
                            //Shift is on
                            else {
                                blocks[blockref].selectBlock();
                            }
                        }
                        //Block is selected
                        else {
                            //Check for multiple blocks selected
                            if (config.numSelected > 1 && config.shiftkey === 0) {
                                blocks[blockref].selectNewSingle();
                            }
                            //Block is only one selected or shift is pressed
                            else {
                                blocks[blockref].deselectBlock();
                            }
                        }
                    }
                    //Clicked square is empty
                    else if (config.mode === "create") {
                        addBlock(leftX, topY, config.newBlockType);
                    } else if (config.mode === "select") {
                        for (var i = 0; i < blocks.length; i++) {
                            blocks[i].deselectBlock();
                        }
                    }
                }

                //Mouse button was dragged to other squares
                else {
                    //Handle select mode
                    if (config.mode === "select") {
                        //Check for shift key off
                        if (config.shiftkey === 0) {
                            //If shift is off, deselect all blocks currently selected
                            for (var q = 0; q < blocks.length; q++) {
                                blocks[q].deselectBlock();
                            }
                        }

                        //Select all blocks in the dragbox
                        var cnt = 0,
                            t;
                        for (var p = 0; p < blocks.length; p++) {
                            var gridX = blocks[p].gridX;
                            var gridY = blocks[p].gridY;

                            if (gridX < rightX && gridX >= leftX && gridY < bottomY && gridY >= topY) {

                                blocks[p].selectBlock();
                                t = p;
                                cnt++;


                            }
                        }
                        if (cnt === 1) {
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

        if (config.mode === "select") {
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

        if (config.mode === "create") {
            addBlock(gridify(mousedownX), gridify(mousedownY), config.newBlockType);
        }

        //Add drag event on mousedown
        elements.section.addEventListener('mousemove', mousedrag, false);
    }

    function addBlock(gridX, gridY, type) {
        if (gridArray[gridX][gridY] === -1) {

            // blocks[config.cnt] = new musicBlock(config.blockSize, config.blockSize, gridX * config.blockSize, gridY * config.blockSize, 0, type);
            blocks[config.cnt] = makeBlock(config.blockSize, config.blockSize, gridX * config.blockSize, gridY * config.blockSize, 0, type);
            blocks[config.cnt].setInitValues(controlPanel.getPanelValues());
            blocks[config.cnt].createNode(config.cnt, type).addBlock();

            gridArray[gridX][gridY] = config.cnt;
            config.newblock = config.cnt;
            switch (type) {
                case config.randomVolumeType:
                    blocks[config.cnt].rngMin = config.defaultVolumeMin;
                    blocks[config.cnt].rngMax = config.defaultVolumeMax;
                    break;

                case config.randomOctaveType:
                    blocks[config.cnt].rngMin = config.defaultOctaveMin;
                    blocks[config.cnt].rngMax = config.defaultOctaveMax;
                    break;

                case config.randomNoteType:
                    blocks[config.cnt].rngMin = config.defaultNoteMin;
                    blocks[config.cnt].rngMax = config.defaultNoteMax;
                    break;

                default:
                    break;
            }

            config.cnt++;

            //r Control Panel
            //controlPanel.setDefault();  
        }
    }

    window.addEventListener("mouseup", mouseUp, false);
    elements.section.addEventListener("mousedown", mouseDown, false);


    //REMOVE THIS once there is a block type indicator
    addBlock(0, 0, config.musicBlockType);


}();




var advance = (function() {

    var pauseBtn = document.getElementById("pause");
    var advanceBtn = document.getElementById("advance");
    var clearBtn = document.getElementById("clearall");
    var selectAllBtn = document.getElementById("selectall");
    var changeBlockTypeBtn = document.getElementById("changetype");

    pauseBtn.addEventListener("click", function() {
        pauseBlock();
    });
    advanceBtn.addEventListener("click", function() {
        advanceBlock();
    });
    clearBtn.addEventListener("click", function() {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].removeBlock();
            i--;
        }
    });
    changeBlockTypeBtn.addEventListener("click", function() {
        changeBlockType();
    });
    selectAllBtn.addEventListener("click", function() {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].selectBlock();
        }
    });

    function pauseBlock() {
        config.pause = config.pause * -1;
    }

    function advanceBlock() {
        config.advance *= -1;
    }

    function changeBlockType() {
        switch (config.newBlockType) {
            case config.musicBlockType:
                config.newBlockType = config.randomVolumeType;
                break;

            case config.randomVolumeType:
                config.newBlockType = config.randomOctaveType;
                break;

            case config.randomOctaveType:
                config.newBlockType = config.randomNoteType;
                break;

            case config.randomNoteType:
                config.newBlockType = config.musicBlockType;
                break;

            default:
                break;
        }
        blocks[0].convertBlock(config.newBlockType);
    }

})();





var arrowClick = (function() {
    var stopArrow = document.getElementById("stop");

    function animateBlock(direction) {
        for (var i = 0; i < blocks.length; i++) {
            if (blocks[i].selected === true && blocks[i].type === config.musicBlockType) {
                blocks[i].newDirection = direction;
                blocks[i].speed = config.speed;
            }
        }
    }

    //Keydown handler for keyboard input
    window.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 16: // Shift
                config.shiftkey = 1;
                break;

            case 32: // Space
                if (config.draggingBlocks === false) {
                    config.pause = config.pause * -1;
                }
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
                for (var s = 0; s < blocks.length; s++) {
                    if (blocks[s].selected === true) {
                        blocks[s].removeBlock();
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
                for (var i = 0; i < config.gridSize; i++) {
                    out = out + "\n";
                    for (var j = 0; j < config.gridSize; j++) {
                        if ((gridArray[j][i] + "").length === 1)
                            out = out + " ";
                        out = out + gridArray[j][i] + " ";
                    }
                }
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

    stopArrow.addEventListener("click", function() {
        animateBlock("none");
    });

})();