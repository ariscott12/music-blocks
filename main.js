// "use strict";

/*
Here we set global configurations for the music app
these settings are for variables that are used in multiple modules
don't put configurations here that can be locally scoped to a module
*/
var
    config = {
        block_speed: 4,
        block_size: 32,
        grid_height: 18,
        grid_width: 20,
        grid_offset_x: 0,
        grid_offset_y: 0,
        is_paused: -1,
        is_system_paused: false,
        advance: -1,
        is_shiftkey_enabled: 0,
        selected_block_count: 0,
        mode: 'create',
        block_count: 0,
        new_block: -1,
        instruments_to_load: 1,
        is_blocks_dragged: false,
        clear_message: 'Are you sure you want to clear the board?',
        master_volume: 100,
        is_app_muted: -1,
    },

    valid_input = {
        type: null,
        x: null,
        y: null,
        keycode: null,
        element_id: null,
        blockref: null,
    },
     
    canvas = document.getElementById('grid'),
    context = canvas.getContext('2d'),
    gridArray = new Array([]),
    tutorialArray = new Array([]),
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
    'gunshot': 127,
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
    'trombone': 57

    // 'fretless_bass': 35,
    // 'hammond_organ': 16,
    // 'electric_jazz_guitar': 26,
    // 'alto_sax': 65,
    // 'tenor_sax': 66,
    // 'flute': 73,
    // 'sawtooth_wave_lead': 82
};


// This is called from loadSoundFonts Module
var initializeApp = function() {
  

    // Show the app and hide the page loader
    $('#wrapper').fadeIn();
    $('.spinner-page').fadeOut();

    // Check what browser user is in, if user is not in Chrome display browser prompt
    if (browser() != 'Chrome') {
        $('[data-message="browser-prompt"]').show();
    }
    // Click function to hide browser prompt
    $('[data-id="close-message"]').click(function() {
        $('[data-message="browser-prompt"]').hide();
    });

  
    // Initialize the Modules
    buildTheGrid.initMod();
    musicScales.initMod();
    spriteImages.initMod();

};



/* Here we load the MIDI sound fonts and populate our MIDI Programs
 * Once the Sound Fonts have loaded we run the initialize App function
 */
var loadSountFonts = function() {
    // This checks the config object to see how many instruments we want to load on page load
    var setMidiPrograms = function() {
        var count = 0;
        for (var key in midiInstruments) {
            if (count < config.instruments_to_load) {
                MIDI.programChange(count, midiInstruments[key]);
                count++;
            }
        }
    };

    window.onload = function() {
        var instrumentNames = [];

        for (var i = 0; i < config.instruments_to_load; i++) {
            instrumentNames[i] = Object.keys(midiInstruments)[i];
        }

        MIDI.loadPlugin({
            soundfontUrl: "./soundfont/",
            instruments: instrumentNames,
            onsuccess: function() {
                setMidiPrograms();
            }
        });
    };
}();


// Builds the HTML grid and sets the canvas widht and height
var buildTheGrid = (function() {
    var
        gridHorizontal,
        gridVertical,
        gridPixelHeight,
        gridPixelWidth,
        elements = {},

        //Private Methods
        resizeGridConfigHeight, createHorizontalGridElements, createVerticalGridElements,
        setGridDimensions, getDOMELements,

        //Public Methods
        initMod;


    resizeGridConfigHeight = function() {
        var
            window_height = $(window).height();

        if (window_height <= 740 && window_height > 700) {
            config.grid_height = 17;
        } else if (window_height <= 700 && window_height > 670) {
            config.grid_height = 16;
        } else if (window_height <= 670) {
            config.grid_height = 15;
        }
    };
    createHorizontalGridElements = function() {
        for (var q = 0; q < config.grid_height; q++) {
            var node = document.createElement('LI');
            elements.grid_horizontal.appendChild(node);
            node.style.width = (gridPixelWidth) + 'px';
            node.style.marginTop = (config.block_size - 1) + 'px';
        }
    };
    createVerticalGridElements = function() {
        for (var i = 0; i < config.grid_width; i++) {
            var node = document.createElement('LI');
            elements.grid_vertical.appendChild(node);
            node.style.height = (gridPixelHeight) + 'px';
            node.style.marginRight = (config.block_size - 1) + 'px';

            //Create empty grid array
            gridArray.push([]);
            for (var j = 0; j < config.grid_height; j++) {
                gridArray[i][j] = -1;
            }
        }
    };

    setGridDimensions = function() {
        gridPixelWidth = config.block_size * config.grid_width;
        gridPixelHeight = config.block_size * config.grid_height;

        elements.grid_lines.style.width = gridPixelWidth + 'px';
        elements.grid_lines.style.height = gridPixelHeight + 'px';

        canvas.width = gridPixelWidth;
        canvas.height = gridPixelHeight;

        // Create the DOM elements
        createHorizontalGridElements();
        createVerticalGridElements();
    };

    getDOMELements = function() {
        elements = {
            grid_lines: document.getElementById('grid_lines'),
            grid_horizontal: document.getElementById('gridHorizontal'),
            grid_vertical: document.getElementById('gridVertical')
        };
    };

    initMod = function() {
        // First we resize the config.grid_height based on browser size
        resizeGridConfigHeight();

        // Get the DOM elements then set the Grid Dimensions
        getDOMELements();
        setGridDimensions();
    };

    return {
        initMod: initMod
    };
})();


