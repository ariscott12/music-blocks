var musicApp = (function() {

    "use strict";

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
            is_pause_toggled: false,
            advance: -1,
            is_shiftkey_enabled: 0,
            selected_block_count: 0,
            mode: 'create',
            block_count: 0,
            new_block: -1,
            instruments_to_load: 1,
            is_blocks_dragged: false,
            master_volume: 100,
            is_app_muted: -1,
            is_block_soloed: false,
            active_panel: 'block-music',
            is_dragbox_active: false,
            is_instrument_loading: false
        },

        validInput = {
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
    var blocks = [];
    var midiInstruments = {
        'xylophone': 13,
        'acoustic_grand_piano': 0,
        'acoustic_bass': 32,
        'gunshot': 127,
        'marimba': 12,
        'rock_organ': 18,
        'orchestral_harp': 46,
        'overdriven_guitar': 29,
        'harpsichord': 6,
        'harmonica': 22,
        'flute': 73,
        'synth_strings_1': 50,
        'trumpet': 56,
        'trombone': 57,
        'fretless_bass': 35,
        'alto_sax': 65,
    };


    // This is called from loadSoundFonts Module
    var initializeApp = function() {
        // $('#wrapper').click(function() {
        //     pianoRoll.updateSpecificKey();  
        // })

        // Show the app and hide the page loader
        $('#wrapper').fadeIn();
        $('.spinner-page').fadeOut();
        $('.left-button-wrapper').fadeIn();

        // Check what browser user is in, if user is not in Chrome display browser prompt
        if (browser() != 'Chrome') {
            $('[data-message="browser-prompt"]').show();
        }
        // Click function to hide browser prompt
        $('[data-id="close-message"]').click(function() {
            $('[data-message="browser-prompt"]').hide();
        });


        // Initialize the Modules order of initialization maters
        buildTheGrid.initMod();
        musicScales.initMod();
        spriteImages.initMod();
        topPanel.initMod();
        controlPanel.initModule();
        musicBlockPanel.initMod();
        effectBlockPanel.initMod();
        pianoRoll.initMod();
        gridEvents.initMod();
        musicBlockExample.initMod();
        syncCounter.initAppLoop();
    };



    /* Here we load the MIDI sound fonts and populate our MIDI Programs
     * Once the Sound Fonts have loaded we run the initialize App function
     */
    var loadSoundFonts = function() {
        var is_app_initialized = false;
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
                   
                    // After sound fonts have loaded we initalized the App
                    if(!is_app_initialized) {
                        setMidiPrograms();
                        initializeApp();
                        is_app_initialized = true;
                    }
                }
            });
        };
    }();


    // Builds the HTML grid and sets the canvas widht and height
    var buildTheGrid = function($) {
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
            $('.canvas-overlay').css({
                width: gridPixelWidth,
                height: gridPixelHeight
            });

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
    }(jQuery);


    var musicScales = function() {
        var
            scaleNames = [],
            scaleNumbers = [],

            // Private Methods
            populateScaleArray,

            // Public Methods
            populateScaleSelect, getScaleNumbers, getScaleName,
            initMod;

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
            populateScaleArray('Chromatic (None)', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
            populateScaleArray('C Major / A Minor', [0, 2, 4, 5, 7, 9, 11]);
            populateScaleArray('D Major / B Minor', [1, 2, 4, 6, 7, 9, 11]);
            populateScaleArray('E Major / C# Minor', [1, 3, 4, 6, 8, 9, 11]);
            populateScaleArray('F Major / D Minor', [0, 2, 4, 5, 7, 9, 10]);
            populateScaleArray('G Major / E Minor', [0, 2, 4, 6, 7, 9, 11]);
            populateScaleArray('A Major / F# Minor', [1, 2, 4, 6, 8, 9, 11]);
            populateScaleArray('B Major / G# Minor', [1, 3, 4, 6, 8, 10, 11]);
            populateScaleArray('Bb Major / G minor', [0, 2, 3, 5, 7, 9, 10]);
            populateScaleArray('Eb Major / C Minor', [0, 2, 3, 5, 7, 8, 10]);
            populateScaleArray('Ab Major / F Minor', [0, 1, 3, 5, 7, 8, 10]);
            populateScaleArray('Db Major / Bb Minor', [0, 1, 3, 5, 6, 8, 10]);
            populateScaleArray('Gb Major / Eb Minor', [1, 3, 5, 6, 8, 10, 11]);
            populateScaleArray('Cb Major / Ab Minor', [1, 3, 4, 6, 8, 10, 11]);
            populateScaleArray('F# Major / D# Minor', [1, 3, 5, 6, 8, 10, 11]);
            populateScaleArray('C# Major / A# Minor', [0, 1, 3, 5, 6, 8, 10]);

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
            getSpriteMap, makeSprite, initMod;

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

    // Helper functions that are used throughout the App
    var utilities = function() {
        var noteArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

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
                // if (tutorial.getTutorialIndex() !== -1 || confirm('Are you sure you want to delete the selected blocks?')) {
                for (var i = 0; i < config.block_count; i++) {
                    if (blocks[i].selected === true) {
                        blocks[i].removeBlock();
                        i--;
                    }
                }
                //}
            },
            deleteAllBlocks: function(message) {
                function removeBlock() {
                    for (var j = 0; j < config.block_count; j++) {
                        blocks[j].removeBlock();
                        j--;
                    }
                    config.selected_block_count = 0;
                }
                if(message === false) {
                    removeBlock();
                } else {
                    if (tutorial.getTutorialIndex() !== -1 || confirm('Are you sure you want to clear the board?')) {
                        removeBlock();
                    }
                }
              
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
        is_select_toggled: false,
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
        highlight_counter: 0,
        prevgridX: 0,
        prevgridy: 0,
        block_hex_colors: ['#d27743', '#debe4e', '#cf5a4c', '#9473f3', '#4077d5', '#37a354', '#3fc3d8'],
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
                this.is_select_toggled = true;
                config.selected_block_count++;
            }
        },
        deselectBlock: function() {
            // Only deselect block if it is already selected
            if (this.selected) {
                this.selected = false;
                this.is_select_toggled = true;
                config.selected_block_count--;
            }
        },
        removeBlock: function() {
            this.undraw();
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
            this.highlight_counter = 70;
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
        undraw: function() {
            context.clearRect(this.posX, this.posY, config.block_size, config.block_size);
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
            if (this.highlight_counter > 0) {
                this.highlight_counter -= 4;
            }
            if (!this.selected) {
                context.fillStyle = "rgb(" + (this.not_selected_color.red + (this.highlight_counter * 2)) + ", " + (this.not_selected_color.green + this.highlight_counter) + ", " + (this.not_selected_color.blue + (this.highlight_counter * 3)) + ")";
                context.fill();
            } else {
                context.fillStyle = "rgb(" + (this.selected_color.red + this.highlight_counter) + ", " + (this.selected_color.green + this.highlight_counter) + ", " + (this.selected_color.blue + this.highlight_counter) + ")";
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
            volume: null,
            velocity: null,
            duration: null

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
            block,

            // Private Methods
            animationLoop,

            // Public Methods
            initAppLoop;

        animationLoop = function() {
            var blocks_to_draw = new Array();
            if (config.is_blocks_dragged || config.is_dragbox_active || config.is_pause_toggled) {
                context.clearRect(0, 0, canvas.width, canvas.height);
            }

            for (var y = 0; y < config.block_count; y++) {
                if (config.is_pause_toggled || blocks[y].is_select_toggled || (blocks[y].new_direction !== 'none' //&& blocks[y].waiting == false
                        && (!config.is_system_paused && ((config.is_paused === 1 && config.advance === 1) || config.is_paused === -1))) || blocks[y].highlight_counter > 0 || blocks[y].size > 0 || config.is_blocks_dragged || config.is_dragbox_active) {
                    if (!config.is_blocks_dragged && !config.is_dragbox_active && !config.is_pause_toggled) {
                        blocks[y].undraw();
                    }
                    blocks[y].is_select_toggled = false;
                    blocks_to_draw.push(y);
                }
            }

            config.is_pause_toggled = false;

            /*context.clearRect(0, 0, canvas.width, canvas.height);
            for (var z = 0; z < config.block_count; z++) {
                block = blocks[z].render();
            }
            drag_map = gridEvents.getDragValues();
            context.fillStyle = 'rgba(225,225,225,0.5)';
            context.fill();
            context.fillRect(drag_map.xpos, drag_map.ypos, drag_map.width, drag_map.height);*/

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

            for (var z = 0; z < blocks_to_draw.length; z++) {
                block = blocks[blocks_to_draw[z]].render();
            }

            if (config.is_dragbox_active) {
                drag_map = gridEvents.getDragValues();
                context.fillStyle = 'rgba(225,225,225,0.5)';
                context.fill();
                context.fillRect(drag_map.xpos, drag_map.ypos, drag_map.width, drag_map.height);
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
            toggleTutorial,

            // Public Methods
            initMod;

        setJqueryMap = function() {
            jqueryMap = {
                $mode_select: $('.mode-select'),
                $play_select: $('.play-select'),
                $batch_edits: $('.batch-edits'),
                $hotkey_btn: $('[data-id = "hotkeys"]'),
                $tutorial_btn: $('[data-id = "tutorial"]'),
                $hotkey_menu: $('[data-id = "hotkey-menu"]'),
                $master_volume: $('.master-volume-slider'),
                $master_mute: $('[data-id = "toggle-master-mute"]'),
                $browser_message: $('.browser-message')
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
                    utilities.deselectAllBlocks();
                    break;
                case 'pause':
                    if (config.is_paused !== 1) {
                        config.is_pause_toggled = true;
                    }
                    config.is_paused = 1;
                    break;
                case 'play':
                    if (config.is_paused !== -1) {
                        config.is_pause_toggled = true;
                    }
                    config.is_paused = -1;
                    break;
                case 'select-all':
                    utilities.selectAllBlocks();
                    break;
                case 'clear-all':
                    utilities.deleteAllBlocks();
                    break;
                case 'delete-selected':
                    utilities.deleteSelectedBlocks();
                    break;
                default:
                    throw new Error('changeMode() this is an unrecognized mode');
            }
        };
        toggleTutorial = function() {
            var state = $(this).attr('data-state');
            if (state === 'not-active') {

                $('.tutorial-overlay').show();
                if (tutorial.getTutorialIndex() == -1) {
                    if (jqueryMap.$browser_message.is(":visible")) {
                        jqueryMap.$browser_message.hide();
                    }
                    tutorial.setTutorialIndex(0);
                    $(this).text('Quit Tutorial');
                }
                tutorial.advanceTutorial();
                $(this).attr('data-state', 'active');
            } else {
                $(this).text('Tutorial');
                $(this).attr('data-state', 'not-active');
                tutorial.endTutorial();
            }


            return false;
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
                    //   $jqueryMap.$wrapper.trigger('click');
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
            jqueryMap.$tutorial_btn.click(toggleTutorial);

            // Create master volume slider
            createVolumeSlider();
        };

        return {
            initMod: initMod
        };

    }();




    /* 
     * This is a base module used for the effect panel and music panel
     * has common functions/methods that are shared by the effect panel and music panel
     */
    var controlPanel = function($) {
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

            // Private Methods
            setJqueryMap, toggleSelectedPanel,

            // Public Methods
            createDial, setActivePanel,
            initModule;


        setJqueryMap = function() {
            jqueryMap = {
                $panel_select: $('.panel-type-select'),
                $block_music: $('#block-music'),
                $block_effect: $('#block-effect'),
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
                block_type = arg_map.type || 'music-block',
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

                        if (block_type === 'music-block') {
                            musicBlockPanel.setParams(property, value);
                        } else {
                            effectBlockPanel.setParams(effect_type, property, value);

                            if (property !== 'specific') {
                                effectBlockPanel.compareDialValues(effect_type, property, value);
                            }
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

        setActivePanel = function(selected_panel) {
            var active_panel;
            $('.' + selected_panel + '-panel').show().siblings('div').hide();

            config.active_panel = selected_panel;

            /* 
             * Checks what panel is currently selected
             * If selected panel matches currently selected panel don't run functions
             * Update the piano roll values and hide/show piano roll slider and drum indicator
             */
            if (selected_panel === 'block-music' && active_panel !== 'block-music') {
                jqueryMap.$block_music.addClass('active').siblings().removeClass('active');
                pianoRoll.toggleUI();
            }
            if (selected_panel === 'block-effect' && active_panel !== 'block-effect') {
                jqueryMap.$block_effect.addClass('active').siblings().removeClass('active');
                pianoRoll.toggleUI();
                jqueryMap.$drum_indicator.hide();
                musicBlockPanel.toggleDrumIndicator(selected_panel);
            }

            active_panel = config.active_panel;

        };

        toggleSelectedPanel = function() {
            var selected_panel = $(this).attr('id');
            setActivePanel(selected_panel);
        };

        initModule = function() {
            setJqueryMap();

            // Set event listeners, toggles between effect and music block panels
            jqueryMap.$panel_select.find('li').click(toggleSelectedPanel);
        };

        return {
            createDial: createDial,
            setActivePanel: setActivePanel,
            initModule: initModule
        };
    }(jQuery);








    var musicBlockPanel = function($) {
        var
            jqueryMap = {},

            // Set starting values for music block panel
            configMap = {
                note: 60,
                volume: 60,
                duration: 60,
                velocity: 60,
                instrument: 0,
                mute: false,
                solo: false
            },

            // Private Methods
            setJqueryMap, createPanelDials, populateInstrumentSelect,
            selectNewInstrument, setNewDirection, toggleMuteSolo,
            toggleDrumIndicator, updateBlockColors,

            // Public Methods
            getPanelValues, setToBlock, setParams, loadInstrument,
            initMod;

        setJqueryMap = function() {
            jqueryMap = {
                $note: $('.note-music'),
                $volume: $('.volume-music'),
                $duration: $('.duration-music'),
                $velocity: $('.velocity-music'),
                $direction: $('#select-direction'),
                $instrument: $('#set-instrument'),
                $mute: $('.mute-toggle'),
                $solo: $('.solo-toggle'),
                $mute_solo: $('.mute-solo'),
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

        setParams = function(property, value) {
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true && blocks[i].type === 'block-music') {

                    // Update the property values of the selected blocks
                    blocks[i].setMidiValues(property, value);

                    // When we update a block value we highlight the block for visual indiciation
                    blocks[i].highlightBlock();
                }
            }

            // update the local configMap anytime a value is updated on the music block panel
            configMap[property] = value;

            // Update piano roll if we are changing the note dial
            if (property === 'note') {
                pianoRoll.updateSpecificKey();
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

                // Highjack the gunshot channel with drums
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

        // configMap should is always be up to date with current panel values
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
                                pianoRoll.updateSpecificKey();
                            }
                            break;
                    }
                }
            }
        };

        /*** Click Handlers ***/
        toggleMuteSolo = function() {
            var is_data_active = $(this).attr('data-active'),
                property = $(this).attr('data-type');

            if (is_data_active === 'true') {
                $(this).attr('data-active', 'false');
                is_data_active = false;
            } else {
                $(this).attr('data-active', 'true');
                is_data_active = true;
                if (property === 'solo') {
                    config.is_block_soloed = true;
                }
            }
            setParams(property, is_data_active);

            if (property === 'solo') {

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

        loadInstrument = function(obj) {
            var
                option = obj,
                is_loaded = option.attr('class'),
                program = obj.val(),
                $spinner = $('.spinner-instrument');  

            if (is_loaded === 'not-loaded') {
                config.is_instrument_loading = true;
                var str = option.text().replace(/\(|\)/g, '').replace(/click to load/g, '...');
                config.is_system_paused = true;
                $spinner.show();
                option.text(str);

                MIDI.loadPlugin({
                    soundfontUrl: "./soundfont/",
                    instruments: [Object.keys(midiInstruments)[program]],
                    onsuccess: function() {
                        config.is_instrument_loading = false;
                        MIDI.programChange(program, midiInstruments[Object.keys(midiInstruments)[program]]);
                        option.attr('class', 'loaded');
                        str = option.text().replace(/\(|\)/g, '').replace(/\.\.\./g, '');
                        option.text(str);
                        config.is_system_paused = false;
                        $spinner.hide();
                    }
                });
            }
        };


        selectNewInstrument = function() {
            var obj = $(this).find('option:selected');
            var program = obj.val();
            $(this).blur();
            loadInstrument(obj)
            setParams('instrument', program);
            updateBlockColors();
            toggleDrumIndicator();

            return false;
        };

        initMod = function() {
            // Set jqueryMap
            setJqueryMap();

            // Populate the music instrument select list
            populateInstrumentSelect();

            // Create the panel dials
            createPanelDials();

            // Click Events
            jqueryMap.$instrument.change(selectNewInstrument);
            jqueryMap.$direction.find('li').click(setNewDirection);
            jqueryMap.$mute_solo.find('span').click(toggleMuteSolo);
        };

        return {
            setToBlock: setToBlock,
            setParams: setParams,
            getPanelValues: getPanelValues,
            toggleDrumIndicator: toggleDrumIndicator,
            loadInstrument:loadInstrument,
            initMod: initMod
        };
    }(jQuery);



    var effectBlockPanel = function() {
        var
            jqueryMap = {},
            effectArray = ['note', 'volume', 'velocity', 'duration'],
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
            getPanelValues, setParams, compareDialValues,
            setToBlock, initMod;


        setJqueryMap = function() {
            var
                e = effectArray,
                length = e.length;

            jqueryMap = {
                $limit_range: $('.limit-range'),
                $step_switch: $('.switch'),
                $select_scale: $('#select-note-scale'),
                $toggle_effect: $('.toggle-drop'),
                $activator: $('.activator')
            };


            // Dynamically add selectors to jqueryMap using effectArray 
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

        // Update the configMap to store effectPanel values
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
            }
        };


        setParams = function(effect_type, effect_property, value) {
            for (var i = 0; i < config.block_count; i++) {
                if (blocks[i].selected === true && blocks[i].type === 'block-effect') {

                    // Update property values on selected blocks
                    blocks[i].setMidiValues(effect_type, effect_property, value);

                    // Highlight selected block to show property change
                    blocks[i].highlightBlock();
                    if (effect_property === 'scale' || effect_property === 'range_high' || effect_property === 'range_low') {
                        blocks[i].rebuildRangeValidNotes();
                    }
                }
            }

            // Update configMap anytime the effect block panel is updated
            configMap[effect_type][effect_property] = value;

            // Update Piano Roll only when note dials are turned
            if (effect_type === 'note') {
                switch (effect_property) {
                    case 'range_low':
                    case 'range_high':
                    case 'specific':
                        pianoRoll.updatePianoRoll(effect_property);
                        break;
                    case 'method':
                        pianoRoll.toggleUI();
                        break;
                }
            }

        };

        // Compares High and low dial values and dynamically updates the corresponding dial so they are in sync
        compareDialValues = function(effect_type, property, value) {
            var
                val_low,
                val_high;

            // If range high dial is lower then range low dial then we update the value of the low dial
            if (property === 'range_high') {
                val_low = 0;
                property = property.replace('high', 'low');
                val_low = configMap[effect_type][property];

                if (value <= val_low) {
                    jqueryMap[effect_type + '_' + property].val(value - 1);
                    jqueryMap[effect_type + '_' + property].trigger('change');

                    // Update value for range_low dial 
                    setParams(effect_type, property, value - 1);
                }


            }
            // If range low dial is higher then range high dial then we update the value of the high dial
            else if (property === 'range_low') {
                val_high = 0;
                property = property.replace('low', 'high');
                val_high = configMap[effect_type][property];

                if (value >= val_high) {
                    jqueryMap[effect_type + "_" + property].val(value + 1);
                    jqueryMap[effect_type + "_" + property].trigger('change');

                    // Update value for range_high dial 
                    setParams(effect_type, property, value + 1);

                }
            }
        };

        // configMap should always be in sync with effect panel values
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

                    // Loop through and set open effect panel to first active panel
                    if (map[key].active === true && open_effect === false && $("#block-music").hasClass('active')) {
                        $('.effect-' + key).show().siblings('.effect-box').hide();
                        $('.effect-' + key).siblings('.header').find('.toggle-drop').removeClass('active');
                        $('.effect-' + key).prev().find('.toggle-drop').addClass('active');
                        open_effect = true;
                    }
                    for (var key2 in map[key]) {
                        if (configMap[key][key2] !== blocks[num].configMap[key][key2] && key2 !== 'range_valid_notes') {
                            configMap[key][key2] = blocks[num].configMap[key][key2];
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
                            } // end if else
                            if (key === 'note') {
                                if (key2 === 'scale') {
                                    jqueryMap.$select_scale.val(blocks[num].configMap[key][key2]);
                                }
                                if (configMap.note.method === 'specific') {
                                    pianoRoll.updatePianoRoll('specific');
                                } else {
                                    pianoRoll.updatePianoRoll('range_high');
                                    pianoRoll.updatePianoRoll('range_low');
                                }
                            } // end if
                        } // end if
                    } // end for
                } // end if
            } // end for
        };

        /*** Click Handlers ***/
        toggleEffectMethod = function() {
            var
                select = $(this).val(),
                effect_type = $(this).attr('data-type'),
                method = $(this).find(':selected').attr('data-method');

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
        };
        toggleScale = function() {
            setParams('note', 'scale', $(this).val());
            return false;
        };

        // Using toggle rather then slideToggle for performance increase
        effectPanelAccordion = function() {
            $(this).parent().next().toggle();
            $(this).toggleClass('active');
            $(this).parent().siblings('.header').find('.toggle-drop').removeClass('active');
            $(this).parent().next().siblings('.effect-box').hide();

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

            // Create change events
            jqueryMap.$select_scale.change(toggleScale);
            $("#select-note-effect, #select-volume-effect, #select-velocity-effect, #select-duration-effect").change(toggleEffectMethod);

            // Create click events
            jqueryMap.$toggle_effect.click(effectPanelAccordion);
            jqueryMap.$step_switch.click(switchEffectDirection);
            jqueryMap.$limit_range.click(toggleLimitRange);
            jqueryMap.$activator.click(toggleActiveEffects);

        };

        return {
            getPanelValues: getPanelValues,
            setToBlock: setToBlock,
            setParams: setParams,
            compareDialValues: compareDialValues,
            initMod: initMod
        };
    }();




    var pianoRoll = function() {

        var
            pianoWidth,
            jqueryMap = {},
            configMap,
            widthAdd,
            sliderAdd,
            posHigh,
            blackKeyWidth,
            whiteKeyWidth,
            posLow,
            startingOcatve,
            isPianoMuted = false,
            pianoSliderArray = [0, 10, 16, 23, 29, 39, 49, 55, 62, 68, 75, 81, 91],

            // Private Methods
            hideRangeUI, showRangeUI, getRangeUIValues,
            updateActiveKeys, getSliderAddition, updateRangeIndicatorPos,
            updateSliderPositionLow, updateSliderPositionHigh, setStartingOctave,
            processPianoRollClicks, mutePianoRoll, updateSliders,
            setJqueryMap, createPianoSliders, initMod,

            // Public Methods
            updateSpecificKey, updateRollHigh, updateRollLow,
            updateBoth, updateRangeIndicator, toggleUI,
            updatePianoRoll;

        setJqueryMap = function() {
            jqueryMap = {
                $piano_key: $('.piano-roll li'),
                $piano_roll: $('.piano-roll'),
                $black_key: $('.blackkey'),
                $white_key: $('.whitekey'),
                $range_indicator: $('.range-indicator'),
                $piano_slider_min: $('#piano-slider-min'),
                $piano_slider_max: $('#piano-slider-max'),
                $dial_range_high: $('.note-rangehigh-effect'),
                $dial_range_low: $('.note-rangelow-effect'),
                $dial_specific: $('.note-specific-effect'),
                $dial_note: $('.note-music'),
                $mute_piano: $('.mute-piano'),
            };
        };

        setStartingOctave = function(arg) {
            var octave = arg.octave || 2;
            if (typeof octave !== 'string' && typeof octave !== 'boolean') {
                startingOcatve = (arg.octave * 12) - 1;
            } else {
                throw new Error('setStartingOctave() octave value must be an integer');
            }
        };

        // Hides range indicator and pianoRoll sliders
        hideRangeUI = function() {
            jqueryMap.$piano_key.removeClass('active-high active-low');
            jqueryMap.$range_indicator.hide();
            jqueryMap.$piano_slider_max.hide();
            jqueryMap.$piano_slider_min.hide();
        };

        // Shows range indicator and pianoRoll sliders
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

        updateActiveKeys = function() {
            var
                index_high,
                index_low;

            configMap = effectBlockPanel.getPanelValues();
            index_high = (configMap.note.range_high - startingOcatve) - 1;
            index_low = (configMap.note.range_low - startingOcatve) - 1;

            jqueryMap.$piano_key.eq(index_high).addClass('active-high').siblings().removeClass('active-high');
            jqueryMap.$piano_key.eq(index_high).parent().siblings().find('li').removeClass('active-high');
            jqueryMap.$piano_key.eq(index_low).addClass('active-low').siblings().removeClass('active-low');
            jqueryMap.$piano_key.eq(index_low).parent().siblings().find('li').removeClass('active-low');
        };

        // Set global module variables for updating slider/range values
        getSliderAddition = function(property) {
            var index;

            configMap = effectBlockPanel.getPanelValues();
            index = (configMap.note[property] - startingOcatve) - 1;

            if (jqueryMap.$piano_key.eq(index).hasClass('blackkey')) {
                if (property === 'range_high') {
                    widthAdd = blackKeyWidth;
                }
                sliderAdd = 2;
            } else {
                if (property === 'range_high') {
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
            var index;

            if (config.active_panel === 'block-effect') {
                configMap = effectBlockPanel.getPanelValues();
                index = configMap.note.specific - startingOcatve;
            } else {
                configMap = musicBlockPanel.getPanelValues();
                index = configMap.note - startingOcatve;
            }
            jqueryMap.$piano_key.eq(index - 1).addClass('active').siblings().removeClass('active');
            jqueryMap.$piano_key.eq(index - 1).parent().siblings().find('li').removeClass('active');
        };

        // Used when switching between music block panel and effect block panel
        toggleUI = function() {
            configMap = effectBlockPanel.getPanelValues();

            if (config.active_panel === 'block-effect') {
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

        updateRangeIndicator = function(params) {
            updateActiveKeys();
            getSliderAddition(params);
            getRangeUIValues();
            updateRangeIndicatorPos();

        };

        updatePianoRoll = function(property) {
            switch (property) {
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

        mutePianoRoll = function() {
            var is_data_active = $(this).attr('data-active');

            if (is_data_active === 'true') {
                isPianoMuted = false;
                $(this).attr('data-active', 'false');
            } else {
                isPianoMuted = true;
                $(this).attr('data-active', 'true');
            }
            return false;
        };

        updateSliders = function(ui, params) {
            var
                notePixels = ui.value % 91,
                octave = Math.floor(ui.value / 91),
                i = 1,
                sliderMultiply = (startingOcatve + 1) + (octave * 12);

            while (i <= pianoSliderArray.length - 1 && notePixels > pianoSliderArray[i]) {
                i++;
            }

            i--;
            if (params === 'range_low') {
                if (ui.value > jqueryMap.$piano_slider_max.slider("value")) {
                    jqueryMap.$piano_slider_max.slider("value", ui.value);
                    jqueryMap.$dial_range_high.val(i + sliderMultiply);
                    jqueryMap.$dial_range_high.trigger('change');
                    effectBlockPanel.setParams('note', 'range_high', i + sliderMultiply);
                }
            } else {
                if (ui.value < jqueryMap.$piano_slider_min.slider("value")) {
                    jqueryMap.$piano_slider_min.slider("value", ui.value);
                    jqueryMap.$dial_range_low.val(i + sliderMultiply);
                    jqueryMap.$dial_range_low.trigger('change');
                    effectBlockPanel.setParams('note', 'range_low', i + sliderMultiply);
                }
            }

            effectBlockPanel.setParams('note', params, i + sliderMultiply);
            jqueryMap['$dial_' + params].val(i + sliderMultiply);
            jqueryMap['$dial_' + params].trigger('change');
        };

        createPianoSliders = function() {
            var
                value = 300,
                min = 0,
                max = 637,
                step = 1;

            jqueryMap.$piano_slider_min.slider({
                orientation: "horizontal",
                value: value,
                min: min,
                max: max,
                step: step,
                slide: function(event, ui) {
                    updateSliders(ui, 'range_low');

                }
            });

            jqueryMap.$piano_slider_max.slider({
                orientation: "horizontal",
                value: value,
                min: min,
                max: max,
                step: step,
                slide: function(event, ui) {
                    updateSliders(ui, 'range_high');
                }
            });

            // Hide sliders on load
            jqueryMap.$piano_slider_max.hide();
            jqueryMap.$piano_slider_min.hide();
        };


        processPianoRollClicks = function() {
            var
                keyValue,
                activeHigh,
                activeLow,
                configMap;

            var getKeyValue = function(obj) {
                var
                    index = obj.index(),
                    roll_index = (obj.parent().index()) * 12,
                    value = (index + roll_index) + (startingOcatve + 1);

                return value;
            };

            keyValue = getKeyValue($(this));

            if (config.active_panel === 'block-effect') {
                configMap = effectBlockPanel.getPanelValues();
                if (configMap.note.method === 'specific') {
                    effectBlockPanel.setParams('note', 'specific', keyValue);
                    jqueryMap.$dial_specific.val(keyValue);
                    jqueryMap.$dial_specific.trigger('change');
                } else {
                    //  Used to determine if selected piano key is closer to active high or active low
                    activeHigh = getKeyValue($('.active-high'));
                    activeLow = getKeyValue($('.active-low'));

                    activeHigh = Math.abs(keyValue - activeHigh);
                    activeLow = Math.abs(keyValue - activeLow);

                    if (activeHigh < activeLow) {
                        jqueryMap.$dial_range_high.val(keyValue);
                        jqueryMap.$dial_range_high.trigger('change');
                        effectBlockPanel.setParams('note', 'range_high', keyValue);
                    } else {
                        jqueryMap.$dial_range_low.val(keyValue);
                        jqueryMap.$dial_range_low.trigger('change');
                        effectBlockPanel.setParams('note', 'range_low', keyValue);
                    }

                    for (var i = 0; i < blocks.length; i++) {
                        if (blocks[i].selected === true && blocks[i].type === 'block-effect') {
                            blocks[i].rebuildRangeValidNotes();
                        }
                    }
                }
            } else {
                musicBlockPanel.setParams('note', keyValue);
                jqueryMap.$dial_note.val(keyValue);
                jqueryMap.$dial_note.trigger('change');
            }

            // Trigger Midi
            if (isPianoMuted === false && config.is_instrument_loading === false) {
                configMap = musicBlockPanel.getPanelValues();
                utilities.triggerMidi(70, configMap.instrument, keyValue, 70, 0.3);
            }

            return false;
        };

        initMod = function() {
            setJqueryMap();

            setStartingOctave({
                octave: 2
            });
            createPianoSliders();

            // Get static values of piano roll
            pianoWidth = jqueryMap.$piano_roll.width();
            blackKeyWidth = jqueryMap.$black_key.outerWidth();
            whiteKeyWidth = jqueryMap.$white_key.outerWidth();

            // Update high and low slider and indicator positions
            updateRollLow();
            updateRollHigh();

            // Set click events
            jqueryMap.$piano_key.click(processPianoRollClicks);
            jqueryMap.$mute_piano.find('span').click(mutePianoRoll);


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




    var gridEvents = function() {
        var
            mousedownX = -1,
            mousedownY = -1,
            blockDragLeftX = config.grid_width,
            blockDragLeftY = config.grid_height,
            blockDragWidth = 0,
            blockDragHeight = 0,
            blockDragRightX,
            blockDragRightY,
            blockDragOffsetX = 0,
            blockDragOffsetY = 0,
            gridCheck = false,
            createDragBox = false,
            jqueryMap = {},

            dragBox = {
                width: null,
                height: null,
                xpos: null,
                ypos: null
            },
            elements = {
                section: document.getElementById('grid')
            },

            // Private methods
            resetBlockDrag, mouselocation, setStyles,
            compareMouse, compareTypes, mouseDrag,
            mouseUp, mouseDown, addBlock, getGridPosition,
            setJqueryMap,

            // Public methods
            getDragValues, initMod;

        setJqueryMap = function() {
            jqueryMap = {
                $grid: $('#grid')
            };
        };
        resetBlockDrag = function() {
            blockDragLeftX = config.block_size;
            blockDragLeftY = config.block_size;
            blockDragRightX = 0;
            blockDragRightY = 0;
        };

        // Compares mousedown position to mouseup position
        compareMouse = function(e) {
            if (utilities.gridify(mousedownX) === utilities.gridify(e.pageX - config.grid_offset_x) && utilities.gridify(mousedownY) === utilities.gridify(e.pageY - config.grid_offset_y) && config.is_blocks_dragged === false) {
                return 'same';
            } else {
                return 'different';
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
        getGridPosition = function() {
            config.grid_offset_x = jqueryMap.$grid.offset().left;
            config.grid_offset_y = jqueryMap.$grid.offset().top;
        };


        mouseDrag = function(e) {
            var
                mouse_down_grid_x,
                mouse_down_grid_y,
                blockDragRightX,
                blockDragRightY,
                grid_pos,
                valid_move,
                grid_x,
                grid_y,
                move_x,
                move_y,
                width,
                height,
                new_x,
                new_y;

            e = e || window.event;
            mouselocation = compareMouse(e);
            if (mouselocation === 'different') {

                mouse_down_grid_x = utilities.gridify(mousedownX);
                mouse_down_grid_y = utilities.gridify(mousedownY);

                //If we have just started dragging blocks, we need to identify a rectangle that encapsulates all the blocks and use it to move them.
                if (gridArray[mouse_down_grid_x][mouse_down_grid_y] != -1 && blocks[gridArray[mouse_down_grid_x][mouse_down_grid_y]].selected === true && config.is_blocks_dragged === false && config.new_block === -1) {
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
                    grid_pos = utilities.gridify(e.pageX - config.grid_offset_x) - blockDragOffsetX;
                    valid_move = true;

                    if (grid_pos + blockDragWidth < config.grid_width && grid_pos >= 0) {
                        blockDragLeftX = grid_pos;
                    }

                    grid_pos = utilities.gridify(e.pageY - config.grid_offset_y) - blockDragOffsetY;

                    if (grid_pos + blockDragHeight < config.grid_height && grid_pos >= 0) {
                        blockDragLeftY = grid_pos;
                    }

                    valid_move = true;

                    //Check all blocks if their new position conflicts with existing blocks
                    for (var k = 0; k < config.block_count; k++) {
                        if (blocks[k].selected === true && gridArray[blockDragLeftX + blocks[k].dragOffsetX][blockDragLeftY + blocks[k].dragOffsetY] !== -1 && blocks[gridArray[blockDragLeftX + blocks[k].dragOffsetX][blockDragLeftY + blocks[k].dragOffsetY]].selected === false) {
                            valid_move = false;
                        }
                    }

                    //Update block positions based on the drag block
                    if (valid_move === true) {
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
                                blocks[l].direction = 'none';
                            }
                        }
                    }
                }

                if (config.is_blocks_dragged === false) {

                    if (config.mode === 'create') {

                        grid_x = utilities.gridify(e.pageX - config.grid_offset_x);
                        grid_y = utilities.gridify(e.pageY - config.grid_offset_y);

                        // Add music block to the grid 
                        addBlock(grid_x, grid_y, config.active_panel);
                        if (config.is_shiftkey_enabled === 0) {
                            blocks[config.block_count - 1].selectNewSingle();
                        } else {
                            blocks[config.block_count - 1].selectBlock();
                        }

                    } else {
                        config.is_dragbox_active = true;
                        config.is_system_paused = true;
                        move_x = e.pageX - config.grid_offset_x;
                        move_y = e.pageY - config.grid_offset_y;
                        width = Math.abs(move_x - mousedownX);
                        height = Math.abs(move_y - mousedownY);
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
            //Remove drag event on mouseup
            elements.section.removeEventListener('mousemove', mouseDrag);
            /////////
            // Tutorial related BEGIN
            if (validInput.type == 'gridUp') {
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
            if (config.is_dragbox_active) {
                config.is_system_paused = false;
                config.is_dragbox_active = false;
                dragBox = {};
                config.is_pause_toggled = true;
            }

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
                    if (leftX < 0) {
                        leftX = 0;
                    }
                    rightX = Math.ceil(rightX / config.block_size);
                    topY = utilities.gridify(topY);
                    bottomY = Math.ceil(bottomY / config.block_size);
                    blockref = gridArray[leftX][topY];
                    e = e || window.event;

                    mouselocation = compareMouse(e);

                    //Check mouse click for single click
                    if (mouselocation === 'same') {
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
                            addBlock(leftX, topY, config.active_panel);

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
                        if (config.mode === 'select' || config.mode === 'trash') {
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
                            if (config.mode === 'trash') {
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
            }
        };


        //Add mousedown listener, tracks positions and resets selection to 0
        mouseDown = function(e) {
            if (e.button !== 2) {
                getGridPosition();

                e = e || window.event;

                gridCheck = true;

                mousedownX = Math.min(e.pageX - config.grid_offset_x, config.block_size * config.grid_width);
                mousedownY = Math.min(e.pageY - config.grid_offset_y, config.block_size * config.grid_height);

                if (config.mode === 'create') {
                    addBlock(utilities.gridify(mousedownX), utilities.gridify(mousedownY), config.active_panel);
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
                if (type == 'block-music') {
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

        initMod = function() {
            setJqueryMap();
            resetBlockDrag();
            window.addEventListener('mouseup', mouseUp, false);
            elements.section.addEventListener('mousedown', mouseDown, false);
        };

        return {
            getDragValues: getDragValues,
            mouseDown: mouseDown,
            mouseUp: mouseUp,
            initMod: initMod,
            addBlock:addBlock
        };
    }();

    var musicBlockExample = function() {

        var createMusicBlock = function(gridX, gridY, direction, instrument, note, muted, volume) {
            var count = config.block_count;
 
            gridEvents.addBlock(gridX,gridY,'block-music');
            blocks[count].new_direction = direction
            blocks[count].blockSpeed = config.block_speed;
            blocks[count].instrument = instrument;
            blocks[count].setBlockColors();
            blocks[count].note = note;
            blocks[count].mute = muted;
            blocks[count].volume = volume;
        }
        var createRandomEffectBlock = function(gridX, gridY, type, scale, rangeLow, rangeHigh) {
            var count = config.block_count;
            gridEvents.addBlock(gridX,gridY,'block-effect');
            blocks[count].configMap[type].method = 'random';
            blocks[count].configMap[type].range_high = rangeHigh;
            blocks[count].configMap[type].range_low = rangeLow;
            blocks[count].configMap[type].scale = scale;
            blocks[count].rebuildRangeValidNotes();

            if(type !== 'note') {
                blocks[count].configMap[type].active = true;
                blocks[count].configMap['note'].active = false;
            }
        }
         var createStepEffectBlock = function(gridX, gridY, type, scale, direction, step, rangeLow, rangeHigh) {
            var count = config.block_count;
            gridEvents.addBlock(gridX,gridY,'block-effect');
            blocks[count].configMap[type].method = 'progression';
            blocks[count].configMap[type].range_high = rangeHigh;
            blocks[count].configMap[type].range_low = rangeLow;
            blocks[count].configMap[type].scale = scale;
            blocks[count].configMap[type].direction = direction;
            blocks[count].configMap[type].step = step;
            blocks[count].rebuildRangeValidNotes();
        }
        var createLine = function() {
            var 
                arg = arguments[0],
                startX = arg.startX || 0,
                startY = arg.startY || 0,
                amount = arg.amount || 4,
                lineDirection = arg.lineDirection || 'horizontal',
                instrument = arg.instrument || 0,
                direction = arg.direction || 'none',
                note = arg.note || 60;

            for (var i = 0; i < amount; i++) {
                if(lineDirection === 'horizontal') {
                    createMusicBlock(startX+i,startY,direction,instrument, note, false, 60);
                } else {
                    createMusicBlock(startX,startY + i, direction,instrument, 62, false, 60);
                }
            };
        }

        var createRectangle = function() {
            var 
                arg = arguments[0],
                startX = arg.startX || 0,
                startY = arg.startY || 0,
                width = arg.width || 6,
                height = arg.height || 6;

                if(height < 3 || width < 3) {
                    throw new Error('createRectangle(): height and width must be greater then 2');

                }

                createLine({
                    startX: startX,
                    startY: startY,
                    amount: width,
                    lineDirection: 'horizontal'
                });
                createLine({
                    startX: startX,
                    startY: startY + height - 1,
                    amount: width,
                    lineDirection: 'horizontal'
                });
                createLine({
                    startX: startX,
                    startY: startY + 1,
                    amount: height - 2,
                    lineDirection: 'vertical'
                });
                 createLine({
                    startX: startX + width -1,
                    startY: startY + 1,
                    amount: height - 2,
                    lineDirection: 'vertical'
                });
            
        }

	var showExampleOne = function() {
            // Clear the board
            utilities.deleteAllBlocks(false);

            // Load instruments here before calling create music block functions
            musicBlockPanel.loadInstrument($('#set-instrument option[value="1"]'));
            musicBlockPanel.loadInstrument($('#set-instrument option[value="2"]'));
            musicBlockPanel.loadInstrument($('#set-instrument option[value="6"]'));
            musicBlockPanel.loadInstrument($('#set-instrument option[value="3"]'));

            createLine({
                startX: 0,
                startY: 0,
                amount: 5,
                lineDirection: 'horizontal'
            });

            createLine({
                startX: 0,
                startY: 8,
                amount: 5,
                lineDirection: 'horizontal'
            });

            createLine({
                startX: 0,
                startY: 13,
                amount: 5,
                lineDirection: 'horizontal'
            });

            createLine({
                startX: 5,
                startY: 0,
                amount: 14,
                lineDirection: 'vertical'
            });


            // Create music blocks
            // Base
            createMusicBlock(3,7,'none', 2, 39, false, 100);
            createMusicBlock(0,1,'up', 2, 39, false, 100);
            createMusicBlock(1,5,'down', 2, 48, false, 100);
            createMusicBlock(2,3,'down', 2, 51, false, 100);
            createMusicBlock(3,3,'down', 2, 55, false, 100);
            createMusicBlock(4,6,'down', 2, 43, false, 100);

            // Piano
            createRandomEffectBlock(6,4,'note', 'Eb Major / C Minor', 60, 89);
            createRandomEffectBlock(6,5,'note', 'Eb Major / C Minor', 60, 89);
            createMusicBlock(9,1,'none', 1, 60, false, 60);
            createMusicBlock(9,7,'none', 1, 60, false, 60);
            createMusicBlock(16,1,'none', 1, 60, false, 60);
            createMusicBlock(16,6,'none', 1, 60, false, 60);
            createMusicBlock(16,4,'up', 1, 60, true, 67);
            createMusicBlock(9,5,'down', 1, 60, true, 67);
            createRandomEffectBlock(19,4,'note', 'Eb Major / C Minor', 52, 89);
            createRandomEffectBlock(19,5,'note', 'Eb Major / C Minor', 52, 89);
            createMusicBlock(7,4,'left', 1, 60, false, 64);
            createMusicBlock(11,5,'left', 1, 60, false, 64);

            // Harp
            createStepEffectBlock(19,9,'note', 'Eb Major / C Minor', 'down', 1, 60, 100);
            createStepEffectBlock(15,9,'note', 'Eb Major / C Minor', 'down', 2, 60, 100);
            createMusicBlock(18,9,'right', 6, 60, false, 24);
            createMusicBlock(16,8,'none', 6, 60, false, 20);
            createMusicBlock(16,12,'none', 6, 60, false, 20);
            createMusicBlock(16,10,'down', 6, 60, true, 20);

            // Highhat
            createMusicBlock(1,11,'right', 3, 88, false, 18);
            createMusicBlock(2,11,'up', 3, 87, false, 17);

            // Snare
            createRandomEffectBlock(6,9,'volume', 'Eb Major / C Minor', 0, 30);
            createRandomEffectBlock(7,8,'volume', 'Eb Major / C Minor', 0, 30);           
            createMusicBlock(6,12,'down', 3, 67, false, 24);
            createMusicBlock(7,13,'down', 3, 60, false, 24);
           

            // Kick
            createMusicBlock(2,14,'right', 3, 50, false, 34);
            createMusicBlock(12,14,'none', 3, 74, false, 40);
            
        }

	var showExampleTwo = function() {
            // Clear the board
            utilities.deleteAllBlocks(false);
<<<<<<< HEAD
	       // Load instruments here before calling create music block functions
=======
	    // Load instruments here before calling create music block functions
>>>>>>> 4f0ba1993212fc75d71b518153ce513fba594f1a
            musicBlockPanel.loadInstrument($('#set-instrument option[value="0"]'));
            musicBlockPanel.loadInstrument($('#set-instrument option[value="4"]'));
            musicBlockPanel.loadInstrument($('#set-instrument option[value="3"]'));

            // Create effect blocks
            // Base
<<<<<<< HEAD
    	    createStepEffectBlock(10,5,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(10,6,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(10,7,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(6,5,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(5,6,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(4,7,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(14,5,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(15,6,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(16,7,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(8,2,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(8,10,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(12,2,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(12,10,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
    	    createStepEffectBlock(13,11,'note', 'A Major / F# Minor', 'up', 5, 60, 76);
    	    createStepEffectBlock(7,11,'note', 'A Major / F# Minor', 'up', 5, 60, 72);
=======
	    createStepEffectBlock(10,5,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(10,6,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(10,7,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(6,5,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(5,6,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(4,7,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(14,5,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(15,6,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(16,7,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(8,2,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(8,10,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(12,2,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(12,10,'note', 'A Major / F# Minor', 'up', 5, 50, 80);
	    createStepEffectBlock(13,11,'note', 'A Major / F# Minor', 'up', 5, 60, 76);
	    createStepEffectBlock(7,11,'note', 'A Major / F# Minor', 'up', 5, 60, 72);
>>>>>>> 4f0ba1993212fc75d71b518153ce513fba594f1a
            
            // Xylophone
            createMusicBlock(9,5,'left', 0, 60, false, 60);
            createMusicBlock(8,6,'left', 0, 60, false, 60);
            createMusicBlock(7,7,'left', 0, 60, false, 60);
            createMusicBlock(11,5,'left', 0, 60, false, 60);            
            createMusicBlock(12,6,'left', 0, 60, false, 60);
            createMusicBlock(13,7,'left', 0, 60, false, 60);

<<<<<<< HEAD
	       //Marimba
            createMusicBlock(8,3,'down', 4, 60, false, 60);
            createMusicBlock(12,4,'down', 4, 60, false, 60);
=======
	    //Marimba
            createMusicBlock(8,3,'down', 4, 60, false, 60);
            createMusicBlock(12,4,'down', 4, 60, false, 60);

            // Drums
            createMusicBlock(10, 11,'right', 3, 61, true, 24);
>>>>>>> 4f0ba1993212fc75d71b518153ce513fba594f1a

            // Drums
            createMusicBlock(10, 11,'right', 3, 61, true, 24);
            
        }

        var initMod = function() {
            //exampleOne();
            $('[data-id="example-1"]').click(showExampleOne);
            $('[data-id="example-2"]').click(showExampleTwo);
            
        }
        return {
            initMod: initMod
        }
    }();

    var keyboardEvents = function() {
        //Keydown handler for keyboard input
        window.addEventListener('keydown', function(event) {
            //Prevent space and the arrow keys from scrolling the screen if the app is not fullscreen
            if ([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
                event.preventDefault();
            }

            if (tutorial.getTutorialIndex() == -1 || event.keyCode == 84 || event.keyCode == 16 || tutorial.checkValidInput(event)) {
                switch (event.keyCode) {
                    case 16: // Shift
                        config.is_shiftkey_enabled = 1;
                        break;

                    case 32: // Space
                        if (config.is_blocks_dragged === false) {
                            config.is_paused = config.is_paused * -1;
                            config.is_pause_toggled = true;
                            if (config.is_paused === -1) {
                                $("[data-mode='play']").addClass('active').siblings().removeClass('active');
                            } else {
                                $("[data-mode='pause']").addClass('active').siblings().removeClass('active');
                            }
                        }
                        break;

                    case 37: // Left
                        utilities.sendBlocks('left');
                        break;

                    case 38: // Up
                        utilities.sendBlocks('up');
                        break;

                    case 39: // Right
                        utilities.sendBlocks('right');
                        if (tutorial.getTutorialIndex() !== -1) {
                            tutorial.advanceTutorial();
                        }
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
                        utilities.deleteAllBlocks();
                        break;

                    case 65: // a
                        utilities.selectAllBlocks();
                        break;

                    case 70: //f
                        config.advance *= -1;
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

    }();


    // musicApp public API for tutorial.js
    return {
        tutorialArray: tutorialArray,
        config: config,
        gridify: utilities.gridify,
        deleteAllBlocks: utilities.deleteAllBlocks,
        setMusicBlockParams: musicBlockPanel.setParams,
        setEffectBlockParams: effectBlockPanel.setParams,
        setToEffectBlock: effectBlockPanel.setToBlock,
        // This might not be needed
        updatePianoRoll: pianoRoll.updatePianoRoll,
        validInput: validInput,
        gridMouseDown: gridEvents.mouseDown,
        gridMouseUp: gridEvents.mouseUp,
        blocks: blocks,
        gridArray: gridArray

    };

}());