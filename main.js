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
        is_block_soloed: false
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
        initMod: initMod
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
            if (config.is_block_soloed === true) {
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
    block.blockSpeed = s;
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
    block.setInitValues = function(config_map) {
        var map = config_map;
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
    block.setInitValues = function(config_map) {
        var effectArray = ['note', 'volume', 'velocity', 'duration'],
            map = config_map;

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
        var valid_notes = musicScales.getScaleNumbers(this.configMap.note.scale),
            low_octave = Math.floor(this.configMap.note.range_low / 12),
            i = 0;

        // Create the random valid notes array based on scale and range_low and range_high
        this.configMap.note.range_valid_notes = [];

        // If range_low is greater than the largest value in valid_notes, then the value we want to start is one octave higher
        if (this.configMap.note.range_low > valid_notes[valid_notes.length - 1] + low_octave * 12) {
            low_octave++;
        } else {
            //Advance i until it is >= range_low
            while (this.configMap.note.range_low > valid_notes[i] + low_octave * 12) {
                i++;
            }
        }

        // Add values to the array until we exceed the range limit
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


// Helper functions that are used throughout the App
var utilities = function() {
    var noteArray = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    return {

        // Gridify translates an amount of pixels to an amount of blocks
        gridify: function(pixels) {
            var minX = 0;
            return Math.floor((pixels - minX) / config.block_size);
        },

        // Gives a random value between a min and max number
        getRandomNumber: function(min, max) {
            if (typeof min === 'number' && typeof max === 'number') {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            } else {
                throw new Error("getRandomNumber() min and max must be numbers");
            }
        },

        // Converts a note number to a note string value using noteArray
        noteToString: function(note) {
            return noteArray[note % 12] + Math.floor(note / 12);
        },

        // Converts a note string to a note number
        stringToNote: function(noteString) {
            var octave = noteString.charAt(noteString.length - 1);
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
        // Only runs on block music type
        sendBlocks: function(direction) {
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true && blocks[i].type === 'block-music') {
                    blocks[i].new_direction = direction;
                    blocks[i].blockSpeed = config.block_speed;
                }
            }
        },
        // Only runs on block music type
        stopBlocks: function() {
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true && blocks[i].type === 'block-music') {
                    blocks[i].new_direction = 'none';
                }
            }
        },
        triggerMidi: function(vol, pro, note, vel, dur) {
            MIDI.setVolume(0, vol);
            MIDI.noteOn(pro, note, vel, 0);
            MIDI.noteOff(pro, note, dur);
        },
        displayBLockInfo: function(blockref) {
            console.log('Block ' + blockref +
                ' GridX: ' + blocks[blockref].gridX +
                ' GridY: ' + blocks[blockref].gridY +
                ' prevGridX: ' + blocks[blockref].prevgridX +
                ' prevGridY: ' + blocks[blockref].prevgridY +
                ' Direction: ' + blocks[blockref].direction +
                ' is_Waiting: ' + blocks[blockref].is_waiting);
        }
    };
}();


/*  
 * This module performance various functions based on the collision type
 * Effect processing is done here and setting new block directions
 */
var processCollisions = function() {
    var
    // Public Methods
        processEffectType,
        processCollisionDirection,


        // Private Methods
        processSpecificEffect, processRandomEffect, processProgressionEffect, getOppositeDirection;


    processSpecificEffect = function(mblockref, eblockref, key) {
        // Set the mblock configMap key value to eblock specific
        blocks[mblockref][key] = blocks[eblockref].configMap[key].specific;
    };

    processRandomEffect = function(mblockref, eblockref, key) {
        var
            random_index,
            new_random_value;

        // If limit range flag is true, new key is a random key inside specified range
        if (blocks[eblockref].configMap[key].limit_range) {
            if (key === 'note') {
                random_index = utilities.getRandomNumber(0, blocks[eblockref].configMap[key].range_valid_notes.length - 1);
                new_random_value = blocks[eblockref].configMap[key].range_valid_notes[random_index];
            } else {
                new_random_value = utilities.getRandomNumber(blocks[eblockref].configMap[key].range_low, blocks[eblockref].configMap[key].range_high);
            }
        }

        // If limit range flag is false, new key is random key in MIDI acceptable range
        else {
            new_random_value = utilities.getRandomNumber(minMaxArray[key].min, minMaxArray[key].max);
        }

        // Set blocks configMap key value to the new random value
        blocks[mblockref][key] = new_random_value;
    };

    processProgressionEffect = function(mblockref, eblockref, key) {
        var
            step_direction,
            new_prog_value,
            prog_index;

        // Step step direction
        if (blocks[eblockref].configMap[key].direction === 'down') {
            step_direction = -1;
        } else {
            step_direction = 1;
        }

        // Default new_prog_value to the original value
        new_prog_value = blocks[mblockref][key];

        if (key === 'note') {
            if (blocks[eblockref].configMap[key].range_valid_notes.length > 0) {

                //Find the current note in the valid note array
                prog_index = blocks[eblockref].configMap[key].range_valid_notes.indexOf(blocks[mblockref].note);

                //Advance index. If incoming note not found, prog_index will start at 0
                if (prog_index === -1) {
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
                new_prog_value = blocks[eblockref].configMap[key].range_valid_notes[prog_index];
            }
        } else {
            // Add step value to block key
            if (step_direction === 1) {

                //If the result key is lower than the low limit, then set to the low limit.
                if (new_prog_value < blocks[eblockref].configMap[key].range_low) {
                    new_prog_value = blocks[eblockref].configMap[key].range_low;
                }
                //If the result key is higher than the high limit, then set to key - high limit.
                else if (new_prog_value > blocks[eblockref].configMap[key].range_high) {
                    new_prog_value = blocks[eblockref].configMap[key].range_high;
                }
                //If the result key is inside the range, then advance it.
                else {
                    new_prog_value += blocks[eblockref].configMap[key].step * step_direction;
                }
                //If we are out of the range, we add or subtract the size of the range to wrap around the range
                while (new_prog_value > blocks[eblockref].configMap[key].range_high || new_prog_value < blocks[eblockref].configMap[key].range_low) {
                    new_prog_value -= step_direction * (blocks[eblockref].configMap[key].range_high - blocks[eblockref].configMap[key].range_low + 1);
                }
            }
        }

        //Set the block configMap key value to new prog value
        if (new_prog_value !== null) {
            blocks[mblockref][key] = new_prog_value;
        }
    };

    processEffectType = function(mblockref, eblockref) {

        if (blocks[eblockref].type === 'block-effect') {
            //Effects loop
            for (var key in blocks[eblockref].configMap) {
                if (blocks[eblockref].configMap[key].active) {
                    switch (blocks[eblockref].configMap[key].method) {
                        case 'specific':
                            processSpecificEffect(mblockref, eblockref, key);
                            break;

                        case 'random':
                            processRandomEffect(mblockref, eblockref, key);
                            break;

                        case 'progression':
                            processProgressionEffect(mblockref, eblockref, key);
                            break;

                        default:
                            throw new Error('processEffectType() This is an undefined effect type');
                    }
                }
            }
        }

        if (config.selected_block_count === 1 && blocks[mblockref].selected === true && eblockref.type !== 'block-music') {
            musicBlockPanel.setToBlock(mblockref);
        }
    };

    // Takes a direction as an argument and returns the opposize direction
    getOppositeDirection = function(direction) {
        switch (direction) {
            case 'up':
                return 'down';
            case 'down':
                return 'up';
            case 'left':
                return 'right';
            case 'right':
                return 'left';
            default:
                return 'none';
        }
    };

    processCollisionDirection = function(direction, gridX, gridY, blockref, skipcheck) {
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

        /* Based on the direction passed to the function, determine which grid locations to check
         * 1st check the grid square directly in the path of the block
         * 2nd check the grid square clockwise to that square
         * 3rd check the grid square counter-clockwise to that square
         */
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
            return getOppositeDirection(direction);
        }

        //Check for collision with object directly in path
        else if (gridArray[directGridX][directGridY] !== -1) {
            processEffectType(blockref, gridArray[directGridX][directGridY]);
            blocks[blockref].num_collisions++;
            return getOppositeDirection(direction);
        }

        //Check for diagonal 1 collision
        else if (diag1GridX >= minGridX && diag1GridY >= minGridY && diag1GridX <= maxGridX && diag1GridY <= maxGridY && gridArray[diag1GridX][diag1GridY] !== -1 && blocks[gridArray[diag1GridX][diag1GridY]].is_waiting === false && (blocks[gridArray[diag1GridX][diag1GridY]].num_collisions <= blocks[blockref].num_collisions || skipcheck) && blocks[gridArray[diag1GridX][diag1GridY]].old_direction === diag1Direction) {
            processEffectType(blockref, gridArray[diag1GridX][diag1GridY]);
            blocks[blockref].num_collisions++;
            return getOppositeDirection(direction);
        }

        //Check for diagonal 2 collision
        else if (diag2GridX >= minGridX && diag2GridY >= minGridY && diag2GridX <= maxGridX && diag2GridY <= maxGridY && gridArray[diag2GridX][diag2GridY] !== -1 && blocks[gridArray[diag2GridX][diag2GridY]].is_waiting === false && (blocks[gridArray[diag2GridX][diag2GridY]].num_collisions <= blocks[blockref].num_collisions || skipcheck) && blocks[gridArray[diag2GridX][diag2GridY]].old_direction === diag2Direction) {
            processEffectType(blockref, gridArray[diag2GridX][diag2GridY]);
            blocks[blockref].num_collisions++;
            return getOppositeDirection(direction);
        } else
            return direction;
    };

    return {
        processCollisionDirection: processCollisionDirection,
        processEffectType: processEffectType
    };

}();