var musicScales = function() {
    var
        scaleNames = [],
        scaleNumbers = [],

        // Private Methods
        populateScaleArray,
        
        // Public Methods
        populateScaleSelect, getScaleNumbers, getScaleName;

    populateScaleSelect = function() {
        var select = document.getElementById('select-note-scale');
        for (var i = 0; i < scaleNames.length; i++) {
            var opt = document.createElement('option');
            opt.innerHTML = scaleNames[i];
            opt.value = scaleNames[i];
            select.appendChild(opt);
        }
    };
    populateScaleArray = function(scale_name, scale_numbers) {
        scaleNames.push(scale_name);
        scaleNumbers.push(scale_numbers);
    };

    getScaleNumbers = function(scale_name) {
        if (scaleNames.indexOf(scale_name) in scaleNumbers) {
            return scaleNumbers[scaleNames.indexOf(scale_name)];
        } else {
            throw new Error('getScaleNumbers(): Array key does not exist, array may need to be populated');
        }
    };

    getScaleName = function(array_key) {
        if (array_key in scaleNames) {
            return scaleNames[array_key];
        } else {
            throw new Error('getScaleName(): Array key does not exist, array may need to be populated');
        }

    };

    initMod = function() {

        // Populate the scale Arrays
        populateScaleArray("Chromatic (None)", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
        populateScaleArray("C Major / A Minor", [0, 2, 4, 5, 7, 9, 11]);
        populateScaleArray("D Major / B Minor", [1, 2, 4, 6, 7, 9, 11]);
        populateScaleArray("E Major / C# Minor", [1, 3, 4, 6, 8, 9, 11]);
        populateScaleArray("F Major / D Minor", [0, 2, 4, 5, 7, 9, 10]);
        populateScaleArray("G Major / E Minor", [0, 2, 4, 6, 7, 9, 11]);
        populateScaleArray("A Major / F# Minor", [1, 2, 4, 6, 8, 9, 11]);
        populateScaleArray("B Major / G# Minor", [1, 3, 4, 6, 8, 10, 11]);
        populateScaleArray("Bb Major / G minor", [0, 2, 3, 5, 7, 9, 10]);
        populateScaleArray("Eb Major / C Minor", [0, 2, 3, 5, 7, 8, 10]);
        populateScaleArray("Ab Major / F Minor", [0, 1, 3, 5, 7, 8, 10]);
        populateScaleArray("Db Major / Bb Minor", [0, 1, 3, 5, 6, 8, 10]);
        populateScaleArray("Gb Major / Eb Minor", [1, 3, 5, 6, 8, 10, 11]);
        populateScaleArray("Cb Major / Ab Minor", [1, 3, 4, 6, 8, 10, 11]);
        populateScaleArray("F# Major / D# Minor", [1, 3, 5, 6, 8, 10, 11]);
        populateScaleArray("C# Major / A# Minor", [0, 1, 3, 5, 6, 8, 10]);

        // Populate the scale select dropdown in the effects panel
        populateScaleSelect();
    };
    return {
        getScaleName: getScaleName,
        getScaleNumbers: getScaleNumbers,
        populateScaleSelect: populateScaleSelect,
        initMod:initMod
    };
}();

var spriteImages = function() {
    var spriteMap = {},

        // Public Methods
        getSpriteMap,
        makeSprite;

    getSpriteMap = function() {
        return spriteMap;
    };
    makeSprite = function() {
        var
            arg = arguments[0],
            image = arg.image || 'note-active.png',
            key = arg.key || 'note_active_image';

        spriteMap[key] = new Image();
        spriteMap[key].src = './images/' + image;
    };

    initMod = function() {
        makeSprite({
            key: 'note_active',
            image: 'note-active.png'
        });
        makeSprite({
            key: 'volume_active',
            image: 'volume-active.png'
        });
        makeSprite({
            key: 'velocity_active',
            image: 'velocity-active.png'
        });
        makeSprite({
            key: 'duration_active',
            image: 'duration-active.png'
        });
        makeSprite({
            key: 'mb_arrow_up',
            image: 'mb-up.png'
        });
        makeSprite({
            key: 'mb_arrow_down',
            image: 'mb-down.png'
        });
        makeSprite({
            key: 'mb_arrow_right',
            image: 'mb-right.png'
        });
        makeSprite({
            key: 'mb_arrow_left',
            image: 'mb-left.png'
        });
        makeSprite({
            key: 'mute_overlay',
            image: 'mute-overlay.png'
        });
        makeSprite({
            key: 'solo_overlay',
            image: 'solo-overlay.png'
        });
    };

    return {
        initMod: initMod,
        makeSprite: makeSprite,
        getSpriteMap: getSpriteMap
    };
}();



//// Temporary initalize app here ////
initializeApp();


/* 
 * Music block object and Methods
 * Serves as parent object for Effect Blocks and Music Blocks
*/
var blockProto = {
    block_num: 0,
    old_direction: 'none',
    new_direction: 'none',
    direction: 'none',
    queued: 1,
    selected: false,
    selected_color: null,
    not_selected_color: null,
    halfpoint: -1,
    is_waiting: false,
    num_collisions: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    gridX: 0,
    gridY: 0,
    size: 8,
    highligh_counter: 0,
    prevgridX: 0,
    prevgridy: 0,
    block_hex_colors: ['#d27743', '#debe4e', '#cf5a4c', '#9473f3', '#4077d5', '#37a354', '#3fc3d8'],
    // section: document.getElementById('grid'),
    sprite_map: spriteImages.getSpriteMap(),

    setGrid: function() {
        this.gridX = utilities.gridify(this.posX);
        this.gridY = utilities.gridify(this.posY);
        this.prevgridX = this.gridX;
        this.prevgridY = this.gridY;
    },
    shadeColor: function(color, percent) {
        var
            val = {},
            RR, GG, BB,
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

        RR = ((R.toString(16).length == 1) ? '0' + R.toString(16) : R.toString(16));
        GG = ((G.toString(16).length == 1) ? '0' + G.toString(16) : G.toString(16));
        BB = ((B.toString(16).length == 1) ? '0' + B.toString(16) : B.toString(16));

        //  Returns "#" + RR + GG + BB;
        return val;
    },

    /*
     * Set hex color of the block using the block_hex_color array
     * Set the active and not active shade colors 
     */
    setBlockColors: function() {
        var
            musicBlockShade = -35,
            effectBlockShade = 65,
            baseColor = '#2B2B2B';

        if (this.type === 'block-music') {
            // Check if the instrument number is in the hex array
            if (this.block_hex_colors[this.instrument] === undefined) {
                baseColor = this.block_hex_colors[(this.instrument % this.block_hex_colors.length)];
            } else {
                baseColor = this.block_hex_colors[this.instrument];
            }
            this.not_selected_color = this.shadeColor(baseColor, 0);
            this.selected_color = this.shadeColor(baseColor, musicBlockShade);
        } else {
            this.not_selected_color = this.shadeColor(baseColor, 0);
            this.selected_color = this.shadeColor(baseColor, effectBlockShade);
        }
    },
    addBlock: function(count) {
        this.block_num = count;
        this.setBlockColors();
    },
    selectBlock: function() {
        // Only select a block if it's not selected
        if (this.selected !== true) {
            this.selected = true;
            config.selected_block_count++;
        }
    },
    deselectBlock: function() {
        // Only deselect block if it is already selected
        if (this.selected) {
            this.selected = false;
            config.selected_block_count--;
        }
    },
    removeBlock: function() {
        blocks.splice(this.block_num, 1);
        var length = blocks.length;

        for (var v = this.block_num; v < length; v++) {
            blocks[v].block_num = v;
        }
        for (var t = 0; t < config.grid_width; t++) {
            for (var u = 0; u < config.grid_height; u++) {
                if (gridArray[t][u] == this.block_num)
                    gridArray[t][u] = -1;
                if (gridArray[t][u] >= this.block_num)
                    gridArray[t][u]--;
            }
        }
        config.block_count--;
        config.selected_block_count--;
    },
    selectNewSingle: function() {
        for (var i = 0; i < blocks.length; i++) {
            blocks[i].deselectBlock();
        }
        if (config.mode === 'trash') {
            this.removeBlock();
        } else {
            this.selectBlock();
            if (this.selected) {
                if (this.type === 'block-music') {
                    musicBlockPanel.setToBlock(this.block_num);
                }
                if (this.type == 'block-effect') {
                    effectBlockPanel.setToBlock(this.block_num);
                }
                controlPanel.setActivePanel(this.type);
            }
        }
    },
    highlightBlock: function() {
        this.highligh_counter = 70;
    },
    playmidi: function() {
        var
            duration = this.duration / 120;

        // If music block is note selected create 'light effect' on collision
        if (this.selected === false) {
            this.highlightBlock();
        }
        // check if block is muted or master is muted
        if (config.is_app_muted === -1 && this.mute !== true) {
            if (config.blockSolo === true) {
                if (this.solo === true) {
                    utilities.triggerMidi(Math.floor(this.volume * config.master_volume / 100), this.instrument, this.note, this.velocity, (this.duration / 120));
                }
            } else {
                utilities.triggerMidi(Math.floor(this.volume * config.master_volume / 100), this.instrument, this.note, this.velocity, (this.duration / 120));
            }
        }
    },
    drawSpriteOnBlock: function(image) {
        context.globalAlpha = 1;
        context.drawImage(image,
            this.posX + 1 + this.size,
            this.posY + this.size, (this.width - (this.size * 2) - 1), (this.height - (this.size * 2) - 1));
        context.globalAlpha = 1.0;
    },
    selectDirectionSprite: function() {
        if (this.new_direction !== 'none') {
            this.drawSpriteOnBlock(this.sprite_map['mb_arrow_' + this.new_direction]);
        }
    },
    selectBlockMuteSprite: function() {
        if (this.mute) {
            this.drawSpriteOnBlock(this.sprite_map.mute_overlay);
        }
        if (this.solo) {
            this.drawSpriteOnBlock(this.sprite_map.solo_overlay);
        }
    },
    selectEffectSprite: function() {
        if (this.configMap.note.active) {
            this.drawSpriteOnBlock(this.sprite_map.note_active);
        }
        if (this.configMap.volume.active) {
            this.drawSpriteOnBlock(this.sprite_map.volume_active);
        }
        if (this.configMap.velocity.active) {
            this.drawSpriteOnBlock(this.sprite_map.velocity_active);
        }
        if (this.configMap.duration.active) {
            this.drawSpriteOnBlock(this.sprite_map.duration_active);
        }
    },
    // Draws the block on the canvas
    render: function() {
        if (this.size > 0) {
            this.size--;
        }
        if (this.highligh_counter > 0) {
            this.highligh_counter -= 4;
        }
        if (!this.selected) {
            context.fillStyle = "rgb(" + (this.not_selected_color.red + (this.highligh_counter * 2)) + ", " + (this.not_selected_color.green + this.highligh_counter) + ", " + (this.not_selected_color.blue + (this.highligh_counter * 3)) + ")";
            context.fill();
        } else {
            context.fillStyle = "rgb(" + (this.selected_color.red + this.highligh_counter) + ", " + (this.selected_color.green + this.highligh_counter) + ", " + (this.selected_color.blue + this.highligh_counter) + ")";
            context.fill();
        }

        context.fillRect(this.posX + 1 + this.size, this.posY + this.size, (this.width - (this.size * 2) - 1), (this.height - (this.size * 2) - 1));
        if (this.type === 'block-music') {
            this.selectBlockMuteSprite();
        }
        if ((this.type === 'block-music' && this.selected && !this.is_waiting) || config.is_paused === 1 || config.is_system_paused) {
            this.selectDirectionSprite();
        }
        if (this.type === 'block-effect') {
            this.selectEffectSprite();
        }
    }
};

var makeMusicBlock = function(w, h, x, y, s, t) {
    var block = Object.create(blockProto);
    block.width = w;
    block.height = h;
    block.posX = x;
    block.posY = y;
    block.block_speed = s;
    block.type = t;
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
        this.mute = map.mute;
        this.solo = map.solo;
    };
    block.setMidiValues = function(type, value) {
        this[type] = value;
    };

    return block;
};


