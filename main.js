// "use strict";
var
    config = {
        speed: 4,
        blockSize: 32,
        gridHeight: 18,
        gridWidth: 20,
        gridOffsetX: 0,
        gridOffsetY: 0,
        pause: -1,
        system_pause: false,
        advance: -1,
        shiftkey: 0,
        numSelected: 0,
        mode: "create",
        cnt: 0,
        newblock: -1,
        instrumentsToLoad: 1,
        draggingBlocks: false,
        scaleNameArray: [],
        scaleArray: [],
        loadedInstruments: [],
        block_fx_image: new Image(),
        note_active_image: new Image(),
        volume_active_image: new Image(),
        velocity_active_image: new Image(),
        duration_active_image: new Image(),
        black_image: new Image(),
        spriteOverlayTransparency: 0.7,
        masterVolume: 100,
        masterMute: -1,
    },
     
    canvas = document.getElementById("grid"),
    context = canvas.getContext("2d"),
    gridArray = new Array([]),
    minMaxArray = {
        note: {
            min: 24,
            max: 107
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
midiInstruments = {
    'xylophone': 13,
    'acoustic_grand_piano': 0,
    'overdriven_guitar': 29,
    'acoustic_bass': 32,
    'orchestral_harp': 46,
    'rock_organ': 18,
    'harpsichord': 6,
    'marimba': 12,
    'harmonica': 22,
    'accordion': 21,
    'synth_strings_1': 50,
    'trumpet': 56,
    'trombone': 57,
    'gunshot': 127
    // 'fretless_bass': 35,
    // 'hammond_organ': 16,
    // 'electric_jazz_guitar': 26,
    // 'alto_sax': 65,
    // 'tenor_sax': 66,
    // 'flute': 73,
    // 'sawtooth_wave_lead': 82
};


// Make the grid on load using blockSize, gridWidth and gridHeight from config object 
(function makeGrid() {
    var
        section,
        section2,
        node,
        gridH,
        gridV,
        width = config.blockSize * config.gridWidth,
        height = config.blockSize * config.gridHeight,

        elements = {
            grid: document.getElementById('grid_lines'),
            gridH: document.getElementById('gridHorizontal'),
            gridV: document.getElementById('gridVertical')
        };

    elements.grid.style.width = width + 'px';
    elements.grid.style.height = height + 'px';

    canvas.width = width;
    canvas.height = height;

    for (var q = 0; q < config.gridHeight; q++) {
        node = document.createElement('LI');
        elements.gridH.appendChild(node);
        node.style.width = (config.blockSize * config.gridWidth) + 'px';
        node.style.marginTop = (config.blockSize - 1) + 'px';
    }

    for (var i = 0; i < config.gridWidth; i++) {
        elements.gridV = document.getElementById('gridVertical');
        node = document.createElement('LI');
        elements.gridV.appendChild(node);
        node.style.height = (config.blockSize * config.gridHeight) + 'px';
        node.style.marginRight = (config.blockSize - 1) + 'px';

        ////create empty grid array
        gridArray.push([]);
        for (var j = 0; j < config.gridHeight; j++) {
            gridArray[i][j] = -1;
        }
    }
    //Add scales to scale arrays
    addScale("Chromatic (None)", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    addScale("C Major", [0, 2, 4, 5, 7, 9, 11]);
    addScale("C Minor", [0, 2, 3, 5, 7, 8, 10]);
    addScale("D Major", [1, 2, 4, 6, 7, 9, 11]);
    addScale("E Major", [1, 3, 4, 6, 8, 9, 11]);
    addScale("F Major", [0, 2, 4, 5, 7, 9, 10]);
    addScale("G Major", [0, 2, 4, 6, 7, 9, 11]);
    addScale("A Major", [1, 2, 4, 6, 8, 9, 11]);
    addScale("B Major", [1, 3, 4, 6, 8, 10, 11]);
    addScale("Bb Major", [0, 2, 3, 5, 7, 9, 10]);
    addScale("Eb Major", [0, 2, 3, 5, 7, 8, 10]);
    addScale("Ab Major", [0, 1, 3, 5, 7, 8, 10]);
    addScale("Db Major", [0, 1, 3, 5, 6, 8, 10]);
    addScale("Gb Major", [1, 3, 5, 6, 8, 10, 11]);
    addScale("Cb Major", [1, 3, 4, 6, 8, 10, 11]);


    //Add images
    config.note_active_image.src = './images/note_active.png';
    config.volume_active_image.src = './images/volume_active.png';
    config.velocity_active_image.src = './images/velocity_active.png';
    config.duration_active_image.src = './images/duration_active.png';
    config.black_image.src = './images/black.png';

    var sel = document.getElementById('select-note-scale');
    for (var i = 0; i < config.scaleNameArray.length; i++) {
        var opt = document.createElement('option');
        opt.innerHTML = config.scaleNameArray[i];
        opt.value = config.scaleNameArray[i];
        sel.appendChild(opt);
    }

    //Make create icon active at start
    $('li.create').addClass('active');

})();

// Music block object and methods
var proto = {
    id: '',
    blocknum: 0,
    oldDirection: 'none',
    newDirection: 'none',
    direction: 'none',
    //staticDirection: 'none',
    isMoving: 'false',
    queued: 1,
    selected: false,
    active: '#ccc',
    notActive: '#ccc',
    halfpoint: -1,
    snd: null,
    waiting: 'false',
    numCollisions: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    rngMin: 0,
    rngMax: 0,
    gridX: 0,
    gridY: 0,
    size: 8,
    activeCount: 35,
    notActiveCount: 35,
    prevgridX: 0,
    prevgridy: 0,
    colorArray: ['#d27743', '#cf5a4c', '#debe4e', '#ccc', '#d27743', '#cf5a4c', '#debe4e', '#ccc', '#d27743', '#cf5a4c', '#debe4e', '#ccc', '#d27743', '#cf5a4c', '#debe4e', '#ccc'],
    section: document.getElementById('grid'),
    $send_blocks: $('.send-blocks'),
    timer: null,
    activeStore: null,
    sprite: new Image(),

    setGrid: function() {
        this.gridX = utilities.gridify(this.posX);
        this.gridY = utilities.gridify(this.posY);
        this.prevgridX = this.gridX;
        this.prevgridY = this.gridY;
    },

    setStyle: function(propertyObject) {
        var elem = document.getElementById(this.id);
        for (var property in propertyObject)
            elem.style[property] = propertyObject[property];
    },
    addBlock: function(el) {
        this.blocknum = el;
        var color;
        //var direction = elements.selectDirection.children('.active').attr("id");
        if (this.type === 'block-music') {
            this.notActive = this.shadeColor(this.colorArray[this.instrument], 0);
            this.active = this.shadeColor(this.colorArray[this.instrument], -35);
            //  this.activeStore = this.active;
        } else {
            //color = '#10B529';
            color = '#000000';
            this.notActive = this.shadeColor(color, 0);
            this.active = this.shadeColor(color, -35);
        }
    },
    shadeColor: function(color, percent) {
        var
            val = {},
            R = parseInt(color.substring(1, 3), 16),
            G = parseInt(color.substring(3, 5), 16),
            B = parseInt(color.substring(5, 7), 16);

        R = parseInt(R * (100 + percent) / 100, 0);
        G = parseInt(G * (100 + percent) / 100, 0);
        B = parseInt(B * (100 + percent) / 100, 0);

        R = (R < 255) ? R : 255;
        G = (G < 255) ? G : 255;
        B = (B < 255) ? B : 255;

        val = {
            red: R,
            green: G,
            blue: B
        };
        var
            RR = ((R.toString(16).length == 1) ? '0' + R.toString(16) : R.toString(16)),
            GG = ((G.toString(16).length == 1) ? '0' + G.toString(16) : G.toString(16)),
            BB = ((B.toString(16).length == 1) ? '0' + B.toString(16) : B.toString(16));

        //  return "#" + RR + GG + BB;
        return val;

    },
    selectBlock: function() {
        // Only select a block if it's not selected
        if (this.selected !== true ){//&& config.newblock !== this.blocknum) {
            this.selected = true;
            config.numSelected++;

            if (this.type == 'block-music') {
                this.$send_blocks.addClass('animate');
            }
        }
    },

    deselectBlock: function() {
        //Only deselect block if it is already selected
        if (this.selected === true) {
            this.selected = false;
            config.numSelected--;
        }
        this.$send_blocks.removeClass('animate');
    },
    removeBlock: function() {
        blocks.splice(this.blocknum, 1);
        for (var v = this.blocknum; v < blocks.length; v++) {
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
        if (config.mode === 'trash') {
            this.removeBlock();
        } else {
            this.selectBlock();
            if (this.selected === true) {
                if (this.type == 'block-music') {
                    musicBlockPanel.setToBlock(this.blocknum);
                }
                if (this.type == 'block-effect') {
                    effectBlockPanel.setToBlock(this.blocknum);
                }
                controlPanel.setActivePanel(this.type);
            }
        }        
    },
    activate: function() {
        //this.notActiveCount = 35;
        if (this.selected === true) {
            this.activeCount = 100;
        } else {
            this.notActiveCount = 100;
        }

    },
    resetColor: function(selected) {
        this.notActive = this.colorArray[this.instrument];
    },
    playmidi: function() {
        var
            duration = this.duration / 120,
            $selected_instrument = $("#set-instrument option:selected");

        // If music block is note selected create 'light effect' on collision
        if (this.selected === false) {
            this.activate();
        }
        //if ($('#set-instrument option:selected').attr('class') === 'loaded') {
        // check if block is muted or master is muted
        if (config.masterMute == -1 && this.mute !== true) {
            if (config.blockSolo === true) {
                if (this.solo === true) {
                    setMidiParams.triggerMidi(Math.floor(this.volume * config.masterVolume / 100), this.instrument, this.note, this.velocity, duration);
                }
            } else {
                setMidiParams.triggerMidi(Math.floor(this.volume * config.masterVolume / 100), this.instrument, this.note, this.velocity, duration);
            }

        }
        //}
    },    
    drawSpriteOnBlock: function(image){
        context.globalAlpha = config.spriteOverlayTransparency;
        context.drawImage(image,
            this.posX + 1 + this.size, 
            this.posY + this.size, 
            (this.width - (this.size * 2) - 1), 
            (this.height - (this.size * 2) - 1));
        context.globalAlpha = 1.0;
    },
    render: function() {

        if (this.size > 0) {
            this.size--;
        }
        if (this.selected === false) {
            if (this.notActiveCount > 0) {
                this.notActiveCount -= 6;
            }
            context.fillStyle = "rgb(" + (this.notActive.red + (this.notActiveCount * 2)) + ", " + (this.notActive.green + this.notActiveCount) + ", " + (this.notActive.blue + (this.notActiveCount * 3)) + ")";
            context.fill();
        } else {
            if (this.activeCount > 0) {
                this.activeCount -= 5;
            }

            context.fillStyle = "rgb(" + (this.active.red + this.activeCount) + ", " + (this.active.green + this.activeCount) + ", " + (this.active.blue + this.activeCount) + ")";
            context.fill();
        }

        context.fillRect(this.posX + 1 + this.size, this.posY + this.size, (this.width - (this.size * 2) - 1), (this.height - (this.size * 2) - 1));

        if (this.type === "block-effect") {
            if (this.configMap.note.active) {
                this.drawSpriteOnBlock(config.note_active_image);
            }
            if (this.configMap.volume.active) {
                this.drawSpriteOnBlock(config.volume_active_image);
            }
            if (this.configMap.velocity.active) {
                this.drawSpriteOnBlock(config.velocity_active_image);
            }
            if (this.configMap.duration.active) {
                this.drawSpriteOnBlock(config.duration_active_image);
            }

            //shade the block if selected
            if (this.selected) {
                context.globalAlpha = 0.3;
                context.drawImage(config.black_image, this.posX + 1 + this.size, this.posY + this.size, (this.width - (this.size * 2) - 1), (this.height - (this.size * 2) - 1));
                context.globalAlpha = 1.0;
            }
        }        
    }
};

var makeMusicBlock = function(w, h, x, y, s, t) {
    var block = Object.create(proto);
    block.width = w;
    block.height = h;
    block.posX = x;
    block.posY = y;
    block.speed = s;
    block.type = t;
    block.static_direction = 'none';
    block.note = null;
    block.octave = null;
    block.volume = null;
    block.duration = null;
    block.velocity = null;
    block.instrument = 0;
    block.solo = false;
    block.mute = false;


    // Music Block Specfic Methods
    block.setInitValues = function(el) {
        var map = el.configMap;
        this.volume = map.volume;
        this.note = map.note;
        this.duration = map.duration;
        this.velocity = map.velocity;
        this.octave = map.octave;
        this.instrument = map.instrument;
        this.static_direction = map.static_direction;
        this.mute = map.mute;
        this.solo = map.solo;

        // console.log(map.solo);

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
    block.sprite.src = './images/block-fx3.png';

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
                // range_low: map[key].range_low,
                // range_high: map[key].range_high,
                limit_range: map[key].limit_range,
                // range_high: map[key].range_high,
                // range_low: map[key].range_low,
                range_low: map[key].range_low,
                range_high: map[key].range_high,
                step: map[key].step,
                direction: map[key].direction
            };
            if (key === 'note') {
                this.configMap.note.scale = map[key].scale;
                this.configMap.note.range_valid_notes = map[key].range_valid_notes;
            }
        }
        //  console.log(this.configMap);

    };

    block.rebuildRangeValidNotes = function() {
        //Create the random valid notes array based on scale and range_low and range_high
        this.configMap.note.range_valid_notes = [];
        var valid_notes = getScale(this.configMap.note.scale);
        var low_octave = Math.floor(this.configMap.note.range_low / 12);
        var i = 0;
        //If range_low is greater than the largest value in valid_notes, then the value we want to start is one octave higher
        if (this.configMap.note.range_low > valid_notes[valid_notes.length - 1] + low_octave * 12) {
            low_octave++;
        } else {
            //Advance i until it is >= range_low
            while (this.configMap.note.range_low > valid_notes[i] + low_octave * 12) {
                i++;
            }
        }

        //Add values to the array until we exceed the range limit
        while (this.configMap.note.range_high >= valid_notes[i] + low_octave * 12) {
            this.configMap.note.range_valid_notes.push(valid_notes[i] + low_octave * 12);
            i++;
            if (i == valid_notes.length) {
                i = 0;
                low_octave++;
            }
        }
        //console.log("REBUILT " + this.configMap.note.range_valid_notes);
    };

    block.setMidiValues = function(type, attr, value) {
        this.configMap[type][attr] = value;
    };

    return block;
};



//Display block info
function displayBlockInfo(blockref) {
    console.log('Block ' + blockref +
        ' GridX: ' + blocks[blockref].gridX +
        ' GridY: ' + blocks[blockref].gridY +
        ' prevGridX: ' + blocks[blockref].prevgridX +
        ' prevGridY: ' + blocks[blockref].prevgridY +
        ' Direction: ' + blocks[blockref].direction +
        ' Waiting: ' + blocks[blockref].waiting);
}


function addScale(scaleName, scale) {
    config.scaleNameArray.push(scaleName);
    config.scaleArray.push(scale);
}

function getScale(scaleName) {
    //console.log(scaleName + "GETTING");
    //console.log(config.scaleNameArray);
    //console.log(config.scaleArray);
    return config.scaleArray[config.scaleNameArray.indexOf(scaleName)];
}

// function rangedRandom(min, max) {
//     return Math.floor(Math.random() * (max - min + 1)) + min;
// }

utilities = function() {
    var noteArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    return {
        //Gridify translates an amount of pixels to an amount of blocks
        gridify: function(pixels) {
            var minX = 0;
            return Math.floor((pixels - minX) / config.blockSize);
        },

        rangedRandom: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        //Sets the block's note and octave based on octaveNote value
        setBlockToOctaveNote: function(block, octaveNote) {
            block.note = octaveNote % 12;
            block.octave = Math.floor(octaveNote / 12);
        },

        //Retrieve octaveNote value from the block
        convertBlockToOctaveNote: function(block) {
            return block.note + block.octave * 12;
        },
        noteToString: function(note) {

            return noteArray[note % 12] + Math.floor(note / 12);
        },
        stringToNote: function(noteString) {
            var octave = +noteString.charAt(noteString.length - 1);
            noteStr = noteString.substring(0, noteString.length - 1);
            note = noteArray.indexOf(noteStr);
            return octave * 12 + note;
        },
        deleteSelectedBlocks: function() {
            for (var i = 0; i < config.cnt; i++) {
                if (blocks[i].selected === true) {
                    blocks[i].removeBlock();
                    i--;
                }
            }
        },
        deleteAllBlocks: function() {
            for (var j = 0; j < config.cnt; j++) {
                blocks[j].removeBlock();
                j--;
            }
        },
        selectAllBlocks: function() {
            for (var k = 0; k < config.cnt; k++) {
                blocks[k].selectBlock();
            }
        },
        deselectAllBlocks: function() {
            for (var l = 0; l < config.cnt; l++) {
                if (blocks[l].selected === true) {
                    blocks[l].deselectBlock();
                }
            }
        }
    };
}();


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
                                if (key == "note") {
                                    var rndIndex = utilities.rangedRandom(0, blocks[eblockref].configMap[key].range_valid_notes.length - 1);
                                    var newValue = blocks[eblockref].configMap[key].range_valid_notes[rndIndex];
                                } else {
                                    var newValue = utilities.rangedRandom(blocks[eblockref].configMap[key].range_low, blocks[eblockref].configMap[key].range_high);
                                }
                            }

                            //If not limit range flag, new key is random key in MIDI acceptable range
                            else {
                                var newValue = utilities.rangedRandom(minMaxArray[key].min, minMaxArray[key].max);
                            }

                            //Set blocks key to new key
                            blocks[mblockref][key] = newValue;

                            break;

                        case "progression":
                            var step_direction = 1;
                            if (blocks[eblockref].configMap[key].direction == "down") {
                                step_direction = -1;
                            }

                            //Default newValue to the original value
                            var newValue = blocks[mblockref][key];

                            if (key == "note") {
                                if (blocks[eblockref].configMap[key].range_valid_notes.length > 0) {
                                    //Find the current note in the valid note array
                                    var prog_index = blocks[eblockref].configMap[key].range_valid_notes.indexOf(blocks[mblockref].note);

                                    //Advance index. If incoming note not found, prog_index will start at 0
                                    if (prog_index == -1) {
                                        prog_index = 0;
                                    }
                                    //Otherwise, advance by the step amount in the step direction
                                    else {
                                        prog_index += step_direction * blocks[eblockref].configMap[key].step;
                                    }
                                    //If we are out of the range, we add or subtract the length to wrap around the range
                                    while (prog_index >= blocks[eblockref].configMap[key].range_valid_notes.length || prog_index < 0) {
                                        prog_index -= step_direction * blocks[eblockref].configMap[key].range_valid_notes.length;
                                    }

                                    //Set new note value to the new indexed value from the range array
                                    newValue = blocks[eblockref].configMap[key].range_valid_notes[prog_index];
                                }
                            } else {
                                //Add step value to block key
                                if (step_direction == 1) {
                                    //If the result key is lower than the low limit, then set to the low limit.
                                    if (newValue < blocks[eblockref].configMap[key].range_low) {
                                        newValue = blocks[eblockref].configMap[key].range_low;
                                    }
                                    //If the result key is higher than the high limit, then set to key - high limit.
                                    else if (newValue > blocks[eblockref].configMap[key].range_high) {
                                        newValue = blocks[eblockref].configMap[key].range_high;
                                    }
                                    //If the result key is inside the range, then advance it.
                                    else {
                                        newValue += blocks[eblockref].configMap[key].step * step_direction;
                                    }
                                    //If we are out of the range, we add or subtract the size of the range to wrap around the range
                                    while (newValue > blocks[eblockref].configMap[key].range_high || newValue < blocks[eblockref].configMap[key].range_low) {
                                        newValue -= step_direction * (blocks[eblockref].configMap[key].range_high - blocks[eblockref].configMap[key].range_low + 1);
                                    }
                                }
                            }

                            //Set the block value to new value
                            if (newValue != null) {
                                blocks[mblockref][key] = newValue;
                            }

                            break;

                        default:
                            //This would be an error
                            break;
                    }

                    // if (blocks[mblockref].selected == true) {
                    //     musicBlockPanel.updatePianoRoll({
                    //         value: blocks[mblockref].note
                    //     });
                    // }
                }
            }


            // configMap has all attributes for effect blocks use dote notation to access values for example: blocks[eblockref].configMap.note.active

            //prints entire configMap in console.  Click on the object in the console to see all the attributes
            // console.log(blocks[eblockref].configMap);

            //blocks[mblockref].note = blocks[eblockref].configMap.note.specific;


        }

        if (config.numSelected === 1 && blocks[mblockref].selected === true && eblockref.type !== 'block-music') {
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
            diag2Direction,
            minGridX = 0,
            minGridY = 0,
            maxGridX = 0,
            maxGridY = 0;

        maxGridX = config.gridWidth - 1;
        maxGridY = config.gridHeight - 1;
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
        if ((direction === "up" && gridY === minGridY) || (direction === "down" && gridY === maxGridY) || (direction === "left" && gridX === minGridX) || (direction === "right" && gridX === maxGridX)) {
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
        else if (diag1GridX >= minGridX && diag1GridY >= minGridY && diag1GridX <= maxGridX && diag1GridY <= maxGridY && gridArray[diag1GridX][diag1GridY] !== -1 && blocks[gridArray[diag1GridX][diag1GridY]].waiting === false && (blocks[gridArray[diag1GridX][diag1GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag1GridX][diag1GridY]].oldDirection === diag1Direction) {
            processEffects(blockref, gridArray[diag1GridX][diag1GridY]);
            blocks[blockref].numCollisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 2 collision
        else if (diag2GridX >= minGridX && diag2GridY >= minGridY && diag2GridX <= maxGridX && diag2GridY <= maxGridY && gridArray[diag2GridX][diag2GridY] !== -1 && blocks[gridArray[diag2GridX][diag2GridY]].waiting === false && (blocks[gridArray[diag2GridX][diag2GridY]].numCollisions <= blocks[blockref].numCollisions || skipcheck) && blocks[gridArray[diag2GridX][diag2GridY]].oldDirection === diag2Direction) {
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
        draw,
        syncounter = -config.blockSize,
        drag_map = {};

    (function syncCounter() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var z = 0; z < config.cnt; z++) {
            block = blocks[z].render();
        }
        drag_map = setGridEvents.getDragValues();
        context.fillStyle = 'rgba(225,225,225,0.5)';
        context.fill();
        context.fillRect(drag_map.xpos, drag_map.ypos, drag_map.width, drag_map.height);

        if (!config.system_pause && ((config.pause === 1 && config.advance === 1) || config.pause === -1)) {
            // Clear canvas on loop and redraw blocks


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
                    // blocks[i].updatePosition();
                }
            }

            //After moving, update all block positions
            for (var q = 0; q < config.cnt; q++) {
                //calculate new grid positions, floor handles blocks moving left and up
                blocks[q].gridX = utilities.gridify(blocks[q].posX);
                blocks[q].gridY = utilities.gridify(blocks[q].posY);

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
};


// Load MIDI library and set params 
setMidiParams = function() {
    var
        setParams,
        tiggerMidi;

    //LOAD MIDI SOUNDFONTS
    window.onload = function() {
        var cnt = 0,
            str = [];
        for (var i = 0; i < config.instrumentsToLoad; i++) {
            str[i] = Object.keys(midiInstruments)[i];
        }
        // console.log(Object.keys(midiInstruments).length);
        // for (var i = 0; i < Object.keys(midiInstruments).length; i++) {
        //     config.loadedInstruments.push(false);
        // }
        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instruments: str,
            // onprogress: function(state, progress) {


            // },
            // load first 4 instruments in array
            onsuccess: function() {
                $("#wrapper").fadeIn();
                $(".spinner-page").fadeOut();
                //   alert(progress);
                for (var key in midiInstruments) {
                    if (cnt < config.instrumentsToLoad) {
                        MIDI.programChange(cnt, midiInstruments[key]);
                        config.loadedInstruments[cnt] = true;
                        cnt++;
                    }
                }
                console.log("loaded");
            }
        });
    };
    triggerMidi = function(vol, pro, note, vel, dur) {
        MIDI.setVolume(0, vol);
        MIDI.noteOn(pro, note, vel, 0);
        MIDI.noteOff(pro, note, dur);
    };

    // getNote = function(val) {
    //     var noteArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    //     return noteArray[val];
    // };
    return {
        // getNote: getNote,
        setParams: setParams,
        triggerMidi: triggerMidi
    };
}();

topPanel = function() {
    var jqueryMap = {
            $mode_select: $('.mode-select'),
            $play_select: $('.play-select'),
            $batch_edits: $('.batch-edits'),
            $hotkey_btn: $('[data-id = "hotkeys"]'),
            $hotkey_menu: $('[data-id = "hotkey-menu"]'),
            $master_volume: $('.master-volume-slider')
        },
        updateMode;

    jqueryMap.$master_volume.slider({
            orientation: "horizontal",
            value: config.masterVolume,
            min: 0,
            max: 100,
            step: 1,
            slide: function(event, ui) {
                // $(this).find("input").val(ui.value);
                config.masterVolume = ui.value;
            }
        });

    updateMode = function() {
        var mode = $(this).attr('data-mode');
        if ($(this).parent().attr('class') !== 'batch-edits') {
            $(this).addClass('active').siblings().removeClass('active');
        }

        switch (mode) {
            case 'select':
            case 'create':
                config.mode = mode;
                break;
            case 'trash':
                config.mode = mode;
                utilities.deleteSelectedBlocks();
                break;
            case 'pause':
                config.pause = 1;
                break;
            case 'play':
                config.pause = -1;
                break;
            case 'select-all':
                utilities.selectAllBlocks();
                break;
            case 'clear-all':
                var x;
                if (confirm("Ar you sure you want to clear the board?") === true) {
                    utilities.deleteAllBlocks();
                }

                break;
            default:
                config.mode = mode;
                break;
        }
    };
    jqueryMap.$mode_select.find('li').click(updateMode);
    jqueryMap.$play_select.find('li').click(updateMode);
    jqueryMap.$batch_edits.find('li').click(updateMode);
    jqueryMap.$hotkey_btn.click(function() {
        config.system_pause = true;
        jqueryMap.$hotkey_menu.fadeIn(300);
    });
    jqueryMap.$hotkey_menu.click(function(event) {
        var target = $(event.target);
        if (!target.is("td")) {
            $(this).hide();
            $(this).fadeOut(300, function() {
                  $( "#wrapper" ).trigger( "click" );
            });
        }
        config.system_pause = false;
    });

}();

controlPanel = function() {
    var
        jqueryMap = {
            $select: $('.block-type-select'),
            $block_music: $('#block-music'),
            $block_effect: $('#block-effect'),
            $range_indicator: $('.range-indicator'),
            $piano_roll_slider: $('.piano-roll-slider')
        },
        knobparams = {
            fgColor: '#6f6e6d',
            bgColor: '#adacaa',
            width: '27',
            thickness: '.55',
            cursor: 11,
            height: '27 '
        },
        valprev = "",
        setParams, getActivePanel, createDial, getMultiplier, setActivePanel,
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

                    if (type === 'music-block') {
                        if (params === 'note') {
                            musicBlockPanel.updatePianoRoll({
                                value: value
                            });
                        }
                        musicBlockPanel.setParams(params, value);
                    } else {


                        // Must update the configMap values before updating the piano roll
                        effectBlockPanel.setParams(effect_type, params, value);
                        effectBlockPanel.compareDialValues(effect_type, params, value);
                        if (effect_type === 'note') {
                            effectBlockPanel.updatePianoRoll({
                                params: params,
                                value: value
                            });
                        }
                    }
                },
                'format': function(value) {
                    if (params === 'note' || effect_type === 'note') {
                        return utilities.noteToString(value);
                    } else {
                        return value;
                    }
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
    setActivePanel = function(type) {
        $('div.' + type + '-panel').show().siblings('div').hide();

        if (type == 'block-music') {
            musicBlockPanel.updatePianoRoll();
            jqueryMap.$block_music.addClass('active').siblings().removeClass('active');
            jqueryMap.$range_indicator.hide();
            jqueryMap.$piano_roll_slider.hide();
        } else {
            effectBlockPanel.updatePianoRoll();
            jqueryMap.$block_effect.addClass('active').siblings().removeClass('active');
        }
    };

    // Select block type from control panel
    jqueryMap.$select.find('li').click(function() {
        var type = $(this).attr('id');
        setActivePanel(type);
    });

    return {
        createDial: createDial,
        getActivePanel: getActivePanel,
        setActivePanel: setActivePanel,
        getMultiplier: getMultiplier
    };
}();




musicBlockPanel = function() {
    var
    // Cache jquery selectors for better performance
        jqueryMap = {
            $note: $('.note-music'),
            $volume: $('.volume-music'),
            $duration: $('.duration-music'),
            $velocity: $('.velocity-music'),
            $direction: $('#select-direction'),
            $piano_key: $('.piano-roll li'),
            $instrument: $('#set-instrument'),
            $send_blocks: $(".send-blocks"),
            $mute: $('.mute-toggle'),
            $solo: $('.solo-toggle'),
            $mute_solo: $('.mute-solo'),
            $mute_piano: $('.mute-piano')
        },
        configMap = {
            note: 60,
            volume: 60,
            duration: 40,
            velocity: 60,
            instrument: 0,
            static_direction: 'up',
            mute: false,
            solo: false
        },
        setDirection, getDirection, getPanelValues, updatePianoRoll, sendBlocks,
        setToBlock, setParams, populateInstruments,
        multiplier = controlPanel.getMultiplier(),
        mutePiano = false;

    // Create Music Block Dials
    controlPanel.createDial({
        obj: jqueryMap.$note,
        start_val: configMap.note,
        type: 'music-block',
        params: 'note',
        min: 24,
        max: 107
    });
    controlPanel.createDial({
        obj: jqueryMap.$volume,
        start_val: configMap.volume,
        type: 'music-block',
        params: 'volume',
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: jqueryMap.$velocity,
        start_val: configMap.velocity,
        type: 'music-block',
        params: 'velocity',
        min: 1,
        max: 120
    });
    controlPanel.createDial({
        obj: jqueryMap.$duration,
        start_val: configMap.duration,
        type: 'music-block',
        params: 'duration',
        min: 1,
        max: 120
    });

    populateInstruments = (function() {
        var
            length = Object.keys(midiInstruments).length,
            cnt = 0,
            el = 'loaded';

        for (var key in midiInstruments) {
            key = key.replace(/_/g, ' ');
            if(key == 'gunshot'){
                key = 'drums';
            }
            if (cnt > config.instrumentsToLoad - 1) {
                key = key + ' (not loaded)';
                el = 'not-loaded';
            }
            jqueryMap.$instrument.append('<span>test</span><option class = \"' + el + '\" value="' + cnt + '">' + key + '</option>');
            cnt++;
        }
    })();

    setDirection = function(d) {
        jqueryMap.$direction.find('li#' + d).addClass('active').siblings().removeClass('active');
    };
    getDirection = function() {
        return jqueryMap.$direction.find('li.active').attr('id');
    };
    setParams = function(type, value) {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type == 'block-music') {
                blocks[i].setMidiValues(type, value);
                blocks[i].activate();
            }
        }
        // update configMap anytime a value is updated on the music block panel
        configMap[type] = value;
    };
    sendBlocks = function(direction) {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type === 'block-music') {
                if (direction === undefined) {
                    blocks[i].newDirection = blocks[i].static_direction;
                } else {
                    blocks[i].newDirection = direction;
                }
                blocks[i].speed = config.speed;
            }
        }
        jqueryMap.$send_blocks.removeClass('animate');
    };
    getPanelValues = function() {
        return {
            configMap: configMap
        };
    };

    // Sync the piano roll to the note knob when it changes (auto run on load)
    updatePianoRoll = (function update() {
        var value = null;
        // if (arguments.length >= 1) {
        //     value = arguments[0].value - multiplier;
        // } else {
            value = configMap.note - multiplier;
        // }
        //console.log('test');
      
        jqueryMap.$piano_key.eq(value - 1).addClass("active").siblings().removeClass('active');
        jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');

        return update;
    }());



    // Update music block panel UI to selected music block values
    setToBlock = function(num) {
        for (var key in configMap) {
            var mapkey = configMap[key];
            configMap[key] = blocks[num][key];
            if (mapkey != blocks[num][key]) {
                switch (key) {
                    case 'static_direction':
                        setDirection(blocks[num].static_direction);
                        break;
                    case 'instrument':
                        jqueryMap.$instrument.val(blocks[num].instrument);
                        break;
                    case 'solo':
                    case 'mute':
                        jqueryMap['$' + key].attr('data-active', blocks[num][key]);
                        break;

                    default:
                        jqueryMap['$' + key].val(blocks[num][key]);
                        jqueryMap['$' + key].trigger('change');
                        if (key === 'note') {
                            updatePianoRoll();
                        }
                        break;

                }
            }
        }
    };

    //  Click Events
    jqueryMap.$instrument.change(function() {
        var
            option = $(this).find('option:selected'),
            isloaded = option.attr('class'),
            program = $(this).val(),
            $spinner = $('.spinner-instrument');

        if (isloaded === 'not-loaded') {
            var str = option.text().replace(/\(|\)/g, '').replace(/not loaded/g, '...');
            config.system_pause = true;
            // alert('test');

            $spinner.show();

            option.text(str);
            MIDI.loadPlugin({
                soundfontUrl: "./soundfont/",
                instruments: [Object.keys(midiInstruments)[program]],
                onsuccess: function() {
                    MIDI.programChange(program, midiInstruments[Object.keys(midiInstruments)[program]]);
                    config.loadedInstruments[program] = true;
                    console.log("loaded");
                    option.attr('class', 'loaded');
                    str = option.text().replace(/\(|\)/g, '').replace(/\.\.\./g, '');
                    option.text(str);
                    config.system_pause = false;
                    $spinner.hide();
                }
            });
        }

        setParams('instrument', program);
        return false;
    });

    jqueryMap.$direction.find('li').click(function() {
        var direction = $(this).attr('id');
        $(this).addClass('active').siblings().removeClass('active');
        setParams('static_direction', direction);
        return false;
    });

    // Mute or solo music blocks
    jqueryMap.$mute_solo.find('span').click(function() {
        var val = $(this).attr('data-active'),
            type = $(this).attr('data-type');

        if (val === 'true') {
            $(this).attr('data-active', 'false');
            val = false;
        } else {
            $(this).attr('data-active', 'true');
            val = true;
            if (type === 'solo') {
                config.blockSolo = true;
            }
        }
        setParams(type, val);

        if (type === 'solo') {
            // set global blockSolo to false, loop through music blocks and set back to true if any of them are true
            config.blockSolo = val;

            for (var k = 0; k < config.cnt; k++) {
                if (blocks[k].solo === true) {
                    config.blockSolo = true;
                }
            }
        }
    });

    // Mute Piano Roll 
    jqueryMap.$mute_piano.find('span').click(function() {
        var val = $(this).attr('data-active');

        if (val === 'true') {
            mutePiano = false;
            $(this).attr('data-active', 'false');
        } else {
            mutePiano = true;
            $(this).attr('data-active', 'true');
        }
    });

    jqueryMap.$piano_key.mousedown(function() {
        var
            type = controlPanel.getActivePanel(),
            index = $(this).index(),
            roll_index = ($(this).parent().index()) * 12,
            value = (index + roll_index) + (multiplier + 1);

        // Play MIDI note when piano roll is clicked
        if(mutePiano !== true) {
              setMidiParams.triggerMidi(70, configMap.instrument, value, 70, 0.3);
        }
      

        // If music block panel is not selected don't run this functionality
        if (type === 'block-music') {
            $(this).addClass('active').siblings().removeClass('active');
            $(this).parent().siblings().find('li').removeClass('active');
            setParams('note', value);

            // Update note knob values
            jqueryMap.$note.val(value);
            jqueryMap.$note.trigger('change');

            return false;
        }
    });

    // Send all the selected music blocks
    jqueryMap.$send_blocks.click(function() {
        sendBlocks();
    });

    return {
        setToBlock: setToBlock,
        updatePianoRoll: updatePianoRoll,
        setParams: setParams,
        getPanelValues: getPanelValues,
        sendBlocks: sendBlocks
    };
}();


