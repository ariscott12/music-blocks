
    // Sample syntaxes for each supported command type

// Set the next tutorial valid input to be clicking the select-icon
// addTutorialCommand("set_input", "element_clicked", "select-icon");

// Show the element
// addTutorialCommand("show", ".tutorial-text");

// Hide the element
// addTutorialCommand("hide", ".tutorial-text");

// Move the element to absolute position 50,60
// addTutorialCommand("move", ".tutorial-text", 50, 60);    

// Move the element to grid location 1, 1
// addTutorialCommand("move_to_grid", ".tutorial-text", 1, 1); 

// Change the text on the element to "Click select icon"
// addTutorialCommand("change_element_text", ".tutorial-text", "Click select icon"); 

// Clear all blocks
// addTutorialCommand("clear_all");   

// Resize the element to 80px by 40px
// addTutorialCommand("resize", ".tutorial-text", 80,40);

// Move the element near the other element with the given offset
// addTutorialCommand("move_near", ".tutorial-text", ".piano-roll", -30, -30);

// End the tutorial
// addTutorialCommand("end_tutorial");
tutorial = (function() {
    var tutorial_index = -1;
    var spacer = 5;

    function addTutorialCommand(comm, elem, l, t, w, h, near, text) {
        switch (comm) {
            case "resize":
                //resize uses l for width and t for height
                w = l;
                h = t;
                break;

            case "move_near":
                //move_near uses l to store the element to move near
                //t stores the x_offset
                //w stores the y_offset
                near = l;
                l = t;
                t = w;
                break;

            case "position_element":
                //move_near uses l to store the element to move near
                //t stores the x_offset
                //w stores the y_offset
                near = t;
                break;

            case "set_input":
                //for keyDown, the keycode is stored in l, and placed in w to be processed properly
                if (elem == "keyDown") {
                    w = l;
                }
                break;

            case "change_element_text":
                text = l;
                break;
        }

        var step = {
            command: comm,
            element: elem,
            left: l,
            top: t,
            width: w,
            height: h,
            near: near,
            text: text,
        };

        musicApp.tutorialArray[musicApp.tutorialArray.length - 1].push(step);
    }

    (function makeTutorial() {
        // Add commands using the function. 
        // Each function call adds a command to the last step in the array.

        // Hide the arrows
        $(".tutorial-arrow").hide();

        //Tutorial commands to initialize the tutorial
        addTutorialCommand("initialize_tutorial");
        addTutorialCommand("show", ".tutorial-text-wrapper");
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 7, 4);
        addTutorialCommand("change_element_text", ".tutorial-text", "Welcome to Music Blocks, a web-based visual music sequencer. This is an interactive tutorial that will teach you how to add and manage blocks on a grid that will (hopefully) produce music. Let's get started!");

        // To add a new tutorial step, push a new array onto tutorialArray.
        // Subsequent calls to addTutorialCommand add the command to this step.
        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "You can exit the tutorial at any time by clicking the Quit Tutorial on the left panel, but click Next to continue.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 5, 4);
        addTutorialCommand("change_element_text", ".tutorial-text", "First off, let's add a music block. Click the grid here.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("show", ".tutorial-text-wrapper");
        addTutorialCommand("change_element_text", ".tutorial-text", "Music blocks store note information and produce sound whenever they collide with something. Let's give this one something to bounce off of besides the wall.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 5, 5);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to create another music block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice how the new block is slightly darker... this indicates that this block is selected.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to select the first music block again.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_near_block", ".tutorial-text-wrapper", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice that clicking a single block deselects any other blocks.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "up");
        addTutorialCommand("change_element_text", ".tutorial-text", "OK, let's get this block moving! Click the up arrow on the panel.");
        addTutorialCommand("move_near", ".tutorial-text-wrapper", ".block-direction-select", -37, 30);
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#up");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "grid", 5, 5);
        addTutorialCommand("change_element_text", ".tutorial-text", "Great, notice that the unselected block isn't moving... changing an attribute in the panel or piano roll only effects selected blocks.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Also, notice that each time the block hits the wall, the C5 note plays. How musical!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 7, 5);
        addTutorialCommand("change_element_text", ".tutorial-text", "You can tell exactly which note the block will play by checking the display in the panel, or looking at the piano roll.");
        addTutorialCommand("move_near", "#tutorial-right-arrow-noaction", "#block-music", 50, 232);
        addTutorialCommand("move_near", "#tutorial-down-arrow-noaction", ".piano-wrapper", $("#D5").outerWidth() * 21.5 - $("#tutorial-down-arrow").width() / 2, 15 - ($("#tutorial-down-arrow").height()));

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "D5");
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's change the note... click the D5 on the piano roll.");
        addTutorialCommand("show", "#tutorial-down-arrow");
        addTutorialCommand("move_near", "#tutorial-down-arrow", ".piano-wrapper", $("#D5").outerWidth() * 22.5 - $("#tutorial-down-arrow").width() / 2, 15 - ($("#tutorial-down-arrow").height()));
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "above", "#tutorial-down-arrow");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now D5 plays on every collision.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's copy a block... click on the block that isn't moving.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "See how C5 is selected on the piano roll again? Clicking a block updates the panel with all the selected blocks information.");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 7, 5);
        addTutorialCommand("move_near", "#tutorial-right-arrow-noaction", "#block-music", 50, 232);
        addTutorialCommand("move_near", "#tutorial-down-arrow-noaction", ".piano-wrapper", $("#D5").outerWidth() * 21.5 - $("#tutorial-down-arrow").width() / 2, 15 - ($("#tutorial-down-arrow").height()));

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 4, 5);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to create another music block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "The new block is a copy of the previous block we selected. Sweet.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "left");
        addTutorialCommand("change_element_text", ".tutorial-text", "Click the left arrow to start this one moving left.");
        addTutorialCommand("move_near", ".tutorial-text-wrapper", ".block-direction-select", -37, 30);
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#left");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 5);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now we have two blocks moving and playing their notes. Next we'll select a block in motion.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "It can be tricky to select blocks while they are moving... so click on the pause button.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#pause-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#pause-icon");


        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 8, 3);
        addTutorialCommand("change_element_text", ".tutorial-text", "You may have noticed that you can see an arrow on selected blocks to show which way they are moving. Arrows appear on every block while paused.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Select the first block. It's the one that is moving vertically.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "mute-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "Click mute to mute the block.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#mute-toggle");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#solo-toggle");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "play-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now click play.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#play-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#play-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_near_block", ".tutorial-text-wrapper", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice we only hear the other block. Any muted block will be... muted. Surprising isn't it?");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "solo-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "When one or more blocks have solo enabled, every other block is muted. Click the solo toggle.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#solo-toggle");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#solo-toggle");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "mute-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "Why don't we hear anything now? Solo mutes the other block, and mute is still enabled on this one. Toggle mute off.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#mute-toggle");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#solo-toggle");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "solo-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "There we go. Now that we know how mute and solo work, toggle solo off.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#solo-toggle");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#solo-toggle");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_near_block", ".tutorial-text-wrapper", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "You might want to move blocks around once you've placed them. Let's move a block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "First select the block that isn't moving.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Great, now click on it again and hold the button down.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridUp", 7, 8);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 7, 9);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now move the mouse here and let go of the button.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Makes you feel powerful, doesn't it?");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", -1);
        addTutorialCommand("change_element_text", ".tutorial-text", "You can 'paint' multiple blocks to the screen too. Click an empty grid location and hold the button down.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridUp", 10, 10);
        addTutorialCommand("change_element_text", ".tutorial-text", "Keep holding the button down, move the mouse here and then let go.");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 10, 11);

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Cool. Now that you're a bit familiar with creating and editing music blocks, let's try the fun stuff: effect blocks. First let's clean up this mess!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "select-all-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's select every block using the Select All batch edit. Click it now.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#select-all-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#select-all-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "delete-selected-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Good. The other batch edit deletes all selected blocks. Now that they are all selected, click the X to clear the board.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#delete-selected-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#delete-selected-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 2, 4);
        addTutorialCommand("change_element_text", ".tutorial-text", "So fresh and so clean! Let's add a music block here before we bring out the effect blocks.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "block-effect");
        addTutorialCommand("move_near", ".tutorial-text-wrapper", "#block-effect", -60, 40);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now let's switch to the Effect Block Panel. Click here.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#block-effect");


        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 4, 5);
        addTutorialCommand("change_element_text", ".tutorial-text", "What is an effect block you ask? Let's review, a music block is a block that moves around and makes sounds whenever it collides with something.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Effect blocks don't make sounds on collision, they change the music blocks that hit them. They also never move.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 4, 4);
        addTutorialCommand("change_element_text", ".tutorial-text", "Note Effect is selected by default. Let's spawn an effect block here and see what this does.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's send the music block toward the effect block. Select the music block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "keyDown", 39);
        addTutorialCommand("change_element_text", ".tutorial-text", "There are some keyboard shortcuts that will make everything easier. Instead of clicking the right arrow, press the right arrow key on your keyboard. Much easier!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice how each time the music block hits the effect block, the note changes? This is what the effect block does. Every time a block hits an effect block, that music block will change.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click the effect block to see how you can control this behavior.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 11, 3);
        //addTutorialCommand("move_near", ".tutorial-text-wrapper", "#block-music", -15, 220);
        addTutorialCommand("change_element_text", ".tutorial-text", "OK. Step progression is a kind of note effect where each time a music block collides, it will increase the note by whatever amount we choose.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "As you can see, the step size is initially set to 5 and 'up'. This means the music block's note will increase by 5 steps each time it hits this effect block.");

        //These 4 identical steps are so the user can click the same button 4 times.
        for (var i = 0; i < 4; i++) {
            musicApp.tutorialArray.push([]);
            addTutorialCommand("set_input", "element_clicked", "step-size-down");
            addTutorialCommand("change_element_text", ".tutorial-text", "Let's change this to illustrate what it does, click the down arrow until the step size is 1.");
            addTutorialCommand("move_near", "#tutorial-down-arrow", "#block-music", 161, 105);
        }

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "You can probably hear the difference, but let's see it. Click pause.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#pause-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#pause-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now select the music block again.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "play-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now click play.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#play-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#play-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "You can see how the note stays the same each time it hits the wall, but the note increases by 1 each time it hits the effect block. Booyah.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's add another effect block, but first let's move these blocks over to make room. Click pause.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#pause-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#pause-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1, 'shift');
        addTutorialCommand("change_element_text", ".tutorial-text", "We could move these one at a time, but let's select them both instead. Hold the shift key on your keyboard and click the effect block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "rightMouse");
        addTutorialCommand("change_element_text", ".tutorial-text", "Nicely done, now they are both selected. We've already used the Select All batch edit to select blocks, so let's see another method to do that. Right-clicking anywhere will deselect all blocks. Click your right mouse button now.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "select-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "This whole time we've been using Create Mode to create blocks. Let's switch to Select Mode. Click the icon here.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#select-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#select-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 0, 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "While in Select Mode, no new blocks can be created. You can use it to select blocks. Shock. Click this grid location.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "You see? Nothing happened. If you are ever trying to create blocks and nothing is happening, you are probably in Select Mode.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 0, 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here again but this time, hold the button down.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridUp", 9, 7);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 9, 8);
        addTutorialCommand("change_element_text", ".tutorial-text", "What a beautiful dragbox! Now move the mouse here and let go.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Wabam! Everything in the dragbox is now selected. In our case it's just these two blocks, but you get the idea.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "To move multiple selected blocks, you just move one and they will all follow. Click on the effect block and hold the button down.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridUp", 6, 7);
        addTutorialCommand("change_element_text", ".tutorial-text", "Drag those blocks around to get a feel for it, then move the mouse here and let go.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Perfect. That's it for select mode. Switching to Erase Mode works just like Select Mode, but now every block you 'select' is deleted. You can play around with that after the tutorial.");
        addTutorialCommand("position_element", "#tutorial-down-arrow-noaction", "above", "#trash-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#trash-icon");


        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Onward! Now let's copy the effect block. Click on it... this will deselect all other blocks and switch to the Effect Panel.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "create-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "We are trying to make a block, so switch back to Create Mode.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#create-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#create-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 1, 7);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to add a copy of the effect block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now select the music block again so we can watch the note change.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "play-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now click play.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#play-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#play-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Getting it? Now the note is changing twice as much because it's between two effect blocks. Groovy.");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "above", ".piano-wrapper");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Just a couple more things and we'll be done with the 'Note' Effect. Click pause.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#pause-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#pause-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_block_scale", 1, "A Major / F# Minor");
        addTutorialCommand("set_block_scale", 2, "A Major / F# Minor");
        addTutorialCommand("set_block_volume", 1, "min", 10);
        addTutorialCommand("set_block_volume", 2, "min", 10);
        addTutorialCommand("set_block_volume", 1, "max", 100);
        addTutorialCommand("set_block_volume", 2, "max", 100);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now click this effect block.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 2, 'shift');
        addTutorialCommand("change_element_text", ".tutorial-text", "Hold shift and click the other one so both are selected.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        //addTutorialCommand("move_near", ".tutorial-text-wrapper", "#select-note-scale", -30, 40);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 11, 8);
        addTutorialCommand("change_element_text", ".tutorial-text", "Originally, the scale was set to 'Chromatic' which just means every note on the piano. Clicking here will drop down a scale menu for you to choose from. I've selected A Major for you.");



        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click the music block so we can watch it walk up the scale.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "play-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Click play and let's see what this did.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#play-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#play-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Do you hear the difference? Now all the block is walking up the A Major scale. Watch the notes on the piano roll too.");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "above", ".piano-wrapper");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Play around with the different scales and the step size after the tutorial, you can make some pretty cool stuff that way!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "We're almost done, back to the effect blocks... click here.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 2, 'shift');
        addTutorialCommand("change_element_text", ".tutorial-text", "Hold shift and click the other one so both are selected.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "C5");
        addTutorialCommand("change_element_text", ".tutorial-text", "See this purple range of notes? It represents the notes that the effect will cycle through. Let's change it to see how it works. Click on C5.");
        addTutorialCommand("move_near", "#tutorial-down-arrow", ".piano-wrapper", $("#D5").outerWidth() * 21.5 - $("#tutorial-down-arrow").width() / 2, 15 - ($("#tutorial-down-arrow").height()));
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "above", "#tutorial-down-arrow");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "E6");
        addTutorialCommand("change_element_text", ".tutorial-text", "Clicking on the piano roll with this range active will move either the min or max to the clicked note, whichever is close. Click on E6");
        addTutorialCommand("move_near", "#tutorial-down-arrow", ".piano-wrapper", $("#D5").outerWidth() * 30.5 - $("#tutorial-down-arrow").width() / 2, 15 - ($("#tutorial-down-arrow").height()));
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "above", "#tutorial-down-arrow");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "There you go. You can also use these sliders or the knobs on the panel to edit these ranges. So many options!");
        addTutorialCommand("move_near", "#tutorial-down-arrow-noaction", ".piano-wrapper", $("#D5").outerWidth() * 21.5 - $("#tutorial-down-arrow").width() / 2, 10 - ($("#tutorial-down-arrow").height()));
        addTutorialCommand("move_near", "#tutorial-up-arrow-noaction", ".piano-wrapper", $("#D5").outerWidth() * 30.5 - $("#tutorial-down-arrow").width() / 2, 15 + $("#D5").outerHeight());
        addTutorialCommand("move_near", "#tutorial-right-arrow-noaction", "#block-music", -9, 126);
        addTutorialCommand("move_near", "#tutorial-left-arrow-noaction", "#block-music", 114, 126);

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "volume-effect-dropdown");
        //addTutorialCommand("move_near", ".tutorial-text-wrapper", "#block-music", 0, 310);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 11, 8);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click on Volume Effect.");
        addTutorialCommand("move_near", "#tutorial-down-arrow", "#block-music", 88, 237);

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "volume-activator");
        addTutorialCommand("change_element_text", ".tutorial-text", "The Volume effect is similar to the Note Effect, but instead of changing the note, it changes how loud the note plays. Click on the toggle next to Volume effect to turn it on.");
        addTutorialCommand("move_near", "#tutorial-down-arrow", "#block-music", 0, 33);


        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_near_block", ".tutorial-text-wrapper", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "You might have noticed the little orange square on the effect blocks. This indicates that the Note Effect is active on the blocks. Now, there's a purple square to indicate that the Volume Effect is also active.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "See how the colors correspond to the color on the Effect Panel? We did that on purpose. High Five!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Hear that? The block gets progressively louder until it hits the maximum we defined on the panel. Let's see it. Click Pause.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#pause-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#pause-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now select the music block again.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "play-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now click play.");
        addTutorialCommand("position_element", "#tutorial-down-arrow", "above", "#play-icon");
        addTutorialCommand("position_element", ".tutorial-text-wrapper", "below", "#play-icon");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        //addTutorialCommand("move_near", ".tutorial-text-wrapper", "#block-music", 0, 370);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 11, 9);
        addTutorialCommand("move_near", "#tutorial-down-arrow-noaction", "#block-music", 85, 300);
        addTutorialCommand("change_element_text", ".tutorial-text", "See how the volume is increasing by 5? It's controlled by the step size we set in the Volume Effect.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click the effect block one more time.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        //addTutorialCommand("move_near", ".tutorial-text-wrapper", "#block-music", 0, 340);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 11, 8);
        addTutorialCommand("move_near", "#tutorial-down-arrow-noaction", "#block-music", 85, 270);
        addTutorialCommand("change_element_text", ".tutorial-text", "Velocity is an attribute of instrument sound that describes how hard you press a key on a piano, or how hard you blow on a flute.");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        //addTutorialCommand("move_near", ".tutorial-text-wrapper", "#block-music", 0, 365);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 11, 8);
        addTutorialCommand("move_near", "#tutorial-down-arrow-noaction", "#block-music", 85, 295);
        addTutorialCommand("change_element_text", ".tutorial-text", "Duration is just how long the note is held for. These Effects are controlled identically to Volume, feel free to play with them after the tutorial!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 7, 4);
        addTutorialCommand("change_element_text", ".tutorial-text", "Well that's it for the tutorial! If you have any questions or suggestions, feel free to email us using the contact links. We hope you enjoy using Music Blocks and if you do, feel free to share it with your friends! Click Next to end the tutorial and have a great day!");

        musicApp.tutorialArray.push([]);
        addTutorialCommand("end_tutorial");
    })();

    function setTutorialIndex(index) {
        tutorial_index = index;
    }

    function getTutorialIndex() {
        return tutorial_index;
    }

    function setValidInput(type, x, y, keycode, element_id) {

        musicApp.validInput.type = type;
        musicApp.validInput.x = x;
        musicApp.validInput.y = y;
        musicApp.validInput.keycode = keycode;
        musicApp.validInput.element_id = element_id;
        if (type != "next") {
            $(".tutorial-next").hide();
        } else {
            $(".tutorial-next").show();
        }
    }

    function checkValidInput(event) {

        if ((musicApp.validInput.type != "rightMouse" && event.which !== 3) || musicApp.validInput.type == "rightMouse") {
            switch (musicApp.validInput.type) {
                case "next":
                    //Eventually this case should do nothing, for now forwarding to keyDown T
                    return (event.type == "keydown" && event.keyCode == 84);

                case "gridUp":

                    var
                        gridX = musicApp.gridify(event.pageX - musicApp.config.grid_offset_x),
                        gridY = musicApp.gridify(event.pageY - musicApp.config.grid_offset_y);
                    return ((event.type == "mouseup" || event.type == "click") && gridX == musicApp.validInput.x && gridY == musicApp.validInput.y);

                case "gridDown":

                    var
                        gridX = musicApp.gridify(event.pageX - musicApp.config.grid_offset_x),
                        gridY = musicApp.gridify(event.pageY - musicApp.config.grid_offset_y);


                    var shiftcheck = ((musicApp.validInput.keycode == 'shift' && musicApp.config.is_shiftkey_enabled == 1) || (musicApp.config.is_shiftkey_enabled == 0 && musicApp.validInput.keycode != 'shift'));
                    return ((event.type == "mousedown" || event.type == "click") && shiftcheck && gridX == musicApp.validInput.x && gridY == musicApp.validInput.y);

                case "blockDown":
                    var
                        gridX = musicApp.gridify(event.pageX - musicApp.config.grid_offset_x),
                        gridY = musicApp.gridify(event.pageY - musicApp.config.grid_offset_y);
                    var shiftcheck = ((musicApp.validInput.y == 'shift' && musicApp.config.is_shiftkey_enabled == 1) || (musicApp.config.is_shiftkey_enabled == 0 && musicApp.validInput.y != 'shift'));
                    //musicApp.validInput.x is used to store the blockref we want
                    return ((event.type == "mousedown" || event.type == "click") && shiftcheck && musicApp.gridArray[gridX][gridY] == musicApp.validInput.x);

                case "keyDown":
                    return (event.type == "keydown" && event.keyCode == musicApp.validInput.keycode);

                case "rightMouse":
                    return (event.type == "mousedown" && event.which === 3);

                case "element_clicked":
                    $('.tutorial-overlay').hide();
                    console.log($(document.elementFromPoint(event.pageX, event.pageY)));

                    var id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].id;
                    if ($(document.elementFromPoint(event.pageX, event.pageY))[0].tagName == "polygon") {
                        id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].parentElement.parentElement.id;
                    } else if ($(document.elementFromPoint(event.pageX, event.pageY))[0].id == "Layer_1") {
                        id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].parentElement.id;
                    } else if ($(document.elementFromPoint(event.pageX, event.pageY))[0].className == "ui-icon ui-icon-triangle-1-s") {
                        console.log("test");
                        id_to_check = "step-size-down";
                    }




                    $('.tutorial-overlay').show();

                    return (id_to_check == musicApp.validInput.element_id);

                default:
                    return false;
            }
        }
    }

    function positionElementAtPoint(element, direction, x, y) {
        switch (direction) {
            case "above":
                element.css({
                    left: x - element.width() / 2,
                    top: y - element.height
                })
                break;

            case "below":
                element.css({
                    left: x - element.width() / 2,
                    top: y + element.height
                })
                break;

            case "left_of":
                element.css({
                    left: x - element.width(),
                    top: y + element.height() / 2
                })
                break;

            case "right_of":
                element.css({
                    left: x + element.width(),
                    top: y + element.height() / 2
                })
                break;
        }
    }

    function positionElementRelative(element, direction, targetElement, l, t, w, h) {
        var tgtWidth,
            tgtHeight,
            tgtLeft,
            tgtTop;

        if (targetElement == "grid") {
            tgtWidth = w;
            tgtHeight = h;
            tgtLeft = l;
            tgtTop = t;
        } else {
            var tgtPos = targetElement.position();
            tgtWidth = targetElement.width();
            tgtHeight = targetElement.height();
            tgtLeft = tgtPos.left;
            tgtTop = tgtPos.top;
            if (targetElement == $(".tutorial-text-wrapper") && $(".tutorial-next").css('display') != 'none') {
                tgtHeight += $(".tutorial-next").height();
            }

        }

        switch (direction) {
            case "above":
                element.css({
                    left: (tgtLeft + tgtWidth / 2 - element.width() / 2) + "px",
                    top: (tgtTop - element.height() - spacer) + "px",
                });
                break;

            case "below":
                element.css({
                    left: (tgtLeft + tgtWidth / 2 - element.width() / 2) + "px",
                    top: (tgtTop + tgtHeight + spacer) + "px",
                });
                break;

            case "right_of":
                element.css({
                    left: tgtLeft + tgtWidth + spacer + "px",
                    top: (tgtTop + tgtHeight / 2 - element.height() / 2) + "px",
                });
                break;

            case "left_of":
                element.css({
                    left: tgtLeft - element.width() - spacer + "px",
                    top: (tgtTop + tgtHeight / 2 - element.height() / 2) + "px",
                });
                break;
        }
    }

    var advanceTutorial = function() {
        musicApp.config.grid_offset_x = $("#grid").offset().left;
        musicApp.config.grid_offset_y = $("#grid").offset().top;

        //Hide the tutorial arrows.
        $(".tutorial-arrow").hide();

        for (var i = 0; i < musicApp.tutorialArray[tutorial_index].length; i++) {
            var current_step = musicApp.tutorialArray[tutorial_index][i];
            switch (current_step.command) {
                // Show the element
                case "show":
                    $(current_step.element).show();
                    break;

                    // Hide the element
                case "hide":
                    $(current_step.element).hide();
                    break;

                case "change_element_text":
                    $(current_step.element).html(current_step.text);
                    break;

                    // Move the element to the x,y position in left, top
                case "move":
                    $(current_step.element).css({
                        top: current_step.top,
                        left: current_step.left,
                    });
                    break;

                case "move_to_grid":
                    var gridpos = $('#grid').offset();
                    var
                        moveX = current_step.left * musicApp.config.block_size, // + gridpos.left,
                        moveY = gridpos.top + current_step.top * musicApp.config.block_size;
                    $(current_step.element).css({
                        left: moveX,
                        top: moveY,
                    });
                    break;

                case "move_near_block":
                    var gridpos = $('#grid').offset();
                    var moveX = musicApp.blocks[current_step.left].posX - $(current_step.element).width() / 2 + musicApp.config.block_size / 2,
                        moveY = gridpos.top + musicApp.blocks[current_step.left].posY + musicApp.config.block_size;
                    $(current_step.element).css({
                        left: moveX,
                        top: moveY,
                    });
                    break;

                case "resize":
                    $(current_step.element).css({
                        position: 'absolute',
                        width: current_step.width + "px",
                        height: current_step.height + "px",
                    });
                    break;

                    // Position the element near the element targeted in the "near" attribute
                case "move_near":
                    $(current_step.element).show();
                    var near_element_pos = $(current_step.near).position();
                    $(current_step.element).css({
                        left: (near_element_pos.left + current_step.left) + "px",
                        top: (near_element_pos.top + current_step.top) + "px",
                    });
                    break;

                case "position_element":
                    $(current_step.element).show();
                    if (current_step.near == "grid") {
                        var gridpos = $('#grid').offset();

                        positionElementRelative($(current_step.element), current_step.left, "grid",
                            current_step.width * musicApp.config.block_size,
                            gridpos.top + current_step.height * musicApp.config.block_size,
                            musicApp.config.block_size,
                            musicApp.config.block_size);
                    } else if (current_step.near == "point") {
                        positionElementAtPoint($(current_step.element), current_step.left, current_step.width, current_step.height);
                    } else {
                        positionElementRelative($(current_step.element), current_step.left, $(current_step.near));
                    }
                    break;

                case "set_input":
                    //using element as type
                    //using left as x
                    //using top as y
                    //using width as keycode
                    //using left as element_id
                    setValidInput(current_step.element, current_step.left, current_step.top, current_step.width, current_step.left);
                    if ((current_step.left != -1 && current_step.element == "blockDown") || current_step.element == "gridDown" || current_step.element == "gridUp") {
                        surround(current_step);
                    }
                    break;

                case "clear_all":
                    musicApp.deleteAllBlocks();
                    break;

                case "initialize_tutorial":
                    //Clear the blocks                
                    musicApp.deleteAllBlocks();

                    //Set mode to create and play
                    $("#create-icon").click();
                    $("#play-icon").click();

                    //Set music block panel
                    $("#block-music").click();

                    //Set note to C5
                    musicApp.setMusicBlockParams('note', 60);

                    // This call might not be needed anymore, setParams calls updatePianoRoll
                    musicApp.updatePianoRoll();
                    $(".note-step-size").spinner("value", 5);
                    musicApp.setEffectBlockParams("note", "step", 5);

                    //NEED: Reset all panel values to defaults                

                    break;

                case "set_block_scale":
                    musicApp.blocks[current_step.element].configMap.note.scale = current_step.left;
                    musicApp.blocks[current_step.element].rebuildRangeValidNotes();
                    break;

                case "set_block_volume":
                    if (current_step.left == "min") {
                        musicApp.blocks[current_step.element].configMap.volume.range_low = current_step.top;
                    } else {
                        musicApp.blocks[current_step.element].configMap.volume.range_high = current_step.top;
                    }
                    break;

                case "end_tutorial":
                    endTutorial();
                    return;
                    break;
            }
        }
        tutorial_index++;
        if (tutorial_index >= musicApp.tutorialArray.length) {
            tutorial_index = 0;
        }
    }

    endTutorial = function() {
        tutorial_index = -1;
        musicApp.validInput.type = null;
        $('.tutorial-text-wrapper').hide();
        $('.tutorial-overlay').hide();
    }

    surround = function(current_step) {
        $("#tutorial-down-arrow").show();
        var gridPos, posLeft, posTop;
        gridpos = $('#grid').offset();
        if (current_step.element == "gridDown" || current_step.element == "gridUp") {
            posLeft = current_step.left * musicApp.config.block_size;
            posTop = gridpos.top + current_step.top * musicApp.config.block_size;
        } else if (current_step.element == "blockDown") {
            posLeft = musicApp.blocks[current_step.left].posX;
            posTop = gridpos.top + musicApp.blocks[current_step.left].posY;
        }

        positionElementRelative($("#tutorial-down-arrow"), "above", "grid",
            posLeft, posTop + 10, musicApp.config.block_size, musicApp.config.block_size);

        positionElementRelative($(".tutorial-text-wrapper"), "below", "grid",
            posLeft, posTop, musicApp.config.block_size, musicApp.config.block_size);
    }

    simulateEventAtPoint = function(event) {
        var elemAtPnt = $(document.elementFromPoint(event.pageX, event.pageY));
        if (elemAtPnt[0].tagName == "IMG") {
            elemAtPnt[0].click(event);
        } else if (elemAtPnt[0].tagName == "polygon") {
            elemAtPnt[0].parentElement.parentElement.click();
        } else if (elemAtPnt[0].id == "Layer_1") {
            elemAtPnt[0].parentElement.click();
        } else if (elemAtPnt[0].id == "grid") {
            if (event.type == "mousedown") {
                musicApp.gridMouseDown(event);
            } else
            if (event.type == "mouseup") {
                musicApp.gridMouseUp(event);
            }
        } else if (elemAtPnt[0].id == "D5") {
            musicApp.blocks[0].note = 62;
            musicApp.setMusicBlockParams('note', 62);
        } else if (elemAtPnt[0].id == "C5") {
            musicApp.blocks[1].configMap.note.range_low = 60;
            musicApp.blocks[1].rebuildRangeValidNotes();
            musicApp.blocks[2].configMap.note.range_low = 60;
            musicApp.blocks[2].rebuildRangeValidNotes();
            musicApp.setToEffectBlock(1);
        } else if (elemAtPnt[0].id == "E6") {
            musicApp.blocks[1].configMap.note.range_high = 76;
            musicApp.blocks[1].rebuildRangeValidNotes();
            musicApp.blocks[2].configMap.note.range_high = 76;
            musicApp.blocks[2].rebuildRangeValidNotes();
            musicApp.setToEffectBlock(1);
        } else if ($(document.elementFromPoint(event.pageX, event.pageY))[0].className == "ui-icon ui-icon-triangle-1-s") {
            $(".note-step-size").spinner("stepDown");
        } else if (event.type == "mousedown" || event.type == "mouseup") {
            elemAtPnt[0].click(event);
        }

    };

    $('.tutorial-overlay').mousedown(function(event) {
        if (checkValidInput(event)) {
            $('.tutorial-overlay').hide();
            simulateEventAtPoint(event);
            advanceTutorial();
        }
        if (musicApp.validInput.type != "gridUp") {
            $('.tutorial-overlay').show();
        }
    });

    $('.tutorial-next').mousedown(function(event) {
        advanceTutorial();
    });

    return {
        advanceTutorial: advanceTutorial,
        setTutorialIndex: setTutorialIndex,
        getTutorialIndex: getTutorialIndex,
        checkValidInput: checkValidInput,
        endTutorial: endTutorial
    };
})();