var makeEffectBlock = function(w, h, x, y, s, t) {
    var block = Object.create(blockProto);

    block.width = w;
    block.height = h;
    block.posX = x;
    block.posY = y;
    block.block_speed = s;
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
                limit_range: map[key].limit_range,
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
    };

    block.rebuildRangeValidNotes = function() {
        //Create the random valid notes array based on scale and range_low and range_high
        this.configMap.note.range_valid_notes = [];
        var valid_notes = musicScales.getScaleNumbers(this.configMap.note.scale);
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
        ' is_Waiting: ' + blocks[blockref].is_waiting);
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
            return Math.floor((pixels - minX) / config.block_size);
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
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true) {
                    blocks[i].removeBlock();
                    i--;
                }
            }
        },
        deleteAllBlocks: function() {
            for (var j = 0; j < config.block_count; j++) {
                blocks[j].removeBlock();
                j--;
            }
            config.selected_block_count = 0;
        },
        selectAllBlocks: function() {
            for (var k = 0; k < config.block_count; k++) {
                blocks[k].selectBlock();
            }
        },
        deselectAllBlocks: function() {
            for (var l = 0; l < config.block_count; l++) {
                if (blocks[l].selected === true) {
                    blocks[l].deselectBlock();
                }
            }
        },
        sendBlocks: function(direction) {
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true && blocks[i].type === 'block-music') {
                    blocks[i].new_direction = direction;
                    blocks[i].block_speed = config.block_speed;
                }
            }
        },
        stopBlocks: function() {
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true && blocks[i].type === 'block-music') {
                    blocks[i].new_direction = 'none';
                    //blocks[i].block_speed = 0;
                }
            }
        },
        triggerMidi: function(vol, pro, note, vel, dur) {
            MIDI.setVolume(0, vol);
            MIDI.noteOn(pro, note, vel, 0);
            MIDI.noteOff(pro, note, dur);
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

        if (config.selected_block_count === 1 && blocks[mblockref].selected === true && eblockref.type !== 'block-music') {
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

        maxGridX = config.grid_width - 1;
        maxGridY = config.grid_height - 1;
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
            blocks[blockref].num_collisions++;
            return oppositeDirection(direction);
        }

        //Check for collision with object directly in path
        else if (gridArray[directGridX][directGridY] !== -1) {
            processEffects(blockref, gridArray[directGridX][directGridY]);
            blocks[blockref].num_collisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 1 collision
        else if (diag1GridX >= minGridX && diag1GridY >= minGridY && diag1GridX <= maxGridX && diag1GridY <= maxGridY && gridArray[diag1GridX][diag1GridY] !== -1 && blocks[gridArray[diag1GridX][diag1GridY]].is_waiting === false && (blocks[gridArray[diag1GridX][diag1GridY]].num_collisions <= blocks[blockref].num_collisions || skipcheck) && blocks[gridArray[diag1GridX][diag1GridY]].old_direction === diag1Direction) {
            processEffects(blockref, gridArray[diag1GridX][diag1GridY]);
            blocks[blockref].num_collisions++;
            return oppositeDirection(direction);
        }

        //Check for diagonal 2 collision
        else if (diag2GridX >= minGridX && diag2GridY >= minGridY && diag2GridX <= maxGridX && diag2GridY <= maxGridY && gridArray[diag2GridX][diag2GridY] !== -1 && blocks[gridArray[diag2GridX][diag2GridY]].is_waiting === false && (blocks[gridArray[diag2GridX][diag2GridY]].num_collisions <= blocks[blockref].num_collisions || skipcheck) && blocks[gridArray[diag2GridX][diag2GridY]].old_direction === diag2Direction) {
            processEffects(blockref, gridArray[diag2GridX][diag2GridY]);
            blocks[blockref].num_collisions++;
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
        syncounter = -config.block_size,
        drag_map = {};

    (function syncCounter() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (var z = 0; z < config.block_count; z++) {
            block = blocks[z].render();
        }
        drag_map = setGridEvents.getDragValues();
        context.fillStyle = 'rgba(225,225,225,0.5)';
        context.fill();
        context.fillRect(drag_map.xpos, drag_map.ypos, drag_map.width, drag_map.height);

        if (!config.is_system_paused && ((config.is_paused === 1 && config.advance === 1) || config.is_paused === -1)) {
            // Clear canvas on loop and redraw blocks


            if (syncounter == config.block_size) {
                if (config.block_count !== 0) {
                    //update old_direction, direction and queue flag
                    for (var n = 0; n < config.block_count; n++) {
                        blocks[n].old_direction = blocks[n].direction = blocks[n].new_direction;
                        if (blocks[n].queued == 1) {
                            blocks[n].queued = 0;
                        }
                        blocks[n].prevgridX = blocks[n].gridX;
                        blocks[n].prevgridY = blocks[n].gridY;
                        blocks[n].is_waiting = false;

                        //reset num_collisions
                        blocks[n].num_collisions = 0;
                    }

                    //first collision check
                    for (var l = 0; l < config.block_count; l++) {
                        dir = collisions.process(blocks[l].direction, blocks[l].gridX, blocks[l].gridY, l, true);
                        blocks[l].direction = blocks[l].new_direction = dir;
                    }

                    //Update old_direction for second collision
                    for (var k = 0; k < config.block_count; k++) {
                        blocks[k].old_direction = blocks[k].direction;
                    }

                    //second collision check
                    for (var o = 0; o < config.block_count; o++) {
                        dir = collisions.process(blocks[o].direction, blocks[o].gridX, blocks[o].gridY, o, false);
                        blocks[o].direction = dir;

                        //If block collided twice, wait
                        if (blocks[o].num_collisions >= 2) {
                            blocks[o].is_waiting = true;
                        }

                        //Check if block was moving and had a collision
                        if (blocks[o].num_collisions >= 1 && blocks[o].is_waiting === false) {
                            blocks[o].playmidi();
                        }
                    }

                    //mid-square collision detection
                    for (var m = 0; m < config.block_count; m++) {
                        if (blocks[m].direction == "up" && blocks[m].is_waiting === false && blocks[m].gridY > 1 && gridArray[blocks[m].gridX][blocks[m].gridY - 1] === -1 && gridArray[blocks[m].gridX][blocks[m].gridY - 2] !== -1 && blocks[gridArray[blocks[m].gridX][blocks[m].gridY - 2]].is_waiting === false && blocks[gridArray[blocks[m].gridX][blocks[m].gridY - 2]].direction === "down") {
                            blocks[m].halfpoint = blocks[m].posY - (config.block_size / 2);
                        }
                        if (blocks[m].direction == "down" && blocks[m].is_waiting === false && blocks[m].gridY < config.grid_height - 2 && gridArray[blocks[m].gridX][blocks[m].gridY + 1] === -1 && gridArray[blocks[m].gridX][blocks[m].gridY + 2] !== -1 && blocks[gridArray[blocks[m].gridX][blocks[m].gridY + 2]].is_waiting === false && blocks[gridArray[blocks[m].gridX][blocks[m].gridY + 2]].direction === "up") {
                            blocks[m].halfpoint = blocks[m].posY + (config.block_size / 2);
                        }
                        if (blocks[m].direction == "left" && blocks[m].is_waiting === false && blocks[m].gridX > 1 && gridArray[blocks[m].gridX - 1][blocks[m].gridY] === -1 && gridArray[blocks[m].gridX - 2][blocks[m].gridY] !== -1 && blocks[gridArray[blocks[m].gridX - 2][blocks[m].gridY]].is_waiting === false && blocks[gridArray[blocks[m].gridX - 2][blocks[m].gridY]].direction === "right") {
                            blocks[m].halfpoint = blocks[m].posX - (config.block_size / 2);
                        }
                        if (blocks[m].direction == "right" && blocks[m].is_waiting === false && blocks[m].gridX < config.grid_width - 2 && gridArray[blocks[m].gridX + 1][blocks[m].gridY] === -1 && gridArray[blocks[m].gridX + 2][blocks[m].gridY] !== -1 && blocks[gridArray[blocks[m].gridX + 2][blocks[m].gridY]].is_waiting === false && blocks[gridArray[blocks[m].gridX + 2][blocks[m].gridY]].direction === "left") {
                            blocks[m].halfpoint = blocks[m].posX + (config.block_size / 2);
                        }
                    }
                }
                syncounter = 0;
            }

            /////set block direction play note on collision
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].is_waiting === false) {
                    if (blocks[i].direction == "up") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint > blocks[i].posY - blocks[i].block_speed) {
                                blocks[i].posY = 2 * blocks[i].halfpoint + config.block_speed - blocks[i].posY;
                                blocks[i].direction = blocks[i].new_direction = "down";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridY = blocks[i].gridY;
                                blocks[i].playmidi();

                            } else blocks[i].posY += -1 * blocks[i].block_speed;
                        }
                    } else if (blocks[i].direction == "down") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint < blocks[i].posY + blocks[i].block_speed) {
                                blocks[i].posY = 2 * blocks[i].halfpoint - config.block_speed - blocks[i].posY;
                                blocks[i].direction = blocks[i].new_direction = "up";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridY = blocks[i].gridY;
                                blocks[i].playmidi();

                            } else blocks[i].posY += 1 * blocks[i].block_speed;
                        }
                    }
                    if (blocks[i].direction == "left") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint > blocks[i].posX - blocks[i].block_speed) {
                                blocks[i].posX = 2 * blocks[i].halfpoint + config.block_speed - blocks[i].posX;
                                blocks[i].direction = blocks[i].new_direction = "right";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridX = blocks[i].gridX;
                                blocks[i].playmidi();

                            } else blocks[i].posX += -1 * blocks[i].block_speed;
                        }
                    } else if (blocks[i].direction == "right") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint < blocks[i].posX + blocks[i].block_speed) {
                                blocks[i].posX = 2 * blocks[i].halfpoint - config.block_speed - blocks[i].posX;
                                blocks[i].direction = blocks[i].new_direction = "left";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridX = blocks[i].gridX;
                                blocks[i].playmidi();

                            } else blocks[i].posX += 1 * blocks[i].block_speed;
                        }
                    }
                    // blocks[i].updatePosition();
                }
            }

            //After moving, update all block positions
            for (var q = 0; q < config.block_count; q++) {
                //calculate new grid positions, floor handles blocks moving left and up
                blocks[q].gridX = utilities.gridify(blocks[q].posX);
                blocks[q].gridY = utilities.gridify(blocks[q].posY);

                //if blocks are moving into a new block, move block reference 1 right or down if needed
                if (blocks[q].direction === "right" && (blocks[q].posX / config.block_size) % 1 !== 0)
                    blocks[q].gridX++;
                if (blocks[q].direction === "down" && (blocks[q].posY / config.block_size) % 1 !== 0)
                    blocks[q].gridY++;

                gridArray[blocks[q].gridX][blocks[q].gridY] = q;

                if (syncounter === config.block_size - config.block_speed && (blocks[q].prevgridX !== blocks[q].gridX || blocks[q].prevgridY !== blocks[q].gridY)) {
                    gridArray[blocks[q].prevgridX][blocks[q].prevgridY] = -1;
                }
            }

            syncounter += config.block_speed;
            config.advance = -1;

        }
        requestAnimationFrame(syncCounter);
    })();
};