effectBlockPanel = function() {
    var
        jqueryMap = {
            $limit_range: $('.limit-range'),
            $step_switch: $('.switch'),
            $piano_key: $('.piano-roll li'),
            $piano_roll: $('.piano-roll'),
            $black_key: $('.blackkey'),
            $white_key: $('.whitekey'),
            $range_indicator: $('.range-indicator'),
            $select_scale: $('#select-note-scale'),
            $toggle_effect: $('.toggle-drop'),
            $activator: $('.activator'),
            $piano_slider_min: $("#piano-slider-min"),
            $piano_slider_max: $("#piano-slider-max")
        },
        effectMap, toggleEffectMethod, getPanelValues, setParams, setPianoRoll, compareValues, updatePianoRoll,
        effectArray = ['note', 'volume', 'velocity', 'duration'],
        configMap = {
            note: null,
            volume: null,
            velocity: null,
            duration: null
        },
        multiplier = controlPanel.getMultiplier(),
        black_key_width = jqueryMap.$black_key.outerWidth(),
        white_key_width = jqueryMap.$white_key.outerWidth();

    setParams = function(type, attr, value) {
        for (var i = 0; i < config.cnt; i++) {
            if (blocks[i].selected === true && blocks[i].type == 'block-effect') {
                blocks[i].setMidiValues(type, attr, value);
                blocks[i].activate();
                //    console.log(type + attr + value);
                if (attr == "scale" || attr == "range_high" || attr == "range_low") {
                    blocks[i].rebuildRangeValidNotes();
                }
            }
        }
        // Update configMap anytime the effect block panel is updated
        configMap[type][attr] = value;
    };

    compareDialValues = function(effect_type, param, value) {
        //console.log("tester");
        if (param === 'range_high') {
            var val_low = 0;
            param = param.replace('high', 'low');
            val_low = configMap[effect_type][param];

            if (value <= val_low) {
                jqueryMap[effect_type + '_' + param].val(value - 1);
                jqueryMap[effect_type + '_' + param].trigger('change');

                // Set Params before updating Piano Roll
                setParams(effect_type, param, value - 1);
                if (effect_type === 'note') {
                    updatePianoRoll();
                }

            }
        }
        if (param === 'range_low') {
            var val_high = 0;
            param = param.replace('low', 'high');
            val_high = configMap[effect_type][param];

            if (value >= val_high) {
                jqueryMap[effect_type + "_" + param].val(value + 1);
                jqueryMap[effect_type + "_" + param].trigger('change');

                // Set Params before updating Piano Roll
                setParams(effect_type, param, value + 1);
                if (effect_type === 'note') {
                    updatePianoRoll();
                }

            }
        }
    };

    toggleEffectMethod = function(obj, load) {
        var
            effect = obj.val(),
            split = effect.split('-'),
            type = split[0],
            method = split[1];


        // Hide scale selection when note specific method selected
        if (type === 'note') {
            if (method === 'specific') {
                jqueryMap.$select_scale.hide();

            } else {
                jqueryMap.$select_scale.show();
            }
        }

        // Hide and show effect method    
        $('.' + effect).show().siblings('div').hide();
        if (method === 'random' || method === 'progression') {
            $('.' + type + '-range-wrapper').show();
        }

        setParams(type, 'method', method);
        if (load !== true) {
            updatePianoRoll();
        }

    };
    toggleScale = function(obj) {
        var scale = obj.val();
        setParams('note', 'scale', scale);
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
                pos_low,
                sliderAdd;

            if (attr === 'both') {
                jqueryMap.$piano_key.removeClass('active');
                jqueryMap.$range_indicator.show();
                jqueryMap.$piano_slider_max.show();
                jqueryMap.$piano_slider_min.show();
            }
            if (attr === 'high' || attr === 'both') {
                jqueryMap.$piano_key.eq(valueMap.high - 1).addClass('active-high').siblings().removeClass('active-high');
                jqueryMap.$piano_key.eq(valueMap.high - 1).parent().siblings().find('li').removeClass('active-high');
                if (jqueryMap.$piano_key.eq(valueMap.high - 1).hasClass('blackkey')) {
                    width_add = black_key_width;
                    sliderAdd = 2;
                } else {
                    width_add = white_key_width;
                    sliderAdd = 6;
                }
                jqueryMap.$piano_slider_max.slider({
                    value: pos_high + sliderAdd
                });
            }
            if (attr === 'low' || attr === 'both') {
                jqueryMap.$piano_key.eq(valueMap.low - 1).addClass('active-low').siblings().removeClass('active-low');
                jqueryMap.$piano_key.eq(valueMap.low - 1).parent().siblings().find('li').removeClass('active-low');

                jqueryMap.$piano_slider_min.slider({
                    value: pos_low + sliderAdd
                });
                if (jqueryMap.$piano_key.eq(valueMap.low - 1).hasClass('blackkey')) {
                    sliderAdd = 2;
                } else {
                    sliderAdd = 6;
                }

            }

            // Set high and low position of range-indicator
            index_high = jqueryMap.$piano_roll.find('.active-high').parent().index() * width;
            index_low = jqueryMap.$piano_roll.find('.active-low').parent().index() * width;
            pos_high = jqueryMap.$piano_roll.find('.active-high').position();
            pos_high = pos_high.left + index_high;
            pos_low = jqueryMap.$piano_roll.find('.active-low').position();
            pos_low = pos_low.left + index_low;

            // Update range indicator
            jqueryMap.$range_indicator.css({
                'width': pos_high - pos_low + width_add,
                'left': pos_low
            });

            // Update slider positions
            if (attr === 'low' || attr === 'both') {
                jqueryMap.$piano_slider_min.slider({
                    value: pos_low + sliderAdd
                });
            }
            if (attr === 'high' || attr === 'both') {
                jqueryMap.$piano_slider_max.slider({
                    value: pos_high + sliderAdd
                });
            }

        };

        if (arguments.length >= 1) {
            value = arguments[0].value - multiplier;
            params = arguments[0].params;


        }
        if (method === 'note-specific') {
            jqueryMap.$piano_key.removeClass('active-high active-low');
            jqueryMap.$range_indicator.hide();
            jqueryMap.$piano_slider_max.hide();
            jqueryMap.$piano_slider_min.hide();
            if (value === null) {
                value = configMap.note.specific - multiplier;
            }
            jqueryMap.$piano_key.eq(value - 1).addClass('active').siblings().removeClass('active');
            jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');
        } else {
            if (value === null) {
                valueMap['high'] = configMap.note.range_high - multiplier;
                valueMap['low'] = configMap.note.range_low - multiplier;
                setActive('both');
            } else {
                attr = params.split("_");
                valueMap[attr[1]] = value;
                setActive(attr[1]);
            }
        }
    };

    getPanelValues = function() {
        return {
            configMap: configMap
        };
    };

    // Set effect control panel values from block configMap
    setToBlock = function(num) {
        //  console.log('test');
        var
            map = blocks[num].configMap,
            open_effect = false;

        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                if (map[key].active === true && open_effect === false) {
                    $('.effect-' + key).show().siblings('.effect-box').hide();
                    $('.effect-' + key).siblings('.header').find('.toggle-drop').removeClass('active');
                    $('.effect-' + key).prev().find('.toggle-drop').addClass('active');
                    open_effect = true;
                }
                for (var key2 in map[key]) {
                    if (configMap[key][key2] !== blocks[num].configMap[key][key2] && key2 !== 'range_valid_notes') {
                        // console.log(key + " -> " + key2 + " -> " + map[key][key2]);
                        if (key2 !== 'method') {
                            if (key2 === 'limit_range' || key2 === 'direction' || key2 === 'active') {
                                var data_key = key2.replace('_',  '-');
                                jqueryMap[key + '_' + key2].attr('data-' + data_key, blocks[num].configMap[key][key2]);
                            } else if (key2 !== 'scale') {
                                jqueryMap[key + '_' + key2].val(blocks[num].configMap[key][key2]);
                                jqueryMap[key + '_' + key2].trigger('change');
                            }
                        } else {
                            $('#select-' + key + '-effect').val(key + '-' + blocks[num].configMap[key][key2]);
                            $('.' + key + '-' + map[key][key2]).show().siblings('div').hide();
                            if (map[key][key2] !== 'specific') {
                                jqueryMap.$select_scale.show();
                                $('.' + key + '-range-wrapper').show();
                            } else {
                                jqueryMap.$select_scale.hide();
                            }
                        }
                        if (key === 'note') {
                            if (key2 === 'scale') {
                                jqueryMap.$select_scale.val(blocks[num].configMap[key][key2]);
                            }
                            updatePianoRoll();
                        }
                        configMap[key][key2] = blocks[num].configMap[key][key2];
                    }
                }
            }
        }
    };


    pianoSliders = (function() {
        var
            value = 300,
            min = 0,
            max = 637,
            step = 1,
            pianoSliderArray = [0, 10, 16, 23, 29, 39, 49, 55, 62, 68, 75, 81, 91];

        jqueryMap.$piano_slider_min.slider({
            orientation: "horizontal",
            value: value,
            min: min,
            max: max,
            step: step,
            slide: function(event, ui) {
                // $(this).find("input").val(ui.value);
                var
                    notePixels = ui.value % 91,
                    octave = Math.floor(ui.value / 91),
                    i = 1,
                    sliderMultiply = (multiplier + 1) + (octave * 12);

                while (i <= pianoSliderArray.length - 1 && notePixels > pianoSliderArray[i]) {
                    i++;
                }

                i--;

                if (ui.value > jqueryMap.$piano_slider_max.slider("value")) {
                    jqueryMap.$piano_slider_max.slider("value", ui.value);
                    updatePianoRoll({
                        value: i + sliderMultiply,
                        params: 'range_high'
                    });
                    jqueryMap.note_range_high.val(i + sliderMultiply);
                    jqueryMap.note_range_high.trigger('change');
                    setParams('note', 'range_high', i + sliderMultiply);
                }
                updatePianoRoll({
                    value: i + sliderMultiply,
                    params: 'range_low'
                });

                setParams('note', 'range_low', i + sliderMultiply);

                jqueryMap.note_range_low.val(i + sliderMultiply);
                jqueryMap.note_range_low.trigger('change');
            }
        });

        jqueryMap.$piano_slider_max.slider({
            orientation: "horizontal",
            value: value,
            min: min,
            max: max,
            step: step,
            slide: function(event, ui) {
                //$(this).find("input").val(ui.value);
                var
                    notePixels = ui.value % 91,
                    octave = Math.floor(ui.value / 91),
                    i = 1,
                    sliderMultiply = (multiplier + 1) + (octave * 12);
                while (i <= pianoSliderArray.length - 1 && notePixels > pianoSliderArray[i]) {
                    i++;
                }

                i--;

                if (ui.value < jqueryMap.$piano_slider_min.slider("value")) {
                    jqueryMap.$piano_slider_min.slider("value", ui.value);
                    updatePianoRoll({
                        value: i + octave * 12 + 24,
                        params: 'range_low'
                    });
                    jqueryMap.note_range_low.val(i + sliderMultiply);
                    jqueryMap.note_range_low.trigger('change');
                    setParams('note', 'range_low', i + sliderMultiply);
                }

                updatePianoRoll({
                    value: i + sliderMultiply,
                    params: 'range_high'
                });
                setParams('note', 'range_high', i + sliderMultiply);

                //Update knob value
                jqueryMap.note_range_high.val(i + sliderMultiply);
                jqueryMap.note_range_high.trigger('change');
            }
        });

        jqueryMap.$piano_slider_max.hide();
        jqueryMap.$piano_slider_min.hide();
    })();


    // Loop through all effect types and create jqueryMap, UI controls
    effectMap = (function(e) {
        var
            length = effectArray.length,
            rangeLimit = {};

        for (var i = 0; i < length; i++) {
            jqueryMap[e[i] + "_effect_select"] = $("#select-" + e[i] + "-effect");
            jqueryMap[e[i] + "_specific"] = $("#" + e[i] + "-specific-effect");
            jqueryMap[e[i] + "_range_low"] = $("." + e[i] + "-rangelow-effect");
            jqueryMap[e[i] + "_range_high"] = $(("." + e[i] + "-rangehigh-effect"));
            jqueryMap[e[i] + "_step"] = $(("." + e[i] + "-step-size"));
            jqueryMap[e[i] + "_direction"] = $(("." + e[i] + "-step-switch"));
            jqueryMap[e[i] + "_limit_range"] = $(("." + e[i] + "-limit-to-range"));
            jqueryMap[e[i] + "_active"] = $(("." + e[i] + "-activator"));

            // Set configMap to store effectPanel values
            configMap[e[i]] = {
                type: e[i],
                active: false,
                method: 'progression',
                specific: 60,
                range_low: 50,
                range_high: 80,
                limit_range: true,
                step: 5,
                direction: 'up',
                scale: config.scaleNameArray[0],
                range_valid_notes: []
            };

            if (e[i] === 'note') {
                rangeLimits = {
                    min: 24,
                    max: 107
                };
            } else {
                rangeLimits = {
                    min: 0,
                    max: 120
                };
            }

            // Create effect panel dials for setting values
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_specific"],
                start_val: configMap[e[i]].specific,
                type: "effect-block",
                params: "specific",
                effect_type: e[i],
                min: rangeLimits.min,
                max: rangeLimits.max
            });
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_range_low"],
                start_val: configMap[e[i]].range_low,
                type: "effect-block",
                params: "range_low",
                effect_type: e[i],
                min: rangeLimits.min,
                max: rangeLimits.max
            });
            controlPanel.createDial({
                obj: jqueryMap[e[i] + "_range_high"],
                start_val: configMap[e[i]].range_high,
                type: "effect-block",
                params: "range_high",
                effect_type: e[i],
                min: rangeLimits.min,
                max: rangeLimits.max
            });

            jqueryMap[e[i] + "_step"]
                .spinner({
                    min: 0,
                    max: 10,
                    spin: function(event, ui) {
                        var type = ($(this).data().type);
                        setParams(type, 'step', ui.value);
                    }
                })
                .val(configMap[e[i]].step);


            // Note effect is only active effect on load
            if (e[i] === 'note') {
                configMap.note.active = true;
                toggleScale(jqueryMap.$select_scale);
            }

            // Show effect method panel based on previous selection on load
            toggleEffectMethod(jqueryMap[e[i] + "_effect_select"], true);
        }

    })(effectArray);


    // Hide/ Show effect type on select menu change
    $("#select-note-effect, #select-volume-effect, #select-velocity-effect, #select-duration-effect").change(function() {
        toggleEffectMethod($(this));
        return false;
    });
    jqueryMap.$select_scale.change(function() {
        toggleScale($(this));
        return false;
    });
    jqueryMap.$toggle_effect.click(function() {
        $(this).parent().next().slideToggle();
        $(this).toggleClass('active');
        $(this).parent().siblings('.header').find('.toggle-drop').removeClass('active');
        $(this).parent().next().siblings('.effect-box').slideUp();
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
            $(this).attr('data-limit-range', 'true');
            limit = true;
        }

        setParams(type, 'limit_range', limit);
        return false;
    });

    jqueryMap.$activator.click(function() {
        var
            active = $(this).attr('data-active'),
            type = $(this).data().type;
        if (active === 'true') {
            $(this).attr('data-active', 'false');
            active = false;
        } else {
            $(this).attr('data-active', 'true');
            active = true;
        }
        setParams(type, 'active', active);
        return false;
    });

    jqueryMap.$piano_key.click(function() {
        var type = controlPanel.getActivePanel();

        // If effect block panel not selected don't run this functionality
        if (type === "block-effect") {
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
                if (type === 'range') {
                    for (i = 0; i < blocks.length; i++) {
                        if (blocks[i].selected === true && blocks[i].type === 'block-effect') {
                            blocks[i].rebuildRangeValidNotes();
                        }
                    }
                }
            }
            var
                value = getValue($(this)),
                active_high = getValue($('.active-high')),
                active_low = getValue($('.active-low'));

            //     // Used to determine if selected piano key is closer to active high or active low
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
                case 'progression':
                case 'random':
                    update('range');
                    break;
            }

            return false;

        }


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
        createDragBox = false,
        resetBlockDrag, mouselocation, setStyles, compareMouse, compareTypes, getDragValues,
        mouseDrag, mouseUp, mouseDown, addBlock,
        dragBox = {
            width: null,
            height: null,
            xpos: null,
            ypos: null
        };
    elements = {
        section: document.getElementById("grid")
    };

    resetBlockDrag = function() {
        blockDragLeftX = config.blockSize;
        blockDragLeftY = config.blockSize;
        blockDragRightX = 0;
        blockDragRightY = 0;
    }();

    compareMouse = function(e) {
        if (utilities.gridify(mousedownX) === utilities.gridify(e.pageX - config.gridOffsetX) && utilities.gridify(mousedownY) === utilities.gridify(e.pageY - config.gridOffsetY) && config.draggingBlocks === false) {
            return "same";
        } else {
            return "different";
        }
    };
    // Compares selected block types on mouse drag release
    compareTypes = function(el) {
        for (var i = 1; i < el.length; i++) {
            if (el[i] !== el[0])
                return false;
        }
        // If all blocks the same set active panel to block type
        controlPanel.setActivePanel(el[0]);
    };
    getDragValues = function() {
        return dragBox;
    };
    // Get x and y pos of grid
    getPos = function() {
        config.gridOffsetX = $("#grid").offset().left;
        config.gridOffsetY = $("#grid").offset().top;
    };

    mouseDrag = function(e) {
        e = e || window.event;
        mouselocation = compareMouse(e);
        if (mouselocation == "different") {
            var
                mousedowngridX = utilities.gridify(mousedownX),
                mousedowngridY = utilities.gridify(mousedownY),
                blockDragRightX,
                blockDragRightY;

            if (gridArray[mousedowngridX][mousedowngridY] != -1 && blocks[gridArray[mousedowngridX][mousedowngridY]].selected === true && config.draggingBlocks === false && config.newblock === -1) {
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
                blockDragOffsetX = utilities.gridify(mousedownX) - blockDragLeftX;
                blockDragOffsetY = utilities.gridify(mousedownY) - blockDragLeftY;

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
                    gridpos = utilities.gridify(e.pageX - config.gridOffsetX) - blockDragOffsetX,
                    validMove = true;
                if (gridpos + blockDragWidth < config.gridWidth && gridpos >= 0) {
                    blockDragLeftX = gridpos;
                }

                gridpos = utilities.gridify(e.pageY - config.gridOffsetY) - blockDragOffsetY;
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
                        }
                    }
                }
            }

            if (config.draggingBlocks === false) {

                if (config.mode === "create") {
                    var
                        gridX = utilities.gridify(e.pageX - config.gridOffsetX),
                        gridY = utilities.gridify(e.pageY - config.gridOffsetY),
                        activePanel = controlPanel.getActivePanel();

                    // Add music block to the grid 
                    addBlock(gridX, gridY, activePanel);
                    blocks[config.cnt-1].selectNewSingle();

                } else {
                    var move_x = e.pageX - config.gridOffsetX,
                        move_y = e.pageY - config.gridOffsetY,
                        width = Math.abs(move_x - mousedownX),
                        height = Math.abs(move_y - mousedownY),
                        new_x, new_y;

                    new_x = (move_x < mousedownX) ? (mousedownX - width) : mousedownX;
                    new_y = (move_y < mousedownY) ? (mousedownY - height) : mousedownY;

                    dragBox = {
                        width: width,
                        height: height,
                        xpos: new_x,
                        ypos: new_y
                    };
                }
            }
        }
    };

    // Compares mouseup location with mousedown, calls old click function if same, drag select if not
    mouseUp = function(e) {
        // Set to null to remove dragbox in draw loop
        dragBox = {};

        if (e.which === 3) {
            utilities.deselectAllBlocks();
        }


        if (gridCheck === true) {

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


                leftX = utilities.gridify(leftX);
                rightX = Math.ceil(rightX / config.blockSize);
                topY = utilities.gridify(topY);
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
                        addBlock(leftX, topY, activePanel);                                                

                    } else if (config.mode === "select") {
                        for (var i = 0; i < config.cnt; i++) {
                            blocks[i].deselectBlock();
                        }
                    }
                    if(config.newblock != -1){
                        blocks[config.newblock].selectNewSingle();
                    }

                }

                //Mouse button was dragged to other squares
                else {
                    //Handle select mode
                    if (config.mode === "select" || config.mode === "trash") {
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
                            gridY,
                            typeArray = [];

                        for (var p = 0; p < config.cnt; p++) {
                            gridX = blocks[p].gridX;
                            gridY = blocks[p].gridY;

                            if (gridX < rightX && gridX >= leftX && gridY < bottomY && gridY >= topY) {

                                blocks[p].selectBlock();

                                // t = p;
                                typeArray[cnt] = blocks[p].type;
                                cnt++;

                            }
                        }
                        if (config.mode === "trash") {
                            utilities.deleteSelectedBlocks();
                        }
                        compareTypes(typeArray);
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
        if(e.button !== 2){
            getPos();

            var
                dragbox,
                activePanel = controlPanel.getActivePanel();

            mouselocation = compareMouse(e);
            e = e || window.event;

            gridCheck = true;

            mousedownX = Math.min(e.pageX - config.gridOffsetX, config.blockSize * config.gridWidth);
            mousedownY = Math.min(e.pageY - config.gridOffsetY, config.blockSize * config.gridHeight);

            if (config.mode === "create") {
                addBlock(utilities.gridify(mousedownX), utilities.gridify(mousedownY), activePanel);               
            }

            //Add drag event on mousedown
            elements.section.addEventListener('mousemove', mouseDrag, false);
        }
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
                blocks[config.cnt].rebuildRangeValidNotes();
            }

            blocks[config.cnt].setGrid();
            blocks[config.cnt].addBlock(config.cnt);
            gridArray[gridX][gridY] = config.cnt;
            config.newblock = config.cnt;
            config.cnt++;
        }
    };

    window.addEventListener("mouseup", mouseUp, false);
    elements.section.addEventListener("mousedown", mouseDown, false);

    return {
        getDragValues: getDragValues
    };


}();