var syncCounter = function() {
    var
        dir,
        syncounter = -config.block_size,
        drag_map = {},

        // Private Methods
        animationLoop,

        // Public Methods
        initAppLoop;

    animationLoop = function() {
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
                        dir = processCollisions.processCollisionDirection(blocks[l].direction, blocks[l].gridX, blocks[l].gridY, l, true);
                        blocks[l].direction = blocks[l].new_direction = dir;
                    }

                    //Update old_direction for second collision
                    for (var k = 0; k < config.block_count; k++) {
                        blocks[k].old_direction = blocks[k].direction;
                    }

                    //second collision check
                    for (var o = 0; o < config.block_count; o++) {
                        dir = processCollisions.processCollisionDirection(blocks[o].direction, blocks[o].gridX, blocks[o].gridY, o, false);
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
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint > blocks[i].posY - blocks[i].blockSpeed) {
                                blocks[i].posY = 2 * blocks[i].halfpoint + config.block_speed - blocks[i].posY;
                                blocks[i].direction = blocks[i].new_direction = "down";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridY = blocks[i].gridY;
                                blocks[i].playmidi();

                            } else blocks[i].posY += -1 * blocks[i].blockSpeed;
                        }
                    } else if (blocks[i].direction == "down") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint < blocks[i].posY + blocks[i].blockSpeed) {
                                blocks[i].posY = 2 * blocks[i].halfpoint - config.block_speed - blocks[i].posY;
                                blocks[i].direction = blocks[i].new_direction = "up";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridY = blocks[i].gridY;
                                blocks[i].playmidi();

                            } else blocks[i].posY += 1 * blocks[i].blockSpeed;
                        }
                    }
                    if (blocks[i].direction == "left") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint > blocks[i].posX - blocks[i].blockSpeed) {
                                blocks[i].posX = 2 * blocks[i].halfpoint + config.block_speed - blocks[i].posX;
                                blocks[i].direction = blocks[i].new_direction = "right";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridX = blocks[i].gridX;
                                blocks[i].playmidi();

                            } else blocks[i].posX += -1 * blocks[i].blockSpeed;
                        }
                    } else if (blocks[i].direction == "right") {
                        if (blocks[i].queued === 0) {
                            if (blocks[i].halfpoint !== -1 && blocks[i].halfpoint < blocks[i].posX + blocks[i].blockSpeed) {
                                blocks[i].posX = 2 * blocks[i].halfpoint - config.block_speed - blocks[i].posX;
                                blocks[i].direction = blocks[i].new_direction = "left";
                                blocks[i].halfpoint = -1;
                                blocks[i].prevgridX = blocks[i].gridX;
                                blocks[i].playmidi();

                            } else blocks[i].posX += 1 * blocks[i].blockSpeed;
                        }
                    }
                }
            }

            // After moving, update all block positions
            for (var q = 0; q < config.block_count; q++) {
                // Calculate new grid positions, floor handles blocks moving left and up
                blocks[q].gridX = utilities.gridify(blocks[q].posX);
                blocks[q].gridY = utilities.gridify(blocks[q].posY);

                // If blocks are moving into a new block, move block reference 1 right or down if needed
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
        requestAnimationFrame(animationLoop);
    };

    initAppLoop = function() {
        animationLoop();
    };

    return {
        initAppLoop: initAppLoop
    };

}();