topPanel = function() {
    var jqueryMap = {
            $mode_select: $('.mode-select'),
            $play_select: $('.play-select'),
            $batch_edits: $('.batch-edits'),
            $hotkey_btn: $('[data-id = "hotkeys"]'),
            $hotkey_menu: $('[data-id = "hotkey-menu"]'),
            $master_volume: $('.master-volume-slider'),
            $master_mute: $('[data-id = "toggle-master-mute"]'),
        },
        updateMode;

    jqueryMap.$master_volume.slider({
        orientation: "horizontal",
        value: config.master_volume,
        min: 0,
        max: 100,
        step: 1,
        slide: function(event, ui) {
            config.master_volume = ui.value;
        }
    });

    //  Toggle master mute on and off
    jqueryMap.$master_mute.click(function() {
        $(this).attr('data-mute', $(this).attr('data-mute') === 'true' ? 'false' : 'true');
        config.is_app_muted = config.is_app_muted * -1;
        if ($(this).attr('data-mute') === 'false') {
            $(this).attr('src', 'images/icon-volume.png');
        } else {
            $(this).attr('src', 'images/icon-volume-mute.png');
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
                config.is_paused = 1;
                break;
            case 'play':
                config.is_paused = -1;
                break;
            case 'select-all':
                utilities.selectAllBlocks();
                break;
            case 'clear-all':
                var x;
                if (confirm(config.clear_message) === true) {
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
        config.is_system_paused = true;
        jqueryMap.$hotkey_menu.fadeIn(300);
    });
    jqueryMap.$hotkey_menu.click(function(event) {
        var target = $(event.target);
        if (!target.is("td")) {
            $(this).hide();
            $(this).fadeOut(300, function() {
                $("#wrapper").trigger("click");
            });
        }
        config.is_system_paused = false;
    });

}();

controlPanel = function() {
    var
        jqueryMap = {
            $select: $('.block-type-select'),
            $block_music: $('#block-music'),
            $block_effect: $('#block-effect'),
            $range_indicator: $('.range-indicator'),
            $piano_roll_slider: $('.piano-roll-slider'),
            $drum_indicator: $('.drum-type-wrapper')
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
            musicBlockPanel.toggleDrumIndicator();

        } else {
            effectBlockPanel.updatePianoRoll();
            jqueryMap.$block_effect.addClass('active').siblings().removeClass('active');
            jqueryMap.$drum_indicator.hide();
            musicBlockPanel.toggleDrumIndicator(type);
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
            $mute: $('.mute-toggle'),
            $solo: $('.solo-toggle'),
            $mute_solo: $('.mute-solo'),
            $mute_piano: $('.mute-piano'),
            $drumkit_type: $('.drumkit-type-wrapper')
        },
        configMap = {
            note: 60,
            volume: 60,
            duration: 40,
            velocity: 60,
            instrument: 0,
            // static_direction: 'up',
            mute: false,
            solo: false
        },
        //setDirection, 
        //getDirection, 
        //sendBlocks,
        updateBlockColors,
        getPanelValues, updatePianoRoll,
        setToBlock, setParams, populateInstruments, toggleDrumIndicator,
        multiplier = controlPanel.getMultiplier(),
        mutePiano = false,
        loadingInstrument = false;

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
            if (key === 'gunshot') {
                key = 'drums';
            }
            if (cnt > config.instruments_to_load - 1) {
                key = key + ' (not loaded)';
                el = 'not-loaded';
            }
            jqueryMap.$instrument.append('<span>test</span><option class = \"' + el + '\" value="' + cnt + '">' + key + '</option>');
            cnt++;
        }
    })();

    setParams = function(type, value) {
        for (var i = 0; i < config.block_count; i++) {
            if (blocks[i].selected === true && blocks[i].type == 'block-music') {
                blocks[i].setMidiValues(type, value);
                blocks[i].highlightBlock();
            }
        }
        // update configMap anytime a value is updated on the music block panel
        configMap[type] = value;
    };
    getPanelValues = function() {
        return {
            configMap: configMap
        };
    };
    updateBlockColors = function() {
        for (var l = 0; l < config.block_count; l++) {
            if (blocks[l].selected === true) {
                blocks[l].setBlockColors();
            }
        }
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

    // shows and hides drum kit type UI below piano roll
    // takes optional argument for active control panel
    toggleDrumIndicator = function(activePanel) {
        var option = jqueryMap.$instrument.find('option:selected');

        // if effect block panel is active always hide drum indicator
        if (activePanel === 'block-effect') {
            jqueryMap.$drumkit_type.hide();
        } else {
            if (option.text().indexOf('drums') >= 0) {
                jqueryMap.$drumkit_type.show();
            } else {
                jqueryMap.$drumkit_type.hide();
            }
        }
    };



    // Update music block panel UI to selected music block values
    setToBlock = function(num) {
        for (var key in configMap) {
            var mapkey = configMap[key];
            configMap[key] = blocks[num][key];
            if (mapkey != blocks[num][key]) {
                switch (key) {
                    // Nothing to update for static_direction so break out of loop
                    // case 'static_direction':
                    //     return;
                    //     setDirection(blocks[num].static_direction);
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
        $(this).blur();

        if (isloaded === 'not-loaded') {
            loadingInstrument = true;
            var str = option.text().replace(/\(|\)/g, '').replace(/not loaded/g, '...');
            config.is_system_paused = true;
            $spinner.show();
            option.text(str);
            MIDI.loadPlugin({
                soundfontUrl: "./soundfont/",
                instruments: [Object.keys(midiInstruments)[program]],
                onsuccess: function() {
                    loadingInstrument = false;
                    MIDI.programChange(program, midiInstruments[Object.keys(midiInstruments)[program]]);
                    console.log("loaded");
                    option.attr('class', 'loaded');
                    str = option.text().replace(/\(|\)/g, '').replace(/\.\.\./g, '');
                    option.text(str);
                    config.is_system_paused = false;
                    $spinner.hide();
                }
            });
        }
        setParams('instrument', program);
        updateBlockColors();
        toggleDrumIndicator();

        return false;
    });

    jqueryMap.$direction.find('li').click(function() {
        var direction = $(this).attr('id');
        if (direction === 'none') {
            utilities.stopBlocks();
        } else {
            utilities.sendBlocks(direction);
        }

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
            for (var k = 0; k < config.block_count; k++) {
                if (blocks[k].solo === true) {
                    config.blockSolo = true;
                }
            }
        }
    });

    // jqueryMap.$stop_block.find('span').click(function() {

    //     return false;
    // });

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
        if (mutePiano !== true && loadingInstrument === false) {
            utilities.triggerMidi(70, configMap.instrument, value, 70, 0.3);
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
    // jqueryMap.$send_blocks.click(function() {
    //     sendBlocks();
    // });

    return {
        setToBlock: setToBlock,
        updatePianoRoll: updatePianoRoll,
        setParams: setParams,
        getPanelValues: getPanelValues,
        toggleDrumIndicator: toggleDrumIndicator
            // sendBlocks: sendBlocks
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
        for (var i = 0; i < config.block_count; i++) {
            if (blocks[i].selected === true && blocks[i].type == 'block-effect') {
                blocks[i].setMidiValues(type, attr, value);
                blocks[i].highlightBlock();
                if (attr == "scale" || attr == "range_high" || attr == "range_low") {
                    blocks[i].rebuildRangeValidNotes();
                }
            }
        }
        // Update configMap anytime the effect block panel is updated
        configMap[type][attr] = value;
    };

    compareDialValues = function(effect_type, param, value) {
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
                scale: musicScales.getScaleName(0),
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
                    min: 1,
                    max: 18,
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
        blockDragLeftX = config.grid_width,
        blockDragLeftY = config.grid_height,
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
        blockDragLeftX = config.block_size;
        blockDragLeftY = config.block_size;
        blockDragRightX = 0;
        blockDragRightY = 0;
    }();

    compareMouse = function(e) {
        if (utilities.gridify(mousedownX) === utilities.gridify(e.pageX - config.grid_offset_x) && utilities.gridify(mousedownY) === utilities.gridify(e.pageY - config.grid_offset_y) && config.is_blocks_dragged === false) {
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
        // If no blocks selected on drag leave active panel active
        if (el[0] !== undefined) {
            // If all blocks the same set active panel to block type
            controlPanel.setActivePanel(el[0]);
        }

    };
    getDragValues = function() {
        return dragBox;
    };
    // Get x and y pos of grid
    getPos = function() {
        config.grid_offset_x = $("#grid").offset().left;
        config.grid_offset_y = $("#grid").offset().top;
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

            if (gridArray[mousedowngridX][mousedowngridY] != -1 && blocks[gridArray[mousedowngridX][mousedowngridY]].selected === true && config.is_blocks_dragged === false && config.new_block === -1) {
                config.is_blocks_dragged = true;
                config.is_system_paused = true;

                blockDragRightX = 0;
                blockDragRightY = 0;
                //Set the bounds of the blocks being dragged
                for (var i = 0; i < config.block_count; i++) {
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
                for (var j = 0; j < config.block_count; j++) {
                    if (blocks[j].selected === true) {
                        blocks[j].dragOffsetX = blocks[j].gridX - blockDragLeftX;
                        blocks[j].dragOffsetY = blocks[j].gridY - blockDragLeftY;
                    }
                }
            }

            if (config.is_blocks_dragged === true) {
                //Check for new blockDrag positions being outside the grid
                var
                    gridpos = utilities.gridify(e.pageX - config.grid_offset_x) - blockDragOffsetX,
                    validMove = true;
                if (gridpos + blockDragWidth < config.grid_width && gridpos >= 0) {
                    blockDragLeftX = gridpos;
                }

                gridpos = utilities.gridify(e.pageY - config.grid_offset_y) - blockDragOffsetY;
                if (gridpos + blockDragHeight < config.grid_height && gridpos >= 0) {
                    blockDragLeftY = gridpos;
                }

                validMove = true;

                //Check all blocks if their new position conflicts with existing blocks
                for (var k = 0; k < config.block_count; k++) {
                    if (blocks[k].selected === true && gridArray[blockDragLeftX + blocks[k].dragOffsetX][blockDragLeftY + blocks[k].dragOffsetY] !== -1 && blocks[gridArray[blockDragLeftX + blocks[k].dragOffsetX][blockDragLeftY + blocks[k].dragOffsetY]].selected === false) {
                        validMove = false;
                    }
                }

                //Update block positions based on the drag block
                if (validMove === true) {
                    for (var l = 0; l < config.block_count; l++) {
                        if (blocks[l].selected === true) {
                            //Update gridArray to remove block from previous locations
                            gridArray[blocks[l].prevgridX][blocks[l].prevgridY] = -1;
                            gridArray[blocks[l].gridX][blocks[l].gridY] = -1;

                            //set the new position
                            blocks[l].gridX = blocks[l].prevGridX = blocks[l].dragOffsetX + blockDragLeftX;
                            blocks[l].gridY = blocks[l].prevGridY = blocks[l].dragOffsetY + blockDragLeftY;
                            blocks[l].posX = blocks[l].gridX * config.block_size;
                            blocks[l].posY = blocks[l].gridY * config.block_size;

                            //Update the new gridArray location
                            gridArray[blocks[l].gridX][blocks[l].gridY] = l;
                            blocks[l].direction = "none";
                        }
                    }
                }
            }

            if (config.is_blocks_dragged === false) {

                if (config.mode === "create") {
                    var
                        gridX = utilities.gridify(e.pageX - config.grid_offset_x),
                        gridY = utilities.gridify(e.pageY - config.grid_offset_y),
                        activePanel = controlPanel.getActivePanel();

                    // Add music block to the grid 
                    addBlock(gridX, gridY, activePanel);
                    if (config.is_shiftkey_enabled === 0) {
                        blocks[config.block_count - 1].selectNewSingle();
                    } else {
                        blocks[config.block_count - 1].selectBlock();
                    }


                } else {
                    var move_x = e.pageX - config.grid_offset_x,
                        move_y = e.pageY - config.grid_offset_y,
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
        /////////
        //Tutorial related BEGIN
        if (valid_input.type == "gridUp") {
            if (tutorial.checkValidInput(e)) {
                tutorial.advanceTutorial();
                $('.tutorial-overlay').show();
            } else {
                tutorial.setTutorialIndex(tutorial.getTutorialIndex() - 2);
                $('.tutorial-overlay').show();
                tutorial.advanceTutorial();
                return;
            }
        }
        //Tutorial related END
        /////////

        // Set to null to remove dragbox in draw loop
        dragBox = {};

        if (e.which === 3) {
            utilities.deselectAllBlocks();
        }


        if (gridCheck === true) {

            if (config.is_blocks_dragged === true) {
                config.is_blocks_dragged = false;
                config.is_system_paused = false;
                blockDragLeftX = config.grid_width;
                blockDragLeftY = config.grid_height;
                blockDragWidth = 0;
                blockDragHeight = 0;
            } else {
                var
                    leftX = Math.min(mousedownX, e.pageX - config.grid_offset_x),
                    rightX = Math.max(mousedownX, e.pageX - config.grid_offset_x),
                    topY = Math.min(mousedownY, e.pageY - config.grid_offset_y),
                    bottomY = Math.max(mousedownY, e.pageY - config.grid_offset_y),
                    blockref;


                leftX = utilities.gridify(leftX);
                rightX = Math.ceil(rightX / config.block_size);
                topY = utilities.gridify(topY);
                bottomY = Math.ceil(bottomY / config.block_size);
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
                            if (config.is_shiftkey_enabled === 0) {
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
                            if (config.selected_block_count > 1 && config.is_shiftkey_enabled === 0) {
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
                        for (var i = 0; i < config.block_count; i++) {
                            blocks[i].deselectBlock();
                        }
                    }
                    if (config.new_block != -1) {
                        if (config.is_shiftkey_enabled === 0) {
                            blocks[config.new_block].selectNewSingle();
                        } else {
                            blocks[config.new_block].selectBlock();
                        }

                    }

                }

                //Mouse button was dragged to other squares
                else {
                    //Handle select mode
                    if (config.mode === "select" || config.mode === "trash") {
                        //Check for shift key off
                        if (config.is_shiftkey_enabled === 0) {
                            //If shift is off, deselect all blocks currently selected
                            for (var q = 0; q < config.block_count; q++) {
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

                        for (var p = 0; p < config.block_count; p++) {
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

            config.new_block = -1;
            mousedownX = -1;
            mousedownY = -1;

            gridCheck = false;
            //Remove drag event on mouseup
            elements.section.removeEventListener("mousemove", mouseDrag);
        }
    };


    //Add mousedown listener, tracks positions and resets selection to 0
    mouseDown = function(e) {
        if (e.button !== 2) {
            getPos();

            var
                dragbox,
                activePanel = controlPanel.getActivePanel();

            mouselocation = compareMouse(e);
            e = e || window.event;

            gridCheck = true;

            mousedownX = Math.min(e.pageX - config.grid_offset_x, config.block_size * config.grid_width);
            mousedownY = Math.min(e.pageY - config.grid_offset_y, config.block_size * config.grid_height);

            if (config.mode === "create") {
                addBlock(utilities.gridify(mousedownX), utilities.gridify(mousedownY), activePanel);
                if (config.new_block != -1) {
                    if (config.is_shiftkey_enabled === 0) {
                        blocks[config.block_count - 1].selectNewSingle();
                    } else {
                        blocks[config.block_count - 1].selectBlock();
                    }
                }
            }

            //Add drag event on mousedown
            elements.section.addEventListener('mousemove', mouseDrag, false);
        }
    };

    addBlock = function(gridX, gridY, type) {
        if (gridArray[gridX][gridY] === -1) {
            // Make new blocks based on type selected in control panel
            if (type == "block-music") {
                blocks[config.block_count] = makeMusicBlock(config.block_size, config.block_size, gridX * config.block_size, gridY * config.block_size, 0, type);
                blocks[config.block_count].setInitValues(musicBlockPanel.getPanelValues());

            } else {
                blocks[config.block_count] = makeEffectBlock(config.block_size, config.block_size, gridX * config.block_size, gridY * config.block_size, 0, type);
                blocks[config.block_count].setInitValues(effectBlockPanel.getPanelValues());
                blocks[config.block_count].rebuildRangeValidNotes();
            }

            blocks[config.block_count].setGrid();
            blocks[config.block_count].addBlock(config.block_count);
            gridArray[gridX][gridY] = config.block_count;
            config.new_block = config.block_count;
            config.block_count++;
        }
    };

    window.addEventListener("mouseup", mouseUp, false);
    elements.section.addEventListener("mousedown", mouseDown, false);

    return {
        getDragValues: getDragValues,
        getPos: getPos,
        mouseDown: mouseDown,
        mouseUp: mouseUp
    };


}();

keyboardEvents = function() {
    // var stopArrow = document.getElementById("stop");

    //Keydown handler for keyboard input
    window.addEventListener('keydown', function(event) {
        //Prevent space and the arrow keys from scrolling the screen if the app is not fullscreen
        if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }

        //console.log("CHECKING VALID FROM KEYBOARD FUNCTION");
        if (tutorial.getTutorialIndex() == -1 || event.keyCode == 84 || event.keyCode == 16) {
            switch (event.keyCode) {
                case 16: // Shift
                    config.is_shiftkey_enabled = 1;
                    break;

                case 32: // Space
                    if (config.is_blocks_dragged === false) {
                        config.is_paused = config.is_paused * -1;
                        if (config.is_paused === -1) {
                            $("[data-mode='play']").addClass('active').siblings().removeClass('active');
                        } else {
                            $("[data-mode='pause']").addClass('active').siblings().removeClass('active');
                        }
                    }
                    break;

                case 37: // Left
                    utilities.sendBlocks('left');
                    // utilities.setParams('static_direction', 'left');
                    break;

                case 38: // Up
                    utilities.sendBlocks('up');
                    break;

                case 39: // Right
                    utilities.sendBlocks('right');
                    break;

                case 40: // Down
                    utilities.sendBlocks('down');
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
                    if (confirm(config.clear_message) === true) {
                        utilities.deleteAllBlocks();
                    }
                    break;

                case 65: // a
                    utilities.selectAllBlocks();
                    break;

                case 70: //f
                    config.advance *= -1;
                    break;

                    // case 68: // d
                    //     var out = "FULL GRID DUMPMONSTER";
                    //     for (var i = 0; i < config.grid_width; i++) {
                    //         out = out + "\n";
                    //         for (var j = 0; j < config.grid_height; j++) {
                    //             if ((gridArray[j][i] + "").length === 1)
                    //                 out = out + " ";
                    //             out = out + gridArray[j][i] + " ";
                    //         }
                    //     }
                    //     break;

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

                case 83: // s
                    $('.tutorial-overlay').show();
                    if (tutorial.getTutorialIndex() == -1) {
                        tutorial.setTutorialIndex(0);
                    }
                    tutorial.setTutorialIndex(38);
                    tutorial.advanceTutorial();
                    break;

                case 84: // t
                    $('.tutorial-overlay').show();
                    if (tutorial.getTutorialIndex() == -1) {
                        tutorial.setTutorialIndex(0);
                    }
                    tutorial.advanceTutorial();
                    break;

                case 107: // Numpad +
                    if (config.master_volume < 100) {
                        config.master_volume += 5;
                    }
                    break;

                case 109: // Numpad -
                    if (config.master_volume > 0) {
                        config.master_volume -= 5;
                    }
                    break;
            }
        }
    }, false);

    //Keyup handler for held key operations
    window.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case 16: //Shift
                config.is_shiftkey_enabled = 0;
                break;
        }
    }, false);

    // stopArrow.addEventListener("click", function() {
    //     animateBlock("none");
    // });

}();



startSyncCounter();