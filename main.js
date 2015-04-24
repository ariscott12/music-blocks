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
        octave: 4,
        newblock: -1,
        draggingBlocks: false,
        colorArray: ["#d27743", "#cf5a4c", "#debe4e", "#ccc"]
    },
    gridArray = new Array([]),
    blocks = [];

config.maxX = config.maxY = config.blockSize * config.gridSize;
config.maxGridX = config.maxGridY = config.gridSize - 1;
config.newBlockType = config.musicBlockType;



// Temporary Center app in browser window
// (function getPos() {
//     // Center app in middle of screen
//     $("#wrapper").css({
//         "width": "1000px",
//         "top": "50px"
//     });
//     var xoffset = $("#wrapper").offset().left,
//         yoffset = $("#wrapper").offset().top;

//     console.log("xpos "+ xoffset);
//     console.log("ypos "+ yoffset);

// })();



///Make the grid
(function makeGrid() {
    var
        section,
        section2,
        node,
        node2,
        gridH,
        gridV,
        size = config.gridSize;

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

// Music block object and methods
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

    section: document.getElementById("stage"),

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
        this.section.removeChild(node);
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
            console.log("test");
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
            //controlPanel.setToBlock(this.blocknum);
            if (this.type == "block-music") {
                musicBlockPanel.setToBlock(this.blocknum);

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
            var duration = this.duration / 120,
                note = this.note + 12 * this.octave;
            //note = this.note;


            setMidiParams.triggerMidi(this.volume, this.program, note, this.velocity, duration);
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
    block.notActive = getBlockColor(block.type);
    block.note = config.note;
    block.octave = config.octave;
    block.volume = config.volume;
    block.duration = config.duration;
    block.velocity = config.veloctiy;

    // Music Block Specfic Methods
    block.tester = function() {
        console.log("this is a music block");
    };
    block.setInitValues = function(el) {
        this.volume = el.volume;
        this.note = el.note;
        this.duration = el.duration;
        this.velocity = el.velocity;
        this.octave = el.octave;
        this.program = el.instrument;
        this.staticDirection = el.direction;

    };
    block.setMidiValues = function(type, value) {
        this[type] = value;
        // switch (type) {
        //     case "volume":
        //         this.volume = value;
        //         break;
        //     case "octave":
        //         this.octave = value;
        //         break;
        //     case "duration":
        //         this.duration = value;
        //         break;
        //     case "velocity":
        //         this.velocity = value;
        //         break;
        //     case "note":
        //         this.note = value;
        //         break;
        //     case "instrument":
        //         this.program = value;
        //         break;
        //     case "direction":
        //         this.staticDirection = value;
        //         break;
        //     default:
        //         // this.volume = value;
        //         break;
        // }
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
        var effectArray = ['note', 'volume', 'veloctiy', 'duration'];
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
        console.log(this.configMap);
    };

    block.setMidiValues = function(type, attr, value) {
        this.configMap[type][attr] = value;
        //console.log("foo");
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
        // Probably don't need this switch statement anymore
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
        // Do effect processing here
        if (blocks[eblockref].type == "block-effect") {
            
            // configMap has all attributes for effect blocks use dote notation to access values for example: blocks[eblockref].configMap.note.active

            //prints entire configMap in console.  Click on the object in the console to see all the attributes
            console.log(blocks[eblockref].configMap);

            //blocks[mblockref].note = blocks[eblockref].configMap.note.specific;


        }

        if (config.numSelected === 1 && blocks[mblockref].selected === true && eblockref.type !== config.musicBlockType) {
            //controlPanel.setToBlock(mblockref);
            //musicBlockPanel.setToBlock(mblockref);
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
        cpanel = {
            select: $(".block-type-select"),
            mode_select: $(".modeSelect li")
        },

        buttons = {
            pause: document.getElementById("pause"),
            advance: document.getElementById("advance"),
            clear: document.getElementById("clearall"),
            selectAll: document.getElementById("selectall"),
            changeBlockType: document.getElementById("changetype")
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

        changeBlockType, setParams, getActivePanel, createDial;


    changeBlockType = function() {
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
    };

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
                            musicBlockPanel.syncNoteSelection(value, "piano-roll");
                        }
                        musicBlockPanel.setParams(params, value);
                    } else {
                        effectBlockPanel.setParams(effect_type, params, value);
                    }
                    // console.log(value);
                    //setParams(type, value);

                }
            });
    };

    getActivePanel = function() {
        var active = cpanel.select.find("li.active").attr("id");
        return active;
    };

    cpanel.select.find("li").click(function() {
        var type = $(this).attr("id");
        $("div." + type).show().siblings("div").hide();
        $(this).addClass("active").siblings().removeClass("active");

    });

    cpanel.mode_select.click(function() {
        var mode = $(this).attr("id");
        $(this).addClass("active").siblings().removeClass("active");
        // mode = mode.replace("active", "");
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

    buttons.changeBlockType.addEventListener("click", function() {
        changeBlockType();
    });

    buttons.selectAll.addEventListener("click", function() {
        // var blocklength = blocks.length;
        for (var i = 0; i < config.cnt; i++) {
            blocks[i].selectBlock();
        }
    });

    return {
        //   setParams: setParams,
        createDial: createDial,
        getActivePanel: getActivePanel
    };
}();




musicBlockPanel = function() {
    var
        mblock = {
            noteknob: $("#note"),
            volumeknob: $("#volume"),
            durationknob: $("#duration"),
            velocityknob: $("#velocity"),
            octavespinner: $("#octave-spinner"),
            selectDirection: $("#select-direction"),
            pianoroll: $(".piano-roll li"),
            setInstrument: document.getElementById("set-instrument"),
            sendBlocks: document.getElementById("send-blocks")
        },
        getDirection, setDirection, getPanelValues, syncNoteSelection, sendBlocks,
        setDefault, setToBlock, setParams;

    getDirection = function() {
        return mblock.selectDirection.find("li.active").attr("id");
    };
    setDirection = function(d) {
        mblock.selectDirection.find("li#" + d).addClass("active").siblings().removeClass("active");
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
        return {
            volume: mblock.volumeknob.val(),
            duration: mblock.durationknob.val(),
            note: parseInt(mblock.noteknob.val(), 0),
            velocity: mblock.velocityknob.val(),
            instrument: mblock.setInstrument.value,
            octave: mblock.octavespinner.slider("value"),
            direction: getDirection()
        };
    };
    syncNoteSelection = function(value, type) {
        if (type === "piano-roll") {
            mblock.pianoroll.eq(value - 1).addClass("active").siblings().removeClass('active');
        } else {
            mblock.noteknob.val(value);
            mblock.noteknob.trigger('change');
        }

    };
    sendBlocks = function() {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type === config.musicBlockType) {
                blocks[i].newDirection = blocks[i].staticDirection;
                blocks[i].speed = config.speed;
            }
        }
    };
    setDefault = function() {
        mblock.noteknob.val(config.note);
        mblock.noteknob.trigger('change');
        mblock.volumeknob.val(config.volume);
        mblock.volumeknob.trigger('change');
        mblock.durationknob.val(config.duration);
        mblock.durationknob.trigger('change');
        mblock.velocityknob.val(config.velocity);
        mblock.velocityknob.trigger('change');
        mblock.octavespinner.slider("value", config.octave);
        mblock.octavespinner.find("input").val(config.octave);
        setDirection("up");
    };
    setToBlock = function(num) {
        mblock.noteknob.val(blocks[num].note);
        mblock.noteknob.trigger('change');
        mblock.volumeknob.val(blocks[num].volume);
        mblock.volumeknob.trigger('change');
        mblock.durationknob.val(blocks[num].duration);
        mblock.durationknob.trigger('change');
        mblock.velocityknob.val(blocks[num].velocity);
        mblock.velocityknob.trigger('change');
        mblock.octavespinner.slider("value", blocks[num].octave);
        mblock.octavespinner.find("input").val(blocks[num].octave);
        mblock.setInstrument.value = blocks[num].program;
        setDirection(blocks[num].staticDirection);
    };


    // Create Music Block Dials
    controlPanel.createDial({
        obj: mblock.noteknob,
        start_val: config.note,
        type: "music-block",
        params: "note",
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: mblock.volumeknob,
        start_val: config.volume,
        type: "music-block",
        params: "volume",
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: mblock.velocityknob,
        start_val: config.velocity,
        type: "music-block",
        params: "velocity",
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: mblock.durationknob,
        start_val: config.duration,
        type: "music-block",
        params: "duration",
        min: 1,
        max: 120
    });


    mblock.setInstrument.onchange = function() {
        var program = $(this).val();
        setParams("instrument", program);
        return false;
    };
    mblock.selectDirection.find("li").click(function() {
        var direction = $(this).attr("id");
        $(this).addClass("active").siblings().removeClass("active");
        setParams("direction", direction);
    });
    mblock.octavespinner.slider({
        orientation: "vertical",
        value: config.octave,
        min: 0,
        max: 7,
        step: 1,
        range: "min",
        slide: function(event, ui) {
            mblock.octavespinner.find("input").val(ui.value);
            setParams("octave", ui.value);
        }
    });
    mblock.octavespinner.find("input").val(config.octave);
    mblock.pianoroll.click(function() {
        var index = $(this).index() + 1;
        $(this).addClass("active").siblings().removeClass('active');
        setParams("note", index);
        syncNoteSelection(index, "dial");

    });
    mblock.sendBlocks.addEventListener("mousedown", sendBlocks, false);

    return {
        setToBlock: setToBlock,
        syncNoteSelection: syncNoteSelection,
        setDefault: setDefault,
        setParams: setParams,
        getPanelValues: getPanelValues
            // mblock: mblock
    };
}();