var topPanel = function() {
    var
        jqueryMap = {},

        // Private Methods
        changeMode, setJqueryMap, toggleMasterMute,
        showHotKeys, hideHotKeys, createVolumeSlider,

        // Public Methods
        initMod;

    setJqueryMap = function() {
        jqueryMap = {
            $mode_select: $('.mode-select'),
            $play_select: $('.play-select'),
            $batch_edits: $('.batch-edits'),
            $hotkey_btn: $('[data-id = "hotkeys"]'),
            $hotkey_menu: $('[data-id = "hotkey-menu"]'),
            $master_volume: $('.master-volume-slider'),
            $master_mute: $('[data-id = "toggle-master-mute"]'),
            $app_wrapper: $('#wrapper')
        };
    };

    changeMode = function() {
        var mode = $(this).attr('data-mode');

        // Batch edits do not stay active, add active class to all other data modes
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
                if (confirm(config.clear_message) === true) {
                    utilities.deleteAllBlocks();
                }
                break;
            default:
                throw new Error('changeMode() this is an unrecognized mode');
        }
    };
    toggleMasterMute = function() {
        config.is_app_muted = config.is_app_muted * -1;

        // Switch the volume icon to show if app is muted or not
        if (config.is_app_muted === -1) {
            $(this).attr('src', 'images/icon-volume.png');
        } else {
            $(this).attr('src', 'images/icon-volume-mute.png');
        }

        return false;
    };
    showHotKeys = function() {
        config.is_system_paused = true;
        jqueryMap.$hotkey_menu.fadeIn(300);

        return false;
    };
    hideHotKeys = function(event) {
        var target = $(event.target);
        if (!target.is("td")) {
            $(this).hide();
            $(this).fadeOut(300, function() {
                $jqueryMap.$wrapper.trigger('click');
            });
        }
        config.is_system_paused = false;

        return false;
    };
    createVolumeSlider = function() {
        jqueryMap.$master_volume.slider({
            orientation: 'horizontal',
            value: config.master_volume,
            min: 0,
            max: 100,
            step: 1,
            slide: function(event, ui) {
                config.master_volume = ui.value;
            }
        });
    };

    initMod = function() {
        setJqueryMap();

        // Create click handlers
        jqueryMap.$mode_select.find('li').click(changeMode);
        jqueryMap.$play_select.find('li').click(changeMode);
        jqueryMap.$batch_edits.find('li').click(changeMode);
        jqueryMap.$master_mute.click(toggleMasterMute);
        jqueryMap.$hotkey_btn.click(showHotKeys);
        jqueryMap.$hotkey_menu.click(hideHotKeys);

        // Create master volume slider
        createVolumeSlider();
    };

    return {
        initMod: initMod
    };

}();

topPanel.initMod();


/* 
 * This is a base module used for the effect panel and music panel
 * has common functions that are shared by the effect panel and music panel
 */
controlPanel = function() {
    var
        jqueryMap = {},
        dialParams = {
            fg_color: '#6f6e6d',
            bg_color: '#adacaa',
            width: '27',
            thickness: '.55',
            cursor: 11,
            height: '27 '
        },
        octaveStart,
        pianoRollMultiplier,
        activePanel,

        // Private Methods
        setMultipier, setJqueryMap,

        // Public Methods
        getActivePanel, createDial, getMultiplier,
        setActivePanel, initModule;


    setJqueryMap = function() {
        jqueryMap = {
            $panel_select: $('.panel-type-select'),
            $block_music: $('#block-music'),
            $block_effect: $('#block-effect'),
            $range_indicator: $('.range-indicator'),
            $piano_roll_slider: $('.piano-roll-slider'),
            $drum_indicator: $('.drum-type-wrapper')
        };
    };

    // This is factory function that creates a new jquery dial using the passed in parameters
    createDial = function() {

        var
            arg_map = arguments[0],
            obj = arg_map.obj,
            min = arg_map.min || 1,
            max = arg_map.max || 120,
            start_val = arg_map.start_val || 40,
            type = arg_map.type || 'music-block',
            property = arg_map.params || null,
            effect_type = arg_map.effect_type || null;


        // Create the dial
        obj.val(start_val)
            .knob({
                'min': min,
                'max': max,
                'fgColor': dialParams.fg_color,
                'bgColor': dialParams.bg_color,
                'width': dialParams.width,
                'thickness': dialParams.thickness,
                'cursor': dialParams.cursor,
                'height': dialParams.height,
                'change': function(v) {
                    var value = v;
                    if ((v % 1) >= 0.5) {
                        value = Math.ceil(v);
                    } else {
                        value = Math.floor(v);
                    }

                    if (type === 'music-block') {
                        musicBlockPanel.setParams(property, value);
                        // if (params === 'note') {
                        //     //musicBlockPanel.updatePianoRoll();
                        // }
                    } else {
                        effectBlockPanel.setParams(effect_type, property, value);

                        if (property !== 'specific') {
                            effectBlockPanel.compareDialValues(effect_type, property, value);
                        }
                        if (effect_type === 'note') {
                            // effectBlockPanel.updatePianoRoll({
                            //     params: property,
                            //     value: value
                            // });
                        }

                        //     //effectBlockPanel.updatePianoRoll();
                        // }
                    }
                },
                'format': function(value) {
                    if (property === 'note' || effect_type === 'note') {
                        return utilities.noteToString(value);
                    } else {
                        return value;
                    }
                }

            });
    };

    // pianoRollMultiplier is used in the piano roll for setting starting value of keyboard
    getMultiplier = function() {
        return pianoRollMultiplier;
    };
    setMultipier = function(arg) {
        var octave = arg.octave || 2;
        if (typeof octave !== 'string' && typeof octave !== 'boolean') {
            pianoRollMultiplier = (arg.octave * 12) - 1;
        } else {
            throw new Error('setMultipier() octave value must be an integer');
        }
    };
    getActivePanel = function() {
        return jqueryMap.$panel_select.find('li.active').attr('id');
    };
    setActivePanel = function(type) {
        var activePanel;
        $('div.' + type + '-panel').show().siblings('div').hide();
            
       
        /* 
         * Checks what panel is selected
         * Update the piano roll values and hide/show piano roll slider and drum indicator
         */
        if (type === 'block-music' && activePanel !== 'block-music') {
            jqueryMap.$block_music.addClass('active').siblings().removeClass('active');
            pianoRollMod.toggleUI();
          
        }
        if (type === 'block-effect' && activePanel !== 'block-effect') {
            jqueryMap.$block_effect.addClass('active').siblings().removeClass('active');
            pianoRollMod.toggleUI();
            jqueryMap.$drum_indicator.hide();
            musicBlockPanel.toggleDrumIndicator(type);
        }
        activePanel = type;

    };
    toggleSelectedPanel = function() {
        var type = $(this).attr('id');
        setActivePanel(type);
    };

    initModule = function() {
        setJqueryMap();
        setMultipier({
            octave: 2
        });


        // Set event listeners, toggles between effect and music block panels
        jqueryMap.$panel_select.find('li').click(toggleSelectedPanel);

        // Set the active panel
        activePanel = jqueryMap.$panel_select.find('.active').attr('id');
    };

    return {
        createDial: createDial,
        getActivePanel: getActivePanel,
        setActivePanel: setActivePanel,
        getMultiplier: getMultiplier,
        initModule: initModule
    };
}();

// Initialize Module
controlPanel.initModule();






