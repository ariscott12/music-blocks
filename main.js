var
    config = {
        newBlockType: "",
        randomVolumeType: "rnd-vol-block",
        randomOctaveType: "rnd-octave-block",
        randomNoteType: "rnd-note-block",
        musicBlockType: "block-music",
        defaultVolumeMin: 30,
        defaultVolumeMax: 70,
        defaultOctaveMin: 3,
        defaultOctaveMax: 5,
        defaultNoteMin: 0,
        defaultNoteMax: 11,
        speed: 4,
        blockSize: 32,
        gridHeight: 18,
        gridWidth: 20,
        gridOffsetX: 0,
        gridOffsetY: 0,
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        minGridX: 0,
        minGridY: 0,
        maxGridX: 0,
        maxGridY: 0,
        minNote: 1,
        maxNote: 127,
        minVelocity: 0,
        maxVelocity: 120,
        minDuration: 0,
        maxDuration: 120,
        minVolume: 0,
        maxVolume: 120,
        pause: -1,
        advance: -1,
        shiftkey: 0,
        numSelected: 0,
        mode: "create",
        cnt: 0,
        // volume: 60,
        // velocity: 60,
        // duration: 30,
        // note: 60,
        // octave: 4,
        newblock: -1,
        draggingBlocks: false,
        noteArray: ["C", "C#", "D", "D#","E", "F", "F#", "G", "G#", "A", "A#", "B"]
    },
    gridArray = new Array([]),
    minMaxArray = {
        note: {
            min: 1,
            max: 127
        },
        velocity: {
            min: 0,
            max: 120
        },
        duration: {
            min: 0,
            max: 120
        },
        volume: {
            min: 0,
            max: 120
        }
    };
blocks = [];

config.maxX = config.blockSize * config.gridWidth;
config.maxY = config.blockSize * config.gridHeight;
config.maxGridX = config.gridWidth - 1;
config.maxGridY = config.gridHeight - 1;
config.newBlockType = config.musicBlockType;



// Make the grid on load using blockSize, gridWidth and gridHeight from config object 
(function makeGrid() {
    var
        section,
        section2,
        node,
        gridH,
        gridV,

        elements = {
            grid: document.getElementById("grid"),
            gridH: document.getElementById("gridHorizontal"),
            gridV: document.getElementById("gridVertical")
        };

    elements.grid.style.width = (config.blockSize * config.gridWidth) + 'px';
    elements.grid.style.height = (config.blockSize * config.gridHeight) + 'px';

    for (var q = 0; q < config.gridHeight; q++) {
        node = document.createElement("LI");
        elements.gridH.appendChild(node);
        node.style.width = (config.blockSize * config.gridWidth) + 'px';
        node.style.marginTop = (config.blockSize - 1) + 'px';
    }

    for (var i = 0; i < config.gridWidth; i++) {
        elements.gridV = document.getElementById("gridVertical");
        node = document.createElement("LI");
        elements.gridV.appendChild(node);
        node.style.height = (config.blockSize * config.gridHeight) + 'px';
        node.style.marginRight = (config.blockSize - 1) + 'px';

        ////create empty grid array
        gridArray.push([]);
        for (var j = 0; j < config.gridHeight; j++) {
            gridArray[i][j] = -1;
        }
    }
})();