keyboardEvents = function() {
    // var stopArrow = document.getElementById("stop");

    //Keydown handler for keyboard input
    window.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 16: // Shift
                config.shiftkey = 1;
                break;

            case 32: // Space
                if (config.draggingBlocks === false) {
                    config.pause = config.pause * -1;
                    if (config.pause === -1) {
                        $("[data-mode='play']").addClass('active').siblings().removeClass('active');
                    } else {
                        $("[data-mode='pause']").addClass('active').siblings().removeClass('active');
                    }
                }
                break;

            case 37: // Left
                musicBlockPanel.sendBlocks('left');
                // musicBlockPanel.setParams('static_direction', 'left');
                break;

            case 38: // Up
                musicBlockPanel.sendBlocks('up');
                break;

            case 39: // Right
                musicBlockPanel.sendBlocks('right');
                break;

            case 40: // Down
                musicBlockPanel.sendBlocks('down');
                break;

            case 49: // 1
                utilities.selectAllBlocks();
                break;
            case 50: // 2
                utilities.deselectAllBlocks();
                break;
            case 51: // 3
                utilities.deleteSelectedBlocks();
                break;
            case 52: // 4
                utilities.deleteAllBlocks();
                break;
            case 77: // m
                if (config.mode === 'create') {
                    config.mode = 'select';
                } else if (config.mode === 'select') {
                    config.mode = 'trash';
                } else {
                    config.mode = 'create';
                }
                $('[data-mode=' + config.mode + ']').addClass('active').siblings().removeClass('active');
                break;

                // case 65: // a
                //     config.advance *= -1;
                //     break;

                // case 68: // d
                //     var out = "FULL GRID DUMPMONSTER";
                //     for (var i = 0; i < config.gridWidth; i++) {
                //         out = out + "\n";
                //         for (var j = 0; j < config.gridHeight; j++) {
                //             if ((gridArray[j][i] + "").length === 1)
                //                 out = out + " ";
                //             out = out + gridArray[j][i] + " ";
                //         }
                //     }
                //     break;

            case 83: // s
                musicBlockPanel.sendBlocks('none');
                break;

            case 107: // Numpad +
                if(config.masterVolume < 100){
                    config.masterVolume += 5;
                }
                break;

            case 109: // Numpad -
                if(config.masterVolume > 0){
                    config.masterVolume -= 5;
                }
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

    // stopArrow.addEventListener("click", function() {
    //     animateBlock("none");
    // });

}();

startSyncCounter();