musicBlockPanel = function() {
    var
        jqueryMap = {},
        configMap = {
            note: 60,
            volume: 60,
            duration: 60,
            velocity: 60,
            instrument: 0,
            mute: false,
            solo: false
        },
        multiplier = controlPanel.getMultiplier(),
        mutePiano = false,
        isloadingInstrument = false,

        // Private Methods
        setJqueryMap, createPanelDials, populateInstrumentSelect,
        selectNewInstrument, setNewDirection, toggleMuteSolo,
        toggleDrumIndicator, mutePianoRol, processPianoRollClicks,
        updateBlockColors, initMod,

        // Public Methods
        getPanelValues, updatePianoRoll, setToBlock,
        setParams;

    setJqueryMap = function() {
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
        };
    };

    createPanelDials = function() {
        // Note Dial      
        controlPanel.createDial({
            obj: jqueryMap.$note,
            start_val: configMap.note,
            type: 'music-block',
            params: 'note',
            min: 24,
            max: 107
        });

        // Volume Dial
        controlPanel.createDial({
            obj: jqueryMap.$volume,
            start_val: configMap.volume,
            type: 'music-block',
            params: 'volume',
            min: 1,
            max: 120
        });

        // Velocity Dial
        controlPanel.createDial({
            obj: jqueryMap.$velocity,
            start_val: configMap.velocity,
            type: 'music-block',
            params: 'velocity',
            min: 1,
            max: 120
        });

        // Duration Dial
        controlPanel.createDial({
            obj: jqueryMap.$duration,
            start_val: configMap.duration,
            type: 'music-block',
            params: 'duration',
            min: 1,
            max: 1000
        });
    };

    setParams = function(type, value) {
        for (var i = 0; i < config.block_count; i++) {
            if (blocks[i].selected === true && blocks[i].type === 'block-music') {

                // Update the MIDI values of the selected blocks
                blocks[i].setMidiValues(type, value);

                // When we update a block value we highlight the block for visual indiciation
                blocks[i].highlightBlock();
            }
        }

        // update the local configMap anytime a value is updated on the music block panel
        configMap[type] = value;

        if (type === 'note') {
            pianoRollMod.updateSpecificKey();
        }
    };


    // Populates the instrument select dropdown using the global midiInstrument object
    populateInstrumentSelect = function() {
        var
            length = Object.keys(midiInstruments).length,
            count = 0,
            css_class = 'loaded';

        // Loop through the object and create select list
        for (var key in midiInstruments) {
            key = key.replace(/_/g, ' ');
            if (key === 'gunshot') {
                key = 'drums';
            }
            if (count > config.instruments_to_load - 1) {
                key = key + ' (click to load)';
                css_class = 'not-loaded';
            }
            jqueryMap.$instrument.append('<option class = \"' + css_class + '\" value="' + count + '">' + key + '</option>');
            count++;
        }
    };

    // configMap should is always up to date with current panel values
    getPanelValues = function() {
        return configMap;
    };
    updateBlockColors = function() {
        for (var l = 0; l < config.block_count; l++) {
            if (blocks[l].selected === true) {
                blocks[l].setBlockColors();
            }
        }
    };

    /* 
     * Shows and hides drum kit type UI below piano roll
     * Takes optional argument for active control panel
     */
    toggleDrumIndicator = function(active_panel) {
        var option = jqueryMap.$instrument.find('option:selected');

        // if effect block panel is active always hide drum indicator
        if (active_panel === 'block-effect') {
            jqueryMap.$drumkit_type.hide();
        } else {
            // Check if selection is drums 
            if (option.text().indexOf('drums') >= 0) {
                jqueryMap.$drumkit_type.show();
            } else {
                jqueryMap.$drumkit_type.hide();
            }
        }
    };

    // Updates the pianoRoll based on the note configMap note attribute
    // updatePianoRoll = function() {
    //     var value = configMap.note - multiplier;

    //     jqueryMap.$piano_key.eq(value - 1).addClass('active').siblings().removeClass('active');
    //     jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');

    // };

    /* 
     * Updates music block panel UI to selected music block values
     * Only runs if 1 block selected
     * compares selected block values to configMap values, only updates when difference is found
     */
    setToBlock = function(num) {
        var map_key;

        for (var key in configMap) {
            map_key = configMap[key];
            configMap[key] = blocks[num][key];
            if (map_key != blocks[num][key]) {
                switch (key) {
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
                            pianoRollMod.updateSpecificKey();
                        }
                        break;
                }
            }
        }
    };


    /*** Click Handlers ***/

    processPianoRollClicks = function() {
        var
            active_panel = controlPanel.getActivePanel(),
            index = $(this).index(),
            roll_index = ($(this).parent().index()) * 12,
            piano_key_value = (index + roll_index) + (multiplier + 1);

        // Play MIDI note when piano roll is clicked unless it's muted or instrument is loading
        if (mutePiano !== true && isloadingInstrument === false) {
            utilities.triggerMidi(70, configMap.instrument, piano_key_value, 70, 0.3);
        }

        // If music block panel is not selected don't run this functionality
        if (active_panel === 'block-music') {
            $(this).addClass('active').siblings().removeClass('active');
            $(this).parent().siblings().find('li').removeClass('active');
            setParams('note', piano_key_value);

            // Update the note dial with the piano value
            jqueryMap.$note.val(piano_key_value);
            jqueryMap.$note.trigger('change');

        }
        return false;
    };
    toggleMuteSolo = function() {
        var is_data_active = $(this).attr('data-active'),
            type = $(this).attr('data-type');

        if (is_data_active === 'true') {
            $(this).attr('data-active', 'false');
            is_data_active = false;
        } else {
            $(this).attr('data-active', 'true');
            is_data_active = true;
            if (type === 'solo') {
                config.is_block_soloed = true;
            }
        }
        setParams(type, is_data_active);

        if (type === 'solo') {
            // set global is_block_soloed to false, loop through music blocks and set back to true if any of them are true
            config.is_block_soloed = is_data_active;
            for (var k = 0; k < config.block_count; k++) {
                if (blocks[k].solo === true) {
                    config.is_block_soloed = true;
                }
            }
        }

        return false;
    };
    setNewDirection = function() {
        var direction = $(this).attr('id');
        if (direction === 'none') {
            utilities.stopBlocks();
        } else {
            utilities.sendBlocks(direction);
        }

        return false;
    };
    mutePianoRoll = function() {
        var is_data_active = $(this).attr('data-active');

        if (is_data_active === 'true') {
            mutePiano = false;
            $(this).attr('data-active', 'false');
        } else {
            mutePiano = true;
            $(this).attr('data-active', 'true');
        }

        return false;
    };
    selectNewInstrument = function() {
        var
            option = $(this).find('option:selected'),
            is_loaded = option.attr('class'),
            program = $(this).val(),
            $spinner = $('.spinner-instrument');

        // remove focus after selected
        $(this).blur();

        if (is_loaded === 'not-loaded') {
            isloadingInstrument = true;
            var str = option.text().replace(/\(|\)/g, '').replace(/click to load/g, '...');
            config.is_system_paused = true;
            $spinner.show();
            option.text(str);

            MIDI.loadPlugin({
                soundfontUrl: "./soundfont/",
                instruments: [Object.keys(midiInstruments)[program]],
                onsuccess: function() {
                    isloadingInstrument = false;
                    MIDI.programChange(program, midiInstruments[Object.keys(midiInstruments)[program]]);
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
    };

    initMod = function() {
        // Set jqueryMap
        setJqueryMap();

        populateInstrumentSelect();
        createPanelDials();
        //updatePianoRoll();
       // pianoRollMod.updateSpecificKey();

        // Click Events
        jqueryMap.$instrument.change(selectNewInstrument);
        jqueryMap.$direction.find('li').click(setNewDirection);
        jqueryMap.$mute_solo.find('span').click(toggleMuteSolo);
        jqueryMap.$mute_piano.find('span').click(mutePianoRoll);
        jqueryMap.$piano_key.mousedown(processPianoRollClicks);

    };

    return {
        setToBlock: setToBlock,
        updatePianoRoll: updatePianoRoll,
        setParams: setParams,
        getPanelValues: getPanelValues,
        toggleDrumIndicator: toggleDrumIndicator,
        initMod: initMod
    };
}();

musicBlockPanel.initMod();


effectBlockPanel = function() {
    var
        jqueryMap = {},
        effectArray = ['note', 'volume', 'velocity', 'duration'],
        multiplier = controlPanel.getMultiplier(),
        configMap = {
            note: null,
            volume: null,
            velocity: null,
            duration: null
        },

        // Private Methods
        setJqueryMap, setConfigMap, buildUIComponents,
        effectPanelAccordion, toggleEffectMethod, toggleScale,
        switchEffectDirection, toggleLimitRange, toggleActiveEffects,

        // Public Methods
        getPanelValues, setParams, setPianoRoll, compareValues,
        updatePianoRoll, initMod;


    setJqueryMap = function() {
        var
            e = effectArray,
            length = e.length;

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
        };


        // Dynamically add selectors to jqueryMap using effectArray as 
        for (var i = 0; i < length; i++) {
            jqueryMap[e[i] + "_effect_select"] = $("#select-" + e[i] + "-effect");
            jqueryMap[e[i] + "_specific"] = $("#" + e[i] + "-specific-effect");
            jqueryMap[e[i] + "_range_low"] = $("." + e[i] + "-rangelow-effect");
            jqueryMap[e[i] + "_range_high"] = $(("." + e[i] + "-rangehigh-effect"));
            jqueryMap[e[i] + "_step"] = $(("." + e[i] + "-step-size"));
            jqueryMap[e[i] + "_direction"] = $(("." + e[i] + "-step-switch"));
            jqueryMap[e[i] + "_limit_range"] = $(("." + e[i] + "-limit-to-range"));
            jqueryMap[e[i] + "_active"] = $(("." + e[i] + "-activator"));

        }
    };

    // Dynamically update the configMap to store effectPanel values
    setConfigMap = function() {
        var
            e = effectArray,
            length = e.length;

        for (var i = 0; i < length; i++) {

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

            // Note effect is only active effect on load
            if (e[i] === 'note') {
                configMap.note.active = true;
                // toggleScale(jqueryMap.$select_scale);
            }
        }


    };

    // Build the UI components for the effect Panel (dials, jquery spinners)
    buildUIComponents = function() {
        var
            e = effectArray,
            length = e.length,
            rangeLimits = {};

        for (var i = 0; i < length; i++) {
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

            // Show effect method panel based on previous selection on load
            //toggleEffectMethod(jqueryMap[e[i] + "_effect_select"], true);
        }
    };


    setParams = function(effect_type, effect_property, value) {
        //console.log(value);
        for (var i = 0; i < config.block_count; i++) {
            if (blocks[i].selected === true && blocks[i].type === 'block-effect') {
                blocks[i].setMidiValues(effect_type, effect_property, value);
                blocks[i].highlightBlock();
                if (effect_property === 'scale' || effect_property === 'range_high' || effect_property === 'range_low') {
                    blocks[i].rebuildRangeValidNotes();
                }
            }
        }

        // Update configMap anytime the effect block panel is updated
        configMap[effect_type][effect_property] = value;

        // Update Piano Roll note dials are turned
        if (effect_type === 'note') {
            switch (effect_property) {
                case 'range_low':
                case 'range_high':
                case 'specific':
                    pianoRollMod.updatePianoRoll(effect_property);
                    break;
            }
        }

    };

    // Compares High and low dial values and dynamically updates the corresponding dial so they are in sync
    compareDialValues = function(effect_type, property, value) {

        // If range high dial is lower then range low dial then we update the value of the low dial
        if (property === 'range_high') {
            var val_low = 0;
            property = property.replace('high', 'low');
            val_low = configMap[effect_type][property];

            if (value <= val_low) {
                jqueryMap[effect_type + '_' + property].val(value - 1);
                jqueryMap[effect_type + '_' + property].trigger('change');

                // Update value for range_low dial 
                setParams(effect_type, property, value - 1);
                if (effect_type === 'note') {
                    // updatePianoRoll();
                }

            }
            // If range low dial is higher then range high dial then we update the value of the high dial
        } else if (property === 'range_low') {
            var val_high = 0;
            property = property.replace('low', 'high');
            val_high = configMap[effect_type][property];

            if (value >= val_high) {
                jqueryMap[effect_type + "_" + property].val(value + 1);
                jqueryMap[effect_type + "_" + property].trigger('change');

                // Update value for range_high dial 
                setParams(effect_type, property, value + 1);
                if (effect_type === 'note') {
                    //  updatePianoRoll();
                }
            }
        }
    };



    // updatePianoRoll = function() {
    //     var
    //         valueMap = {},
    //         attr = null,
    //         value = null,
    //         params = null,
    //         setActive,
    //         pos_high,
    //         pos_low,
    //         method = configMap.note.method;

    //         var hideRangeUI() {

    //         }

    //         setActive = function(attr) {
    //             var index_high, index_low,
    //                 width = $('.piano-roll').width(),
    //                 pos_high,
    //                 pos_low,
    //                 sliderAdd;

    //             if (attr === 'both') {
    //                 jqueryMap.$piano_key.removeClass('active');
    //                 jqueryMap.$range_indicator.show();
    //                 jqueryMap.$piano_slider_max.show();
    //                 jqueryMap.$piano_slider_min.show();
    //             }
    //             if (attr === 'high' || attr === 'both') {
    //                 jqueryMap.$piano_key.eq(valueMap.high - 1).addClass('active-high').siblings().removeClass('active-high');
    //                 jqueryMap.$piano_key.eq(valueMap.high - 1).parent().siblings().find('li').removeClass('active-high');
    //                 if (jqueryMap.$piano_key.eq(valueMap.high - 1).hasClass('blackkey')) {
    //                     width_add = black_key_width;
    //                     sliderAdd = 2;
    //                 } else {
    //                     width_add = white_key_width;
    //                     sliderAdd = 6;
    //                 }
    //                 jqueryMap.$piano_slider_max.slider({
    //                     value: pos_high + sliderAdd
    //                 });

    //             }
    //             if (attr === 'low' || attr === 'both') {
    //                 jqueryMap.$piano_key.eq(valueMap.low - 1).addClass('active-low').siblings().removeClass('active-low');
    //                 jqueryMap.$piano_key.eq(valueMap.low - 1).parent().siblings().find('li').removeClass('active-low');

    //                 jqueryMap.$piano_slider_min.slider({
    //                     value: pos_low + sliderAdd
    //                 });
    //                 if (jqueryMap.$piano_key.eq(valueMap.low - 1).hasClass('blackkey')) {
    //                     sliderAdd = 2;
    //                 } else {
    //                     sliderAdd = 6;
    //                 }
    //                 //   console.log(valueMap);
    //             }

    //             // Set high and low position of range-indicator
    //             index_high = jqueryMap.$piano_roll.find('.active-high').parent().index() * width;
    //             index_low = jqueryMap.$piano_roll.find('.active-low').parent().index() * width;
    //             pos_high = jqueryMap.$piano_roll.find('.active-high').position();
    //             pos_high = pos_high.left + index_high;
    //             pos_low = jqueryMap.$piano_roll.find('.active-low').position();
    //             pos_low = pos_low.left + index_low;

    //             // Update range indicator
    //             jqueryMap.$range_indicator.css({
    //                 'width': pos_high - pos_low + width_add,
    //                 'left': pos_low
    //             });

    //             // Update slider positions
    //             if (attr === 'low' || attr === 'both') {
    //                 jqueryMap.$piano_slider_min.slider({
    //                     value: pos_low + sliderAdd
    //                 });
    //             }
    //             if (attr === 'high' || attr === 'both') {
    //                 jqueryMap.$piano_slider_max.slider({
    //                     value: pos_high + sliderAdd
    //                 });
    //                 //console.log(pos_high + sliderAdd);
    //             }

    //         };

    //     if (arguments.length >= 1) {
    //         value = arguments[0].value - multiplier;
    //         params = arguments[0].params;
    //     }
    //  //   console.log(method);
    //     if (method === 'specific') {
    //         jqueryMap.$piano_key.removeClass('active-high active-low');
    //         jqueryMap.$range_indicator.hide();
    //         jqueryMap.$piano_slider_max.hide();
    //         jqueryMap.$piano_slider_min.hide();
    //         if (value === null) {
    //             value = configMap.note.specific - multiplier;
    //         }
    //         jqueryMap.$piano_key.eq(value - 1).addClass('active').siblings().removeClass('active');
    //         jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');
    //     } else {
    //         if (value === null) {
    //             valueMap['high'] = configMap.note.range_high - multiplier;
    //             valueMap['low'] = configMap.note.range_low - multiplier;
    //             setActive('both');
    //         } else {
    //             attr = params.split("_");
    //             console.log(attr);
    //             valueMap[attr[1]] = value;
    //             setActive(attr[1]);
    //         }
    //     }
    // };

    // updatePianoRoll = function() {
    //     var
    //         valueMap = {},
    //         attr = null,
    //         value = null,
    //         params = null,
    //         setActive,
    //         pos_high,
    //         pos_low,
    //         method = configMap.note.method;

    //     var hideRangeUI = function() {
    //         jqueryMap.$piano_key.removeClass('active-high active-low');
    //         jqueryMap.$range_indicator.hide();
    //         jqueryMap.$piano_slider_max.hide();
    //         jqueryMap.$piano_slider_min.hide();
    //     };

    //     var showRangeUI = function() {
    //         jqueryMap.$piano_key.removeClass('active');
    //         jqueryMap.$range_indicator.show();
    //         jqueryMap.$piano_slider_max.show();
    //         jqueryMap.$piano_slider_min.show();
    //     };

    //     var getRangeUIValues = function() {
    //         width = $('.piano-roll').width();
    //         active_high_index = jqueryMap.$piano_roll.find('.active-high').parent().index() * width;
    //         active_low_index = jqueryMap.$piano_roll.find('.active-low').parent().index() * width;

    //         pos_high = jqueryMap.$piano_roll.find('.active-high').position();
    //         pos_high = pos_high.left + active_high_index;

    //         pos_low = jqueryMap.$piano_roll.find('.active-low').position();
    //         pos_low = pos_low.left + active_low_index;

    //     };


    //     var updateActiveKeys = function(params) {
    //         jqueryMap.$piano_key.eq((configMap.note.range_high - multiplier) - 1).addClass('active-high').siblings().removeClass('active-high');
    //         jqueryMap.$piano_key.eq((configMap.note.range_high - multiplier) - 1).parent().siblings().find('li').removeClass('active-high');
    //         jqueryMap.$piano_key.eq((configMap.note.range_low - multiplier) - 1).addClass('active-low').siblings().removeClass('active-low');
    //         jqueryMap.$piano_key.eq((configMap.note.range_low - multiplier) - 1).parent().siblings().find('li').removeClass('active-low');

    //     };

    //     var getSliderAddition = function(param) {
    //         if (jqueryMap.$piano_key.eq((configMap.note[param] - multiplier) - 1).hasClass('blackkey')) {
    //             if (param === 'range_high') {
    //                 width_add = black_key_width;
    //             }
    //             sliderAdd = 2;
    //         } else {
    //             if (param === 'range_high') {
    //                 width_add = white_key_width;
    //             }
    //             sliderAdd = 6;
    //         }
    //     };
    //     var updateRangeIndicatorPos = function() {
    //         jqueryMap.$range_indicator.css({
    //             'width': pos_high - pos_low + width_add,
    //             'left': pos_low
    //         });

    //     };
    //     var updateSliderPositionLow = function() {
    //         jqueryMap.$piano_slider_min.slider({
    //             value: pos_low + sliderAdd
    //         });
    //     };
    //     var updateSliderPositionHigh = function() {
    //         jqueryMap.$piano_slider_max.slider({
    //             value: pos_high + sliderAdd
    //         });
    //     };
    //     var updateSpecificKey = function() {
    //         hideRangeUI();
    //         if (value === null) {
    //             value = configMap.note.specific - multiplier;
    //         }
    //         jqueryMap.$piano_key.eq(value - 1).addClass('active').siblings().removeClass('active');
    //         jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');
    //     };

    //     var updateRollHigh = function() {
    //         updateActiveKeys();
    //         getSliderAddition('range_high');
    //         getRangeUIValues();
    //         updateSliderPositionHigh();
    //         updateRangeIndicatorPos();
    //     };

    //     var updateRollLow = function() {
    //         updateActiveKeys();
    //         getSliderAddition('range_low');
    //         getRangeUIValues();
    //         updateSliderPositionLow();
    //         updateRangeIndicatorPos();
    //     };

    //     var updateBoth = function() {
    //         showRangeUI();
    //         updateActiveKeys();
    //         getSliderAddition('range_low');
    //         getSliderAddition('range_high');
    //         getRangeUIValues();
    //         updateSliderPositionLow();
    //         updateSliderPositionHigh();
    //         updateRangeIndicatorPos();
    //     };

    //     updateRangeIndicator = function(params) {
    //         updateActiveKeys();
    //         getSliderAddition(params);
    //         getRangeUIValues();
    //         updateRangeIndicatorPos();

    //     };



    //     if (arguments.length >= 1) {
    //         value = arguments[0].value - multiplier;
    //         params = arguments[0].params;
    //     }
    //     //   console.log(method);
    //     if (method === 'specific') {
    //         updateSpecificKey();
    //     } else {
    //         if (value === null) {
    //             updateBoth();
    //         } else {
    //             if (params === 'range_high') {
    //                 updateRollHigh();
    //             } else {
    //                 updateRollLow();
    //             }
    //             // attr = params.split("_");
    //             //console.log(attr);
    //             // valueMap[params] = value;
    //             // setActive(params);
    //         }
    //     }
    // };

    // configMap should always be in sync with effect panel
    getPanelValues = function() {
        return configMap;
    };

    /* 
     * Set effect control panel values from block configMap
     * compares local configMap with block configMap and only updates when difference found
     */
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

                        }
                        configMap[key][key2] = blocks[num].configMap[key][key2];
                        if (key === 'note') {
                            if (configMap.note.method === 'specific') {
                                pianoRollMod.updatePianoRoll('specific');
                            } else {
                                pianoRollMod.updatePianoRoll('range_high');
                                pianoRollMod.updatePianoRoll('range_low');
                            }
                        }
                    }
                }
            }
        }
    };


    pianoSliders = function() {
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
                    // updatePianoRoll({
                    //     value: i + sliderMultiply,
                    //     params: 'range_high'
                    // });
                    jqueryMap.note_range_high.val(i + sliderMultiply);
                    jqueryMap.note_range_high.trigger('change');
                    setParams('note', 'range_high', i + sliderMultiply);
                    //updateRangeIndicator('range_high');
                }
                // updatePianoRoll({
                //     value: i + sliderMultiply,
                //     params: 'range_low'
                // });


                setParams('note', 'range_low', i + sliderMultiply);
                //  updateRangeIndicator('range_low');

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
                    // updatePianoRoll({
                    //     value: i + octave * 12 + 24,
                    //     params: 'range_low'
                    // });
                    jqueryMap.note_range_low.val(i + sliderMultiply);
                    jqueryMap.note_range_low.trigger('change');
                    setParams('note', 'range_low', i + sliderMultiply);
                    // updateRangeIndicator('range_low');
                }

                // updatePianoRoll({
                //     value: i + sliderMultiply,
                //     params: 'range_high'
                // });
                setParams('note', 'range_high', i + sliderMultiply);
                // updateRangeIndicator('range_high');

                //Update knob value
                jqueryMap.note_range_high.val(i + sliderMultiply);
                jqueryMap.note_range_high.trigger('change');
            }
        });

        jqueryMap.$piano_slider_max.hide();
        jqueryMap.$piano_slider_min.hide();
    };


    /*** Click Handlers ***/

    toggleEffectMethod = function() {
        var
            select = $(this).val(),
            split = select.split('-'),
            effect_type = split[0],
            method = split[1];

        // Hide scale selection when note specific method selected
        if (effect_type === 'note') {
            if (method === 'specific') {
                jqueryMap.$select_scale.hide();

            } else {
                jqueryMap.$select_scale.show();
            }
        }

        // Hide and show select method    
        $('.' + select).show().siblings('div').hide();

        // Dynamically hides and shows Dials for a effect_type
        if (method === 'random' || method === 'progression') {
            $('.' + effect_type + '-range-wrapper').show();
        }

        setParams(effect_type, 'method', method);
        pianoRollMod.toggleUI();
        // if (method === 'specific') {
        //     pianoRollMod.hideRangeUI();
        //     pianoRollMod.updateSpecificKey();
        // } else {
        //     pianoRollMod.showRangeUI();
        //     pianoRollMod.updateActiveKeys();
        // }
    };
    toggleScale = function() {
        setParams('note', 'scale', $(this).val());
        return false;
    };
    effectPanelAccordion = function() {
        $(this).parent().next().slideToggle();
        $(this).toggleClass('active');
        $(this).parent().siblings('.header').find('.toggle-drop').removeClass('active');
        $(this).parent().next().siblings('.effect-box').slideUp();

        return false;
    };
    switchEffectDirection = function() {
        var
            selector = $(this),
            effect_type = $(this).attr('data-type'),
            direction = $(this).attr('data-direction');

        if (direction === 'down') {
            $(this).attr('data-direction', 'up');
            direction = 'up';

        } else {
            $(this).attr('data-direction', 'down');
            direction = 'down';
        }
        setParams(effect_type, 'direction', direction);
        return false;
    };
    toggleLimitRange = function() {
        var
            effect_type = $(this).attr('data-type'),
            limit = $(this).attr('data-limit-range');

        if (limit === 'true') {
            $(this).attr('data-limit-range', 'false');
            limit = false;
        } else {
            $(this).attr('data-limit-range', 'true');
            limit = true;
        }

        setParams(effect_type, 'limit_range', limit);
        return false;
    };
    toggleActiveEffects = function() {
        var
            active = $(this).attr('data-active'),
            effect_type = $(this).attr('data-type');
        if (active === 'true') {
            $(this).attr('data-active', 'false');
            active = false;
        } else {
            $(this).attr('data-active', 'true');
            active = true;
        }
        setParams(effect_type, 'active', active);
        return false;
    };

    initMod = function() {
        setJqueryMap();
        setConfigMap();
        buildUIComponents();
        pianoSliders();

        // Create event listeners 
        jqueryMap.$select_scale.change(toggleScale);
        $("#select-note-effect, #select-volume-effect, #select-velocity-effect, #select-duration-effect").change(toggleEffectMethod);

        jqueryMap.$toggle_effect.click(effectPanelAccordion);
        jqueryMap.$step_switch.click(switchEffectDirection);
        jqueryMap.$limit_range.click(toggleLimitRange);
        jqueryMap.$activator.click(toggleActiveEffects);

        black_key_width = jqueryMap.$black_key.outerWidth();
        white_key_width = jqueryMap.$white_key.outerWidth();

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
                        setParams('note', type + '_high', value);
                        // updatePianoRoll({
                        //     value: value,
                        //     params: type + '_high'
                        // });

                    } else {
                        jqueryMap['note_' + type + '_low'].val(value);
                        jqueryMap['note_' + type + '_low'].trigger('change');
                        setParams('note', type + '_low', value);
                        // updatePianoRoll({
                        //     value: value,
                        //     params: type + '_low'
                        // });

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
                        // $(this).addClass("active").siblings().removeClass('active');
                        // $(this).parent().siblings().find('li').removeClass('active');
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

    };

    return {
        getPanelValues: getPanelValues,
        setToBlock: setToBlock,
        setParams: setParams,
        updatePianoRoll: updatePianoRoll,
        compareDialValues: compareDialValues,
        initMod: initMod
    };
}();