// Music block object and methods
var proto = {
    id: "",
    blocknum: 0,
    oldDirection: "none",
    newDirection: "none",
    direction: "none",
    //staticDirection: "none",
    isMoving: "false",
    queued: 1,
    selected: false,
    active: "#000",
    notActive: "#DBA65C",
    halfpoint: -1,
    snd: null,
    // note: config.note,
    // octave: config.octave,
    // volume: config.volume,
    // duration: config.duration,
    // veloctiy: config.veloctiy,
    program: 0,
    waiting: "false",
    numCollisions: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    rngMin: 0,
    rngMax: 0,
    gridX: 0,
    gridY: 0,
    prevgridX: 0,
    prevgridy: 0,

    section: document.getElementById("grid"),

    setGrid: function() {
        this.gridX = gridify(this.posX);
        this.gridY = gridify(this.posY);
        this.prevgridX = this.gridX;
        this.prevgridY = this.gridY;
    },

    setStyle: function(propertyObject) {
        var elem = document.getElementById(this.id);
        for (var property in propertyObject)
            elem.style[property] = propertyObject[property];
    },
    createNode: function(el, type) {
        var node = document.createElement("LI"),
            //blockclass = type;
            blockclass = "block";
        // var direction = elements.selectDirection.children('.active').attr("id");
        //var blockclass = type + " " + direction;
        node.setAttribute("class", blockclass);
        this.section.appendChild(node);
        this.id = type + el;
        this.blocknum = el;
        node.setAttribute("id", this.id);
        return this;
    },
    addBlock: function() {
        var
            colorArray = ["#d27743", "#cf5a4c", "#debe4e", "#ccc"];

        //var direction = elements.selectDirection.children('.active').attr("id");
        this.setStyle({
            'top': this.posY + "px",
            'left': this.posX + "px",
            'width': this.width + "px",
            'height': this.height + "px",
            'background': colorArray[this.program]
        });
        this.notActive = colorArray[this.program];
        //this.staticDirection = direction;
    },
    removeNode: function() {
        var node = document.getElementById(this.id);
        this.section.removeChild(node);
        node.remove();
    },

    shadeColor: function(color, percent) {

        var R = parseInt(color.substring(1, 3), 16);
        var G = parseInt(color.substring(3, 5), 16);
        var B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100, 0);
        G = parseInt(G * (100 + percent) / 100, 0);
        B = parseInt(B * (100 + percent) / 100, 0);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        var RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
        var GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
        var BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

        return "#" + RR + GG + BB;

    },
    selectBlock: function() {
        var color = this.shadeColor(this.notActive, 50);
        // Only select a block if it's not selected
        if (this.selected !== true && config.newblock !== this.blocknum) {
            this.selected = true;
            this.setStyle({
                'background': color
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
        for (var t = 0; t < config.gridWidth; t++) {
            for (var u = 0; u < config.gridHeight; u++) {
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
            //controlPanel.setToBlock(this.blocknum);
            if (this.type == "block-music") {
                musicBlockPanel.setToBlock(this.blocknum);
            }
            if (this.type == "block-effect") {
                effectBlockPanel.setToBlock(this.blocknum);
                // console.log(effectBlockPanel);
            }
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
            var duration = this.duration / 120;
            //note = this.note + 12 * this.octave;
            //note = this.note;


            setMidiParams.triggerMidi(this.volume, this.program, this.note, this.velocity, duration);
        }
    },
    // setInitValues: function(el) {
    //     this.volume = el.volume;
    //     this.note = el.note;
    //     this.duration = el.duration;
    //     this.velocity = el.velocity;
    //     this.octave = el.octave;
    //     this.program = el.instrument;
    //     this.staticDirection = el.direction;

    // },
    // setMidiValues: function(type, value) {
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
    //             // this.volume = value;
    //             break;
    //     }
    // }

};

var makeMusicBlock = function(w, h, x, y, s, t) {
    var block = Object.create(proto);
    block.width = w;
    block.height = h;
    block.posX = x;
    block.posY = y;
    block.speed = s;
    block.type = t;
    block.staticDirection = "none";
    block.notActive = getBlockColor(block.type);
    block.note = null;
    block.octave = null;
    block.volume = null;
    block.duration = null;
    block.velocity = null;


    // Music Block Specfic Methods
    block.tester = function() {
        console.log("this is a music block");
    };
    block.setInitValues = function(el) {
        var map = el.configMap;
        this.volume = map.volume;
        this.note = map.note;
        this.duration = map.duration;
        this.velocity = map.velocity;
        this.octave = map.octave;
        this.program = map.instrument;
        this.staticDirection = map.direction;

    };
    block.setMidiValues = function(type, value) {
        this[type] = value;
    };

    return block;
};


var makeEffectBlock = function(w, h, x, y, s, t) {
    var block = Object.create(proto);

    block.width = w;
    block.height = h;
    block.posX = x;
    block.posY = y;
    block.speed = s;
    block.type = t;

    block.configMap = {
        note: null,
        velocity: null,
        duration: null,
        volume: null
    };


    // Effect Block Specfic Methods
    block.setInitValues = function(el) {
        var effectArray = ['note', 'volume', 'velocity', 'duration'];
        var map = el.configMap;

        for (var key in map) {
            this.configMap[key] = {
                active: map[key].active,
                method: map[key].method,
                specific: map[key].specific,
                rand_low: map[key].rand_low,
                rand_high: map[key].rand_high,
                limit_range: map[key].limit_range,
                prog_high: map[key].prog_high,
                prog_low: map[key].prog_low,
                step: map[key].step,
                direction: map[key].direction
            };
        }
        //console.log(el.configMap);
    };

    block.setMidiValues = function(type, attr, value) {
        this.configMap[type][attr] = value;
        console.log(this.configMap);
    };
    return block;
};


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

function noteToString(note){
    return note / 12 + config.noteArray[note % 12];
}

function stringToNote(noteString){
    octave = + noteString.charAt(noteString.length - 1);
    noteStr = noteString.substring(0, noteString.length - 1);
    note = config.noteArray.indexOf(noteStr);
    return octave * 12 + note;
}

function rangedRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Sets the block's note and octave based on octaveNote value
function setBlockToOctaveNote(block, octaveNote) {
    block.note = octaveNote % 12;
    block.octave = Math.floor(octaveNote / 12);
}

//Retrieve octaveNote value from the block
function convertBlockToOctaveNote(block) {
    return block.note + block.octave * 12;
}

// function convertRangeToNote(rangeValue) {
//     return rangeValue % 12;
// }

// function convertRangeToOctave(rangeValue) {
//     return Math.floor(rangeValue / 12);
//}

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
        processEffects,
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

    processEffects = function(mblockref, eblockref) {
        // Do effect processing here

        if (blocks[eblockref].type == "block-effect") {
            //Effects loop
            for (var key in blocks[eblockref].configMap) {
                if (blocks[eblockref].configMap[key].active) {
                    switch (blocks[eblockref].configMap[key].method) {
                        case "specific":
                            //Set the mblock key to eblock specific
                            blocks[mblockref][key] = blocks[eblockref].configMap[key].specific;
                            break;

                        case "random":
                            //If limit range flag, new key is random key inside specified range
                            if (blocks[eblockref].configMap[key].limit_range) {
                                var newValue = rangedRandom(blocks[eblockref].configMap[key].rand_low, blocks[eblockref].configMap[key].rand_high);
                            }

                            //If not limit range flag, new key is random key in MIDI acceptable range
                            else {
                                var newValue = rangedRandom(minMaxArray[key].min, minMaxArray[key].max);
                            }

                            //Set blocks key to new key
                            blocks[mblockref][key] = newValue;

                            break;

                        case "progression":
                            var step_direction = 1;
                            if (blocks[eblockref].configMap[key].direction == "down") {
                                step_direction = -1;
                            }

                            //Add step value to block key
                            var newValue = blocks[mblockref][key] + blocks[eblockref].configMap[key].step * step_direction;

                            if (step_direction == 1) {
                                //If the result key is lower than the low limit, then set to the low limit.
                                //If the result key is higher than the high limit, then set to key - high limit.
                                //If the result key is inside the range, then leave it alone.
                                while (newValue < blocks[eblockref].configMap[key].prog_low) {
                                    newValue += blocks[eblockref].configMap[key].step;
                                }
                                if (newValue > blocks[eblockref].configMap[key].prog_high) {
                                    newValue = blocks[eblockref].configMap[key].prog_low + (newValue - blocks[eblockref].configMap[key].prog_high) % blocks[eblockref].configMap[key].step;
                                }
                            } else {
                                while (newValue > blocks[eblockref].configMap[key].prog_high) {
                                    newValue -= blocks[eblockref].configMap[key].step;
                                }
                                if (newValue < blocks[eblockref].configMap[key].prog_low) {
                                    newValue = blocks[eblockref].configMap[key].prog_high - (blocks[eblockref].configMap[key].prog_low - newValue) % blocks[eblockref].configMap[key].step;
                                }
                            }

                            //Set the block velocity to new value
                            blocks[mblockref][key] = newValue;

                            break;

                        default:
                            //This would be an error
                            break;
                    }
                }
            }


            // configMap has all attributes for effect blocks use dote notation to access values for example: blocks[eblockref].configMap.note.active

            //prints entire configMap in console.  Click on the object in the console to see all the attributes
            // console.log(blocks[eblockref].configMap);

            //blocks[mblockref].note = blocks[eblockref].configMap.note.specific;


        }

        if (config.numSelected === 1 && blocks[mblockref].selected === true && eblockref.type !== config.musicBlockType) {
            //controlPanel.setToBlock(mblockref);
            musicBlockPanel.setToBlock(mblockref);
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
            processEffects(blockref, gridArray[directGridX][directGridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 1 collision
        else if (diag1GridX >= config.minGridX && diag1GridY >= config.minGridY && diag1GridX <= config.maxGridX && diag1GridY <= config.maxGridY && gridArray[diag1GridX][diag1GridY] !== -1 && blocks[gridArray[diag1GridX][diag1GridY]].waiting === false && (blocks[gridArray[diag1GridX][diag1GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag1GridX][diag1GridY]].oldDirection === diag1Direction) {
            processEffects(blockref, gridArray[diag1GridX][diag1GridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 2 collision
        else if (diag2GridX >= config.minGridX && diag2GridY >= config.minGridY && diag2GridX <= config.maxGridX && diag2GridY <= config.maxGridY && gridArray[diag2GridX][diag2GridY] !== -1 && blocks[gridArray[diag2GridX][diag2GridY]].waiting === false && (blocks[gridArray[diag2GridX][diag2GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag2GridX][diag2GridY]].oldDirection === diag2Direction) {
            processEffects(blockref, gridArray[diag2GridX][diag2GridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        } else
            return direction;
    };

    return {
        process: process,
        processEffects: processEffects
    };

}();

startSyncCounter = function() {
    var dir,
        running = true,
        syncounter = -config.blockSize;
    //blocklength;



    (function syncCounter() {
        //console.log(config.cnt);
        //blocklength = blocks.length;

        if ((config.pause === 1 && config.advance === 1) || config.pause === -1) {
            if (syncounter == config.blockSize) {
                if (config.cnt !== 0) {
                    //update oldDirection, direction and queue flag
                    for (var n = 0; n < config.cnt; n++) {
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
                    for (var l = 0; l < config.cnt; l++) {
                        dir = collisions.process(blocks[l].direction, blocks[l].gridX, blocks[l].gridY, l, true);
                        blocks[l].direction = blocks[l].newDirection = dir;
                    }

                    //Update oldDirection for second collision
                    for (var k = 0; k < config.cnt; k++) {
                        blocks[k].oldDirection = blocks[k].direction;
                    }

                    //second collision check
                    for (var o = 0; o < config.cnt; o++) {
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
                    for (var m = 0; m < config.cnt; m++) {
                        if (blocks[m].direction == "up" && blocks[m].waiting === false && blocks[m].gridY > 1 && gridArray[blocks[m].gridX][blocks[m].gridY - 1] === -1 && gridArray[blocks[m].gridX][blocks[m].gridY - 2] !== -1 && blocks[gridArray[blocks[m].gridX][blocks[m].gridY - 2]].waiting === false && blocks[gridArray[blocks[m].gridX][blocks[m].gridY - 2]].direction === "down") {
                            blocks[m].halfpoint = blocks[m].posY - (config.blockSize / 2);
                        }
                        if (blocks[m].direction == "down" && blocks[m].waiting === false && blocks[m].gridY < config.gridHeight - 2 && gridArray[blocks[m].gridX][blocks[m].gridY + 1] === -1 && gridArray[blocks[m].gridX][blocks[m].gridY + 2] !== -1 && blocks[gridArray[blocks[m].gridX][blocks[m].gridY + 2]].waiting === false && blocks[gridArray[blocks[m].gridX][blocks[m].gridY + 2]].direction === "up") {
                            blocks[m].halfpoint = blocks[m].posY + (config.blockSize / 2);
                        }
                        if (blocks[m].direction == "left" && blocks[m].waiting === false && blocks[m].gridX > 1 && gridArray[blocks[m].gridX - 1][blocks[m].gridY] === -1 && gridArray[blocks[m].gridX - 2][blocks[m].gridY] !== -1 && blocks[gridArray[blocks[m].gridX - 2][blocks[m].gridY]].waiting === false && blocks[gridArray[blocks[m].gridX - 2][blocks[m].gridY]].direction === "right") {
                            blocks[m].halfpoint = blocks[m].posX - (config.blockSize / 2);
                        }
                        if (blocks[m].direction == "right" && blocks[m].waiting === false && blocks[m].gridX < config.gridWidth - 2 && gridArray[blocks[m].gridX + 1][blocks[m].gridY] === -1 && gridArray[blocks[m].gridX + 2][blocks[m].gridY] !== -1 && blocks[gridArray[blocks[m].gridX + 2][blocks[m].gridY]].waiting === false && blocks[gridArray[blocks[m].gridX + 2][blocks[m].gridY]].direction === "left") {
                            blocks[m].halfpoint = blocks[m].posX + (config.blockSize / 2);
                        }
                    }
                }
                syncounter = 0;
            }

            /////set block direction play note on collision
            for (var i = 0; i < config.cnt; i++) {
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
            for (var q = 0; q < config.cnt; q++) {
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
        // MIDI.loadPlugin({
        //     soundfontUrl: "./soundfont/",
        //     instruments: ["acoustic_grand_piano", "steel_drums", "tinkle_bell"],
        //     callback: function() {
        //         MIDI.programChange(0, 0);
        //         MIDI.programChange(1, 114);
        //         MIDI.programChange(2, 112);
        //         console.log("loaded");
        //     }
        // });
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
        jqueryMap = {
            $select: $(".block-type-select"),
            $mode_select: $(".modeSelect li")
        },

        buttons = {
            pause: document.getElementById("pause"),
            advance: document.getElementById("advance"),
            clear: document.getElementById("clearall"),
            selectAll: document.getElementById("selectall"),
            //changeBlockType: document.getElementById("changetype")
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
        setParams, getActivePanel, createDial, getMultiplier,
        start_octave = 2,
        multiplier = (start_octave * 12) - 1;

    createDial = function(arg_map) {
        var
            obj = arg_map.obj,
            min = arg_map.min,
            max = arg_map.max,
            start_val = arg_map.start_val,
            type = arg_map.type,
            params = arg_map.params,
            effect_type = arg_map.effect_type || null;

        obj.val(start_val)
            .knob({
                'min': min,
                'max': max,
                'fgColor': knobparams.fgColor,
                'bgColor': knobparams.bgColor,
                'width': knobparams.width,
                'thickness': knobparams.thickness,
                'cursor': knobparams.cursor,
                'height': knobparams.height,
                'change': function(v) {
                    var value = v;
                    if ((v % 1) >= 0.5) {
                        value = Math.ceil(v);
                    } else {
                        value = Math.floor(v);
                    }
                    if (type === "music-block") {
                        if (params === "note") {
                            musicBlockPanel.updatePianoRoll({
                                value: value
                            });
                        }
                        musicBlockPanel.setParams(params, value);
                    } else {
                        if (effect_type === 'note') {
                            effectBlockPanel.updatePianoRoll({
                                params: params,
                                value: value
                            });
                        }
                        effectBlockPanel.setParams(effect_type, params, value);
                    }
                },
                'release': function(v) {
                    var value = v;
                    if ((v % 1) >= 0.5) {
                        value = Math.ceil(v);
                    } else {
                        value = Math.floor(v);
                    }
                    effectBlockPanel.compareDialValues(effect_type, params, value);
                }
            });
    };
    getMultiplier = function() {
        return multiplier;
    };

    getActivePanel = function() {
        var active = jqueryMap.$select.find("li.active").attr("id");
        return active;
    };

    jqueryMap.$select.find("li").click(function() {
        var type = $(this).attr("id");
        $("div." + type).show().siblings("div").hide();
        $(this).addClass("active").siblings().removeClass("active");
        if (type == "block-music") {
            musicBlockPanel.updatePianoRoll();
        } else {
            effectBlockPanel.updatePianoRoll();
        }
    });

    jqueryMap.$mode_select.click(function() {
        var mode = $(this).attr("id");
        $(this).addClass("active").siblings().removeClass("active");
        config.mode = mode;
    });




    // Mode buttons
    buttons.pause.addEventListener("click", function() {
        config.pause = config.pause * -1;
    });

    buttons.advance.addEventListener("click", function() {
        config.advance *= -1;
    });

    buttons.clear.addEventListener("click", function() {
        for (var i = 0; i < config.cnt; i++) {
            blocks[i].removeBlock();
            i--;
        }
    });

    // buttons.changeBlockType.addEventListener("click", function() {
    //     changeBlockType();
    // });

    buttons.selectAll.addEventListener("click", function() {
        // var blocklength = blocks.length;
        for (var i = 0; i < config.cnt; i++) {
            blocks[i].selectBlock();
        }
    });

    return {
        //   setParams: setParams,
        createDial: createDial,
        getActivePanel: getActivePanel,
        getMultiplier: getMultiplier
    };
}();




musicBlockPanel = function() {
    var
    // Cache jquery selectors for better performance
        jqueryMap = {
            $note_knob: $("#note"),
            $volume_knob: $("#volume"),
            $duration_knob: $("#duration"),
            $velocity_knob: $("#velocity"),
            $select_direction: $("#select-direction"),
            $piano_key: $(".piano-wrapper li"),
            $set_instrument: document.getElementById("set-instrument"),
            $send_blocks: document.getElementById("send-blocks")
        },
        startVal = {
            note: 60,
            volume: 60,
            velocity: 60,
            duration: 40
        },
        configMap = {
            note: null,
            volume: null,
            duration: null,
            velocity: null,
            instrument: null,
            direction: null
        },
        getDirection, setDirection, getPanelValues, updatePianoRoll, sendBlocks,
        setToBlock, setParams,
        multiplier = controlPanel.getMultiplier();

    // Create Music Block Dials
    controlPanel.createDial({
        obj: jqueryMap.$note_knob,
        start_val: startVal.note,
        type: "music-block",
        params: "note",
        min: 24,
        max: 107
    });
    controlPanel.createDial({
        obj: jqueryMap.$volume_knob,
        start_val: startVal.volume,
        type: "music-block",
        params: "volume",
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: jqueryMap.$velocity_knob,
        start_val: startVal.velocity,
        type: "music-block",
        params: "velocity",
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: jqueryMap.$duration_knob,
        start_val: startVal.duration,
        type: "music-block",
        params: "duration",
        min: 1,
        max: 120
    });


    setDirection = function(d) {
        jqueryMap.$select_direction.find("li#" + d).addClass("active").siblings().removeClass("active");
    };
    getDirection = function() {
        return jqueryMap.$select_direction.find("li.active").attr("id");
    };
    setParams = function(type, value) {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type == "block-music") {
                blocks[i].setMidiValues(type, value);
            }
        }
    };
    getPanelValues = function() {
        // These are all strings, may need to use parseInt
        configMap.volume = jqueryMap.$volume_knob.val();
        configMap.duration = jqueryMap.$duration_knob.val();
        configMap.note = parseInt(jqueryMap.$note_knob.val(), 0);
        configMap.velocity = jqueryMap.$velocity_knob.val();
        configMap.instrument = jqueryMap.$set_instrument.value;
        configMap.direction = getDirection();

        return {
            configMap: configMap
        };
    };
    sendBlocks = function() {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type === config.musicBlockType) {
                blocks[i].newDirection = blocks[i].staticDirection;
                blocks[i].speed = config.speed;
            }
        }
    };

    // Sync the piano roll to the note knob (auto run on load)
    updatePianoRoll = (function update() {
        if (arguments.length >= 1) {
            value = arguments[0].value - multiplier;
        } else {
            value = jqueryMap.$note_knob.val() - multiplier;
        }

        jqueryMap.$piano_key.eq(value - 1).addClass("active").siblings().removeClass('active');
        jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');

        return update;
    }());



    // Update control panel UI to selected music block values
    setToBlock = function(num) {
        jqueryMap.$note_knob.val(blocks[num].note);
        jqueryMap.$note_knob.trigger('change');
        jqueryMap.$volume_knob.val(blocks[num].volume);
        jqueryMap.$volume_knob.trigger('change');
        jqueryMap.$duration_knob.val(blocks[num].duration);
        jqueryMap.$duration_knob.trigger('change');
        jqueryMap.$velocity_knob.val(blocks[num].velocity);
        jqueryMap.$velocity_knob.trigger('change');
        jqueryMap.$set_instrument.value = blocks[num].program;
        setDirection(blocks[num].staticDirection);
        updatePianoRoll(blocks[num].note, 'piano-roll');
    };

    //  Click Events
    jqueryMap.$set_instrument.onchange = function() {
        var program = $(this).val();
        setParams('program', program);

        return false;
    };
    jqueryMap.$select_direction.find("li").click(function() {
        var direction = $(this).attr("id");
        $(this).addClass("active").siblings().removeClass("active");
        setParams("direction", direction);

        return false;
    });

    jqueryMap.$piano_key.click(function() {
        var
            type = controlPanel.getActivePanel();

        // If music block panel not selected don't run this functionality
        if (type == "block-music") {
            var
                index = $(this).index(),
                roll_index = ($(this).parent().index()) * 12,
                value = (index + roll_index) + (multiplier + 1);

            $(this).addClass("active").siblings().removeClass('active');
            $(this).parent().siblings().find('li').removeClass('active');
            setParams("note", value);

            // Update note knob values
            jqueryMap.$note_knob.val(value);
            jqueryMap.$note_knob.trigger('change');

            return false;
        }
    });

    jqueryMap.$send_blocks.addEventListener("mousedown", sendBlocks, false);

    return {
        setToBlock: setToBlock,
        updatePianoRoll: updatePianoRoll,
        setParams: setParams,
        getPanelValues: getPanelValues,
    };
}();


effectBlockPanel = function() {
    var
        jqueryMap = {
            $select_effect: $(".effect-select"),
            $limit_range: $('.limit-range'),
            $step_switch: $('.switch'),
            $piano_key: $('.piano-wrapper li'),
            $piano_roll: $('.piano-roll'),
            $black_key: $('.blackkey'),
            $white_key: $('.whitekey'),
            $range_indicator: $('.range-indicator')
        },
        effectMap, toggleEffectMethod, getPanelValues, setParams, setPianoRoll, compareValues,
        effectArray = ["note", "volume", "velocity", "duration"],
        configMap = {
            note: null,
            volume: null,
            velocity: null,
            duration: null
        },
        startVal = {
            prog_high: 60,
            prog_low: 30,
            rand_high: 60,
            rand_low: 30,
            specific: 60
        },
        multiplier = controlPanel.getMultiplier(),
        black_key_width = jqueryMap.$black_key.outerWidth(),
        white_key_width = jqueryMap.$white_key.outerWidth();

    setParams = function(type, attr, value) {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type == "block-effect") {
                blocks[i].setMidiValues(type, attr, value);
            }
        }
    };

    compareDialValues = function(effect_type, param, value) {
        var param2 = null;
        getPanelValues();

        if (param === 'rand_high' || param === 'prog_high') {
            param2 = param.replace("high", "low");

            if (value < configMap[effect_type][param2]) {
                jqueryMap[effect_type + "_" + param2].val(configMap[effect_type][param] - 1);
                jqueryMap[effect_type + "_" + param2].trigger('change');

                if (effect_type === 'note') {
                    updatePianoRoll();
                }
            }
        }
        if (param === 'rand_low' || param === 'prog_low') {
            param2 = param.replace("low", "high");
            if (value > configMap[effect_type][param2]) {
                jqueryMap[effect_type + "_" + param2].val(configMap[effect_type][param] + 1);
                jqueryMap[effect_type + "_" + param2].trigger('change');

                if (effect_type === 'note') {
                    updatePianoRoll();
                }
            }
        }
    };

    toggleEffectMethod = function(effect, load) {
        var
            split = effect.split("-"),
            type = split[0],
            method = split[1],
            setActive;

        // Hide and show effect method    
        $("." + effect).show().siblings("div").hide();

        // Set configMap method type for each effect type on load
        if (load === true) {
            configMap[type].method = method;
        } else {
            updatePianoRoll();
        }
        setParams(type, 'method', method);
    };


    // Set active effects when clicking effect type button
    setActiveEffects = function(obj, type) {
        if (obj.hasClass("active")) {
            configMap[type].active = true;
            if (type === 'note') {
                updatePianoRoll();
            }
        } else {
            configMap[type].active = false;
            if (type === 'note') {
                jqueryMap.$piano_key.removeClass('active');
                jqueryMap.$range_indicator.hide();
            }
        }

        setParams(type, 'active', configMap[type].active);
    };
    updatePianoRoll = function() {
        var
            valueMap = {},
            attr = null,
            value = null,
            params = null,
            setActive,
            pos_high,
            pos_low,
            method = jqueryMap.note_effect_select.val();


        setActive = function(attr) {
            var index_high, index_low,
                width = $('.piano-roll').width(),
                pos_high,
                pos_low;

            if (attr === 'both') {
                jqueryMap.$piano_key.removeClass('active');
                jqueryMap.$range_indicator.show();
            }
            if (attr === 'high' || attr === 'both') {
                jqueryMap.$piano_key.eq(valueMap.high - 1).addClass("active-high").siblings().removeClass('active-high');
                jqueryMap.$piano_key.eq(valueMap.high - 1).parent().siblings().find('li').removeClass('active-high');
                if (jqueryMap.$piano_key.eq(valueMap.high - 1).hasClass('blackkey')) {
                    width_add = black_key_width;
                } else {
                    width_add = white_key_width;
                }

            }
            if (attr === 'low' || attr === 'both') {
                jqueryMap.$piano_key.eq(valueMap.low - 1).addClass("active-low").siblings().removeClass('active-low');
                jqueryMap.$piano_key.eq(valueMap.low - 1).parent().siblings().find('li').removeClass('active-low');
            }

            // Set high and low position of range-indicator
            index_high = jqueryMap.$piano_roll.find('.active-high').parent().index() * width;
            index_low = jqueryMap.$piano_roll.find('.active-low').parent().index() * width;
            pos_high = jqueryMap.$piano_roll.find('.active-high').position();
            pos_high = pos_high.left + index_high;
            pos_low = jqueryMap.$piano_roll.find('.active-low').position();
            pos_low = pos_low.left + index_low;

            jqueryMap.$range_indicator.css({
                'width': pos_high - pos_low + width_add,
                'left': pos_low
            });
        };

        if (arguments.length >= 1) {
            value = arguments[0].value - multiplier;
            params = arguments[0].params;
        }

        if (method === 'note-specific') {
            jqueryMap.$piano_key.removeClass('active-high active-low');
            jqueryMap.$range_indicator.hide();
            if (value === null) {
                value = jqueryMap.note_specific.val() - multiplier;
            }
            jqueryMap.$piano_key.eq(value - 1).addClass("active").siblings().removeClass('active');
            jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');
        } else {
            if (method === 'note-random') {

                if (value === null) {
                    valueMap['high'] = jqueryMap.note_rand_high.val() - multiplier;
                    valueMap['low'] = jqueryMap.note_rand_low.val() - multiplier;
                    setActive('both');
                } else {
                    attr = params.split("_");
                    valueMap[attr[1]] = value;
                    setActive(attr[1]);
                }
            } else {
                if (value === null) {
                    valueMap['high'] = jqueryMap.note_prog_high.val() - multiplier;
                    valueMap['low'] = jqueryMap.note_prog_low.val() - multiplier;
                    setActive('both');
                } else {
                    attr = params.split("_");
                    valueMap[attr[1]] = value;
                    setActive(attr[1]);
                }
            }
        }
    };

    // Loop through and get effect panel values and return as configMap
    getPanelValues = function() {
        var method_type,
            type,
            mapkey;

        for (var key in configMap) {
            mapkey = configMap[key];
            method_type = jqueryMap[mapkey.type + "_effect_select"].val();
            method_type = method_type.replace(mapkey.type + "-", "");
            mapkey.method = method_type;
            mapkey.specific = parseInt(jqueryMap[mapkey.type + "_specific"].val(), 0);
            mapkey.rand_low = parseInt(jqueryMap[mapkey.type + "_rand_low"].val(), 0);
            mapkey.rand_high = parseInt(jqueryMap[mapkey.type + "_rand_high"].val(), 0);
            mapkey.prog_low = parseInt(jqueryMap[mapkey.type + "_prog_low"].val(), 0);
            mapkey.prog_high = parseInt(jqueryMap[mapkey.type + "_prog_high"].val(), 0);
            mapkey.step = parseInt(jqueryMap[mapkey.type + "_step_size"].val(), 0);
            mapkey.direction = jqueryMap[mapkey.type + "_step_switch"].attr('data-direction');
            mapkey.limit_range = jqueryMap[mapkey.type + "_limit_range"].attr('data-limit-range');
        }
        return {
            configMap: configMap
        };
    };

    // Set effect control panel values from block configMap
    setToBlock = function(num) {
        var map = blocks[num].configMap;

        for (var key in map) {

            // Set active effects
            if (map[key].active === true) {
                $('.toggle-' + key).children().addClass('active');
                $(".effect-" + key).show();
            } else {
                $('.toggle-' + key).children().removeClass('active');
                $('.effect-' + key).hide();
            }

            // Set active effect method
            $('#select-' + key + '-effect').val(key + '-' + map[key].method);
            $("." + key + '-' + map[key].method).show().siblings("div").hide();

            jqueryMap[key + '_specific'].val(map[key].specific);
            jqueryMap[key + '_specific'].trigger('change');
            jqueryMap[key + '_rand_low'].val(map[key].rand_low);
            jqueryMap[key + '_rand_low'].trigger('change');
            jqueryMap[key + '_rand_high'].val(map[key].rand_high);
            jqueryMap[key + '_rand_high'].trigger('change');
            jqueryMap[key + '_prog_low'].val(map[key].prog_low);
            jqueryMap[key + '_prog_low'].trigger('change');
            jqueryMap[key + '_prog_high'].val(map[key].prog_high);
            jqueryMap[key + '_prog_high'].trigger('change');
            jqueryMap[key + '_step_switch'].attr('data-direction', map[key].direction);
            jqueryMap[key + '_step_size'].spinner("value", map[key].step);
            jqueryMap[key + '_limit_range'].attr('data-limit-range', map[key].limit_range);
            if (key === 'note') {
                if (map[key].active === false) {
                    jqueryMap.$piano_key.removeClass('active');
                    jqueryMap.$range_indicator.hide();
                } else {
                    updatePianoRoll();
                }
            }
        }
    };


    // Loop through all effect types and create jqueryMap, UI controls
    effectMap = (function(e) {
        var length = effectArray.length;

        for (var i = 0; i < length; i++) {
            jqueryMap[e[i] + "_effect"] = $(".effect-" + e[i]);
            jqueryMap[e[i] + "_effect_select"] = $("#select-" + e[i] + "-effect");
            jqueryMap[e[i] + "_specific"] = $("#" + e[i] + "-specific-effect");
            jqueryMap[e[i] + "_rand_low"] = $("." + e[i] + "-rand-rangelow-effect");
            jqueryMap[e[i] + "_rand_high"] = $(("." + e[i] + "-rand-rangehigh-effect"));
            jqueryMap[e[i] + "_prog_low"] = $("." + e[i] + "-prog-rangelow-effect");
            jqueryMap[e[i] + "_prog_high"] = $(("." + e[i] + "-prog-rangehigh-effect"));
            jqueryMap[e[i] + "_step_size"] = $(("." + e[i] + "-step-size"));
            jqueryMap[e[i] + "_step_switch"] = $(("." + e[i] + "-step-switch"));
            jqueryMap[e[i] + "_limit_range"] = $(("." + e[i] + "-limit-to-range"));

            //   obj, startVal, type, params, min, max
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_specific"],
                start_val: startVal.specific,
                type: "effect-block",
                params: "specific",
                effect_type: e[i],
                min: 24,
                max: 107
            });
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_rand_low"],
                start_val: startVal.rand_low,
                type: "effect-block",
                params: "rand_low",
                effect_type: e[i],
                min: 24,
                max: 107
            });
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_rand_high"],
                start_val: startVal.rand_high,
                type: "effect-block",
                params: "rand_high",
                effect_type: e[i],
                min: 24,
                max: 107
            });
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_prog_low"],
                start_val: startVal.prog_low,
                type: "effect-block",
                params: "prog_low",
                effect_type: e[i],
                min: 24,
                max: 107
            });
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_prog_high"],
                start_val: startVal.prog_high,
                type: "effect-block",
                params: "prog_high",
                effect_type: e[i],
                min: 24,
                max: 107
            });


            jqueryMap[e[i] + "_step_size"]
                .spinner({
                    min: 0,
                    max: 10,
                    spin: function(event, ui) {
                        var type = ($(this).data().type);

                        setParams(type, 'step', ui.value);
                    }
                })
                .val(3);

            // Create configMap with null values to store effect panel states    
            configMap[e[i]] = {
                type: e[i],
                active: true,
                method: 'null',
                specific: null,
                rand_low: null,
                rand_high: null,
                limit_range: null,
                prog_high: null,
                prog_low: null,
                step: null,
                direction: 'null'
            };

            // Set active effects on configMap based on type
            setActiveEffects($(".toggle-" + e[i]).find('span'), e[i]);

            // Show effect method panel based on selection on load
            toggleEffectMethod(jqueryMap[e[i] + "_effect_select"].val(), true);
        }

    })(effectArray);


    // Hide/ Show effect type on select menu change
    $("#select-note-effect, #select-volume-effect, #select-velocity-effect, #select-duration-effect").change(function() {
        toggleEffectMethod($(this).val());
        return false;
    });

    // Step direction switch toggle 
    jqueryMap.$step_switch.click(function() {
        var
            selector = $(this),
            type = $(this).data().type,
            direction = $(this).attr('data-direction');

        if (direction === 'down') {
            $(this).attr('data-direction', 'up');
            direction = 'up';

        } else {
            $(this).attr('data-direction', 'down');
            direction = 'down';
        }

        setParams(type, 'direction', direction);
        return false;
    });

    // Limit range toggle
    jqueryMap.$limit_range.click(function() {
        var
            type = $(this).data().type,
            limit = $(this).attr('data-limit-range');

        if (limit === 'true') {
            $(this).attr('data-limit-range', 'false');
            limit = false;
        } else {
            limit = true;
            $(this).attr('data-limit-range', 'true');
        }

        setParams(type, 'limit_range', limit);

        return false;
    });

    // Show / Hide effects on click
    jqueryMap.$select_effect.find("li").click(function() {
        var
            val = $(this).attr('class'),
            selector = $(this).find("span"),
            type = $(this).data().type;

        val = val.replace('toggle', 'effect');
        if (selector.hasClass('active')) {
            $("." + val).slideUp();
            selector.removeClass('active');
        } else {
            $("." + val).slideDown().prependTo('.effect-wrapper');
            selector.addClass('active');
        }
        setActiveEffects(selector, type);

        return false;
    });

    jqueryMap.$piano_key.click(function() {
        var
            type = controlPanel.getActivePanel();

        function getValue(obj) {
            var
                index = obj.index(),
                roll_index = (obj.parent().index()) * 12,
                value = (index + roll_index) + (multiplier + 1);

            return value;
        }

        function update(type) {
            if (active_high < active_low) {
                jqueryMap['note_' + type + '_high'].val(value);
                jqueryMap['note_' + type + '_high'].trigger('change');
                updatePianoRoll({
                    value: value,
                    params: type + '_high'
                });
                setParams('note', type + '_high', value);
            } else {
                jqueryMap['note_' + type + '_low'].val(value);
                jqueryMap['note_' + type + '_low'].trigger('change');
                updatePianoRoll({
                    value: value,
                    params: type + '_low'
                });
                setParams('note', type + '_low', value);
            }
        }

        // If effect block panel not selected don't run this functionality
        if (type === "block-effect") {
            var
                value = getValue($(this)),
                active_high = getValue($('.active-high')),
                active_low = getValue($('.active-low'));

            // Used to determine if selected piano key is closer to active high or active low
            active_high = Math.abs(value - active_high);
            active_low = Math.abs(value - active_low);

            switch (configMap.note.method) {
                case 'specific':
                    $(this).addClass("active").siblings().removeClass('active');
                    $(this).parent().siblings().find('li').removeClass('active');
                    setParams('note', 'specific', value);
                    jqueryMap.note_specific.val(value);
                    jqueryMap.note_specific.trigger('change');
                    break;
                case 'random':
                    update('rand');
                    break;
                case 'progression':
                    update('prog');
                    break;
            }
        }


        return false;
    });

    return {
        getPanelValues: getPanelValues,
        setToBlock: setToBlock,
        setParams: setParams,
        updatePianoRoll: updatePianoRoll,
        compareDialValues: compareDialValues

    };
}();



setGridEvents = function() {
    var
        mousedownX = -1,
        mousedownY = -1,
        blockDragLeftX = config.gridWidth,
        blockDragLeftY = config.gridHeight,
        blockDragWidth = 0,
        blockDragHeight = 0,
        blockDragOffsetX = 0,
        blockDragOffsetY = 0,
        gridCheck = false,
        resetBlockDrag,
        mouselocation,
        setStyles,
        compareMouse,
        mouseDrag,
        mouseUp,
        mouseDown,
        addBlock,
        elements = {
            section: document.getElementById("grid"),
        };

    resetBlockDrag = function() {
        blockDragLeftX = config.blockSize;
        blockDragLeftY = config.blockSize;
        blockDragRightX = 0;
        blockDragRightY = 0;
    }();

    setStyles = function(propertyObject) {
        var elem = document.getElementById("dragbox");
        for (var property in propertyObject) {
            elem.style[property] = propertyObject[property];
        }
    };

    compareMouse = function(e) {
        if (gridify(mousedownX) === gridify(e.pageX - config.gridOffsetX) && gridify(mousedownY) === gridify(e.pageY - config.gridOffsetY) && config.draggingBlocks === false) {
            return "same";
        } else {
            return "different";
        }
    };

    // Temporary Center app in browser window
    getPos = function() {
        //Center app in middle of screen
        // $("#wrapper").css({
        //     "width": "1000px",
        //     "top": "50px"
        // });
        config.gridOffsetX = $("#grid").offset().left;
        config.gridOffsetY = $("#grid").offset().top;

        // console.log("xoffset " + config.gridOffsetX);
        // console.log("yoffset " + config.gridOffsetY);

    };

    mouseDrag = function(e) {
        e = e || window.event;
        mouselocation = compareMouse(e);
        if (mouselocation == "different") {
            var
                mousedowngridX = gridify(mousedownX),
                mousedowngridY = gridify(mousedownY),
                blockDragRightX,
                blockDragRightY;

            if (gridArray[mousedowngridX][mousedowngridY] != -1 && blocks[gridArray[mousedowngridX][mousedowngridY]].selected === true && config.draggingBlocks === false) {
                config.draggingBlocks = true;
                config.pause = 1;

                blockDragRightX = 0;
                blockDragRightY = 0;
                //Set the bounds of the blocks being dragged
                for (var i = 0; i < config.cnt; i++) {
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
                for (var j = 0; j < config.cnt; j++) {
                    if (blocks[j].selected === true) {
                        blocks[j].dragOffsetX = blocks[j].gridX - blockDragLeftX;
                        blocks[j].dragOffsetY = blocks[j].gridY - blockDragLeftY;
                    }
                }
            }

            if (config.draggingBlocks === true) {
                //Check for new blockDrag positions being outside the grid
                var
                    gridpos = gridify(e.pageX - config.gridOffsetX) - blockDragOffsetX,
                    validMove = true;
                if (gridpos + blockDragWidth < config.gridWidth && gridpos >= 0) {
                    blockDragLeftX = gridpos;
                }

                gridpos = gridify(e.pageY - config.gridOffsetY) - blockDragOffsetY;
                if (gridpos + blockDragHeight < config.gridHeight && gridpos >= 0) {
                    blockDragLeftY = gridpos;
                }

                validMove = true;

                //Check all blocks if their new position conflicts with existing blocks
                for (var k = 0; k < config.cnt; k++) {
                    if (blocks[k].selected === true && gridArray[blockDragLeftX + blocks[k].dragOffsetX][blockDragLeftY + blocks[k].dragOffsetY] !== -1 && blocks[gridArray[blockDragLeftX + blocks[k].dragOffsetX][blockDragLeftY + blocks[k].dragOffsetY]].selected === false) {
                        validMove = false;
                    }
                }

                //Update block positions based on the drag block
                if (validMove === true) {
                    for (var l = 0; l < config.cnt; l++) {
                        if (blocks[l].selected === true) {
                            //Update gridArray to remove block from previous locations
                            gridArray[blocks[l].prevgridX][blocks[l].prevgridY] = -1;
                            gridArray[blocks[l].gridX][blocks[l].gridY] = -1;

                            //set the new position
                            blocks[l].gridX = blocks[l].prevGridX = blocks[l].dragOffsetX + blockDragLeftX;
                            blocks[l].gridY = blocks[l].prevGridY = blocks[l].dragOffsetY + blockDragLeftY;
                            blocks[l].posX = blocks[l].gridX * config.blockSize;
                            blocks[l].posY = blocks[l].gridY * config.blockSize;

                            //Update the new gridArray location
                            gridArray[blocks[l].gridX][blocks[l].gridY] = l;
                            blocks[l].direction = "none";
                            blocks[l].updatePosition();
                        }
                    }
                }
            }

            if (config.draggingBlocks === false) {

                if (config.mode === "create") {
                    var
                        gridX = gridify(e.pageX - config.gridOffsetX),
                        gridY = gridify(e.pageY - config.gridOffsetY),
                        activePanel = controlPanel.getActivePanel();

                    // Add music block to the grid 
                    // addBlock(gridX, gridY, config.newBlockType);
                    addBlock(gridX, gridY, activePanel);



                } else {
                    var move_x = e.pageX - config.gridOffsetX,
                        move_y = e.pageY - config.gridOffsetY,
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
    };

    // Compares mouseup location with mousedown, calls old click function if same, drag select if not
    mouseUp = function(e) {

        if (gridCheck === true) {
            if (config.mode === "select") {
                elements.section.removeChild(dragbox);
            }

            if (config.draggingBlocks === true) {
                config.draggingBlocks = false;
                config.pause = -1;
                blockDragLeftX = config.gridWidth;
                blockDragLeftY = config.gridHeight;
                blockDragWidth = 0;
                blockDragHeight = 0;
            } else {
                var
                    leftX = Math.min(mousedownX, e.pageX - config.gridOffsetX),
                    rightX = Math.max(mousedownX, e.pageX - config.gridOffsetX),
                    topY = Math.min(mousedownY, e.pageY - config.gridOffsetY),
                    bottomY = Math.max(mousedownY, e.pageY - config.gridOffsetY),
                    blockref;

                leftX = gridify(leftX);
                rightX = Math.ceil(rightX / config.blockSize);
                topY = gridify(topY);
                bottomY = Math.ceil(bottomY / config.blockSize);
                blockref = gridArray[leftX][topY];
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
                        var activePanel = controlPanel.getActivePanel();
                        //addBlock(leftX, topY, config.newBlockType);
                        addBlock(leftX, topY, activePanel);

                    } else if (config.mode === "select") {
                        for (var i = 0; i < config.cnt; i++) {
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
                            for (var q = 0; q < config.cnt; q++) {
                                blocks[q].deselectBlock();
                            }
                        }

                        //Select all blocks in the dragbox
                        var
                            cnt = 0,
                            t,
                            gridX,
                            gridY;
                        for (var p = 0; p < config.cnt; p++) {
                            gridX = blocks[p].gridX;
                            gridY = blocks[p].gridY;

                            if (gridX < rightX && gridX >= leftX && gridY < bottomY && gridY >= topY) {

                                blocks[p].selectBlock();
                                t = p;
                                cnt++;


                            }
                        }
                        if (cnt === 1) {
                            //controlPanel.setToBlock(t);
                            musicBlockPanel.setToBlock(mblockref);
                        } else {
                            //controlPanel.setToBlock(t);
                            // controlPanel.setDefault();
                        }
                    }
                }
            }

            config.newblock = -1;
            mousedownX = -1;
            mousedownY = -1;

            gridCheck = false;

            //Remove drag event on mouseup
            elements.section.removeEventListener("mousemove", mouseDrag);
        }
    };

    //Add mousedown listener, tracks positions and resets selection to 0
    mouseDown = function(e) {

        getPos();

        var dragbox,
            activePanel = controlPanel.getActivePanel();

        mouselocation = compareMouse(e);


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
        // console.log("X: " + e.pageX + "  " + (e.pageX - config.gridOffsetX));
        mousedownX = Math.min(e.pageX - config.gridOffsetX, config.blockSize * config.gridWidth);
        mousedownY = Math.min(e.pageY - config.gridOffsetY, config.blockSize * config.gridHeight);

        if (config.mode === "create") {
            //addBlock(gridify(mousedownX), gridify(mousedownY), config.newBlockType);
            addBlock(gridify(mousedownX), gridify(mousedownY), activePanel);

        }

        //Add drag event on mousedown
        elements.section.addEventListener('mousemove', mouseDrag, false);
    };

    addBlock = function(gridX, gridY, type) {
        if (gridArray[gridX][gridY] === -1) {

            // Make new blocks based on type selected in control panel
            if (type == "block-music") {
                blocks[config.cnt] = makeMusicBlock(config.blockSize, config.blockSize, gridX * config.blockSize, gridY * config.blockSize, 0, type);
                blocks[config.cnt].setInitValues(musicBlockPanel.getPanelValues());

            } else {
                blocks[config.cnt] = makeEffectBlock(config.blockSize, config.blockSize, gridX * config.blockSize, gridY * config.blockSize, 0, type);
                blocks[config.cnt].setInitValues(effectBlockPanel.getPanelValues());
                // console.log(blocks[config.cnt].note

            }

            blocks[config.cnt].setGrid();
            blocks[config.cnt].createNode(config.cnt, type).addBlock();

            // blocks[config.cnt].tester();

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
    };

    window.addEventListener("mouseup", mouseUp, false);
    elements.section.addEventListener("mousedown", mouseDown, false);


    //REMOVE THIS once there is a block type indicator
    addBlock(0, 0, config.musicBlockType);


}();



keyboardEvents = function() {
    var stopArrow = document.getElementById("stop");

    function animateBlock(direction) {
        for (var i = 0; i < config.cnt; i++) {
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
                for (var s = 0; s < config.cnt; s++) {
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
                var out = "FULL GRID DUMPMONSTER";
                for (var i = 0; i < config.gridWidth; i++) {
                    out = out + "\n";
                    for (var j = 0; j < config.gridHeight; j++) {
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

}();