effectBlockPanel = function() {
    var
        eblock = {
            select_effect: $(".effect-select"),
            limit_range: $('.limit-range'),
            step_switch: $('.switch')

        },
        effectMap,
        toggleEffectMethod, getPanelValues, setParams,
        effectArray = ["note", "volume", "velocity", "duration"],
        configMap = {
            note: null,
            volume: null,
            velocity: null,
            duration: null
        };

    setParams = function(type, attr, value) {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type == "block-effect") {
                blocks[i].setMidiValues(type, attr, value);
            }
        }
    };

    toggleEffectMethod = function(effect, load) {
        var
            split = effect.split("-"),
            type = split[0],
            method = split[1];

        // Hide and show effect method    
        $("." + effect).show().siblings("div").hide();

        // Set configMap method type for each effect type on load
        if (load === true) {
            configMap[type].method = method;
        } else {
            // Update effect block configMap method
            setParams(type, 'method', method);
        }

        setParams(type, 'method', method);
    };

    setActiveEffects = function(obj, type) {
        if (obj.hasClass("active")) {
            configMap[type].active = true;
        } else {
            configMap[type].active = false;
        }
        setParams(type, 'active', configMap[type].active);
    };

    getPanelValues = function() {
        var method_type,
            type,
            mapkey;

        for (var key in configMap) {
            mapkey = configMap[key];
            method_type = eblock[mapkey.type + "_effect_select"].val();
            method_type = method_type.replace(mapkey.type + "-", "");
            mapkey.method = method_type;
            mapkey.specific = parseInt(eblock[mapkey.type + "_specific"].val(), 0);
            mapkey.rand_low = parseInt(eblock[mapkey.type + "_rand_rangelow"].val(), 0);
            mapkey.rand_high = parseInt(eblock[mapkey.type + "_rand_rangehigh"].val(), 0);
            mapkey.prog_low = parseInt(eblock[mapkey.type + "_prog_rangelow"].val(), 0);
            mapkey.prog_high = parseInt(eblock[mapkey.type + "_prog_rangehigh"].val(), 0);
            mapkey.step = parseInt(eblock[mapkey.type + "_step_size"].val(), 0);
            mapkey.direction = eblock[mapkey.type + "_step_switch"].attr('data-direction');
            mapkey.limit_range = eblock[mapkey.type + "_limit_range"].attr('data-limit-range');
        }
        return {
            configMap: configMap
        };
    };

    effectMap = (function(e) {
        var length = effectArray.length;

        for (var i = 0; i < length; i++) {
            eblock[e[i] + "_effect"] = $(".effect-" + e[i]);
            eblock[e[i] + "_effect_select"] = $("#select-" + e[i] + "-effect");
            eblock[e[i] + "_specific"] = $("#" + e[i] + "-specific-effect");
            eblock[e[i] + "_rand_rangelow"] = $("." + e[i] + "-rand-rangelow-effect");
            eblock[e[i] + "_rand_rangehigh"] = $(("." + e[i] + "-rand-rangehigh-effect"));
            eblock[e[i] + "_prog_rangelow"] = $("." + e[i] + "-prog-rangelow-effect");
            eblock[e[i] + "_prog_rangehigh"] = $(("." + e[i] + "-prog-rangehigh-effect"));
            eblock[e[i] + "_step_size"] = $(("." + e[i] + "-step-size"));
            eblock[e[i] + "_step_switch"] = $(("." + e[i] + "-step-switch"));
            eblock[e[i] + "_limit_range"] = $(("." + e[i] + "-limit-to-range"));

            //   obj, startVal, type, params, min, max
            controlPanel.createDial({
                obj: eblock[e[i] + "_specific"],
                start_val: config.note,
                type: "effect-block",
                params: "specific",
                effect_type: e[i],
                min: 1,
                max: 127
            });
            controlPanel.createDial({
                obj: eblock[e[i] + "_rand_rangelow"],
                start_val: config.note,
                type: "effect-block",
                params: "rand-low",
                effect_type: e[i],
                min: 1,
                max: 127
            });
            controlPanel.createDial({
                obj: eblock[e[i] + "_rand_rangehigh"],
                start_val: config.note,
                type: "effect-block",
                params: "rand-high",
                effect_type: e[i],
                min: 1,
                max: 127
            });
            controlPanel.createDial({
                obj: eblock[e[i] + "_prog_rangelow"],
                start_val: config.note,
                type: "effect-block",
                params: "prog-low",
                effect_type: e[i],
                min: 1,
                max: 127
            });
            controlPanel.createDial({
                obj: eblock[e[i] + "_prog_rangehigh"],
                start_val: config.note,
                type: "effect-block",
                params: "prog-high",
                effect_type: e[i],
                min: 1,
                max: 127
            });


            eblock[e[i] + "_step_size"]
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
            toggleEffectMethod(eblock[e[i] + "_effect_select"].val(), true);
        }

    })(effectArray);


    // Hide/ Show effect type on select menu change
    $("#select-note-effect, #select-volume-effect, #select-velocity-effect, #select-duration-effect").change(function() {
        toggleEffectMethod($(this).val());
        return false;
    });

    // Step direction switch toggle 
    eblock.step_switch.click(function() {
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
    eblock.limit_range.click(function() {
        var
            type = $(this).data().type,
            limit = $(this).attr('data-limit-range');


        if (limit === 'true') {
            //$(this).removeClass('active');
            $(this).attr('data-limit-range', 'false');
            limit = false;
        } else {
            // $(this).addClass('active');
            limit = true;
            $(this).attr('data-limit-range', 'true');
        }

        setParams(type, 'limit_range', limit);

        return false;
    });

    // Show / Hide effects on click
    eblock.select_effect.find("li").click(function() {
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

    return {
        getPanelValues: getPanelValues,
        setParams: setParams
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
            section: document.getElementById("stage"),
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
        if (gridify(mousedownX) === gridify(e.pageX) && gridify(mousedownY) === gridify(e.pageY) && config.draggingBlocks === false) {
            return "same";
        } else {
            return "different";
        }
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
                    gridpos = gridify(e.pageX) - blockDragOffsetX,
                    validMove = true;
                if (gridpos + blockDragWidth < config.gridSize && gridpos >= 0) {
                    blockDragLeftX = gridpos;
                }

                gridpos = gridify(e.pageY) - blockDragOffsetY;
                if (gridpos + blockDragHeight < config.gridSize && gridpos >= 0) {
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
                        gridX = gridify(e.pageX),
                        gridY = gridify(e.pageY),
                        activePanel = controlPanel.getActivePanel();

                    // Add music block to the grid 
                    // addBlock(gridX, gridY, config.newBlockType);
                    addBlock(gridX, gridY, activePanel);



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
                blockDragLeftX = config.gridSize;
                blockDragLeftY = config.gridSize;
                blockDragWidth = 0;
                blockDragHeight = 0;
            } else {
                var
                    leftX = Math.min(mousedownX, e.pageX),
                    rightX = Math.max(mousedownX, e.pageX),
                    topY = Math.min(mousedownY, e.pageY),
                    bottomY = Math.max(mousedownY, e.pageY),
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
        mousedownX = Math.min(e.pageX, config.blockSize * config.gridSize);
        mousedownY = Math.min(e.pageY, config.blockSize * config.gridSize);

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

}();