effectBlockPanel.initMod();



var pianoRollMod = function() {

    var
        pianoWidth,
        jqueryMap = {},
        configMap = {},
        widthAdd,
        sliderAdd,
        posHigh,
        posLow,
        multiplier,
        // valueMap = {},
        // attr = null,
        // value = null,
        // params = null,
        // setActive,
        // pos_high,
        // pos_low,
        // method = configMap.note.method;

        // Private Methods
        hideRangeUI, showRangeUI, getRabgeUIValues,
        updateActiveKeys, getSliderAddition, updateRangeIndicatorPos,
        updateSliderPositionLow, updateSliderPositionHigh, setMultipier,

        // Public Methods
        updateSpecificKey, updateRollHigh, updateRollLow,
        updateBoth, updateRangeIndicator, toggleUI;

    setJqueryMap = function() {
        jqueryMap = {
            $piano_key: $('.piano-roll li'),
            $piano_roll: $('.piano-roll'),
            $black_key: $('.blackkey'),
            $white_key: $('.whitekey'),
            $range_indicator: $('.range-indicator'),
            $piano_slider_min: $("#piano-slider-min"),
            $piano_slider_max: $("#piano-slider-max")
        };
    };

    setMultipier = function(arg) {
        var octave = arg.octave || 2;
        if (typeof octave !== 'string' && typeof octave !== 'boolean') {
            multiplier = (arg.octave * 12) - 1;
        } else {
            throw new Error('setMultipier() octave value must be an integer');
        }
    };


    hideRangeUI = function() {
        jqueryMap.$piano_key.removeClass('active-high active-low');
        jqueryMap.$range_indicator.hide();
        jqueryMap.$piano_slider_max.hide();
        jqueryMap.$piano_slider_min.hide();
    };

    showRangeUI = function() {
        jqueryMap.$piano_key.removeClass('active');
        jqueryMap.$range_indicator.show();
        jqueryMap.$piano_slider_max.show();
        jqueryMap.$piano_slider_min.show();
    };

    getRangeUIValues = function() {
        var
            active_high_index,
            active_low_index;

        active_high_index = jqueryMap.$piano_roll.find('.active-high').parent().index() * pianoWidth;
        active_low_index = jqueryMap.$piano_roll.find('.active-low').parent().index() * pianoWidth;

        posHigh = jqueryMap.$piano_roll.find('.active-high').position();
        posHigh = posHigh.left + active_high_index;

        posLow = jqueryMap.$piano_roll.find('.active-low').position();
        posLow = posLow.left + active_low_index;

    };


    updateActiveKeys = function(params) {
        configMap = effectBlockPanel.getPanelValues();

        jqueryMap.$piano_key.eq((configMap.note.range_high - multiplier) - 1).addClass('active-high').siblings().removeClass('active-high');
        jqueryMap.$piano_key.eq((configMap.note.range_high - multiplier) - 1).parent().siblings().find('li').removeClass('active-high');
        jqueryMap.$piano_key.eq((configMap.note.range_low - multiplier) - 1).addClass('active-low').siblings().removeClass('active-low');
        jqueryMap.$piano_key.eq((configMap.note.range_low - multiplier) - 1).parent().siblings().find('li').removeClass('active-low');

    };

    getSliderAddition = function(param) {
        configMap = effectBlockPanel.getPanelValues();
        if (jqueryMap.$piano_key.eq((configMap.note[param] - multiplier) - 1).hasClass('blackkey')) {
            if (param === 'range_high') {
                widthAdd = blackKeyWidth;
            }
            sliderAdd = 2;
        } else {
            if (param === 'range_high') {
                widthAdd = whiteKeyWidth;
            }
            sliderAdd = 6;
        }
    };
    updateRangeIndicatorPos = function() {
        jqueryMap.$range_indicator.css({
            'width': posHigh - posLow + widthAdd,
            'left': posLow
        });

    };
    updateSliderPositionLow = function() {
        jqueryMap.$piano_slider_min.slider({
            value: posLow + sliderAdd
        });
    };
    updateSliderPositionHigh = function() {
        jqueryMap.$piano_slider_max.slider({
            value: posHigh + sliderAdd
        });
    };
    updateSpecificKey = function() {
        var active_panel = controlPanel.getActivePanel(),
            value;

        if (active_panel === 'block-effect') {
            //  hideRangeUI();
            configMap = effectBlockPanel.getPanelValues();
            value = configMap.note.specific - multiplier;
        } else {
            configMap = musicBlockPanel.getPanelValues();
            value = configMap.note - multiplier;
        }

       // console.log()

        //updateActiveKeys();
        jqueryMap.$piano_key.eq(value - 1).addClass('active').siblings().removeClass('active');
        jqueryMap.$piano_key.eq(value - 1).parent().siblings().find('li').removeClass('active');
    };
    toggleUI = function() {
        var active_panel = controlPanel.getActivePanel();
        configMap = effectBlockPanel.getPanelValues();
        if (active_panel === 'block-effect') {
            if (configMap.note.method === 'specific') {
                hideRangeUI();
                updateSpecificKey();
            } else {
                showRangeUI();
                updateActiveKeys();
            }
        } else {
            hideRangeUI();
            updateSpecificKey();
        }

    };

    // if(method === 'specific') {
    //        pianoRollMod.hideRangeUI();
    //        pianoRollMod.updateSpecificKey();
    //    } else {
    //        pianoRollMod.showRangeUI();
    //        pianoRollMod.updateActiveKeys();
    //    }

    updateRollHigh = function() {
        updateActiveKeys();
        getSliderAddition('range_high');
        getRangeUIValues();
        updateSliderPositionHigh();
        updateRangeIndicatorPos();
    };

    updateRollLow = function() {
        updateActiveKeys();
        getSliderAddition('range_low');
        getRangeUIValues();
        updateSliderPositionLow();
        updateRangeIndicatorPos();
    };

    // updateBoth = function() {
    //     showRangeUI();
    //     updateActiveKeys();
    //     getSliderAddition('range_low');
    //     getSliderAddition('range_high');
    //     getRangeUIValues();
    //     updateSliderPositionLow();
    //     updateSliderPositionHigh();
    //     updateRangeIndicatorPos();
    // };

    updateRangeIndicator = function(params) {
        updateActiveKeys();
        getSliderAddition(params);
        getRangeUIValues();
        updateRangeIndicatorPos();

    };

    updatePianoRoll = function(type) {
        switch (type) {
            case 'specific':
                updateSpecificKey();
                break;
            case 'range_high':
                updateRollHigh();
                break;
            case 'range_low':
                updateRollLow();
                break;
            case 'both':
                updateBoth();
                break;
        }
    };

    initMod = function() {
        setJqueryMap();
        setMultipier({
            octave: 2
        });
        pianoWidth = jqueryMap.$piano_roll.width();
        blackKeyWidth = jqueryMap.$black_key.outerWidth();
        whiteKeyWidth = jqueryMap.$white_key.outerWidth();
        updateRollLow();
        updateRollHigh();
    };

    return {
        initMod: initMod,
        updatePianoRoll: updatePianoRoll,
        showRangeUI: showRangeUI,
        hideRangeUI: hideRangeUI,
        toggleUI: toggleUI,
        updateSpecificKey: updateSpecificKey,
        updateActiveKeys: updateActiveKeys
    };
}();

pianoRollMod.initMod();











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


syncCounter.initAppLoop();