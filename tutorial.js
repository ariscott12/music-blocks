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
tutorial = (function (){    
    tutorial_index = -1;

    function addTutorialCommand(comm, elem, l, t, w, h, near, text){
        switch (comm){
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

            case "set_input":
                //for keyDown, the keycode is stored in l, and placed in w to be processed properly
                if(elem == "keyDown"){
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
        }

        tutorialArray[tutorialArray.length-1].push(step);
    };

    (function makeTutorial(){

        // Add commands using the function. 
        // Each function call adds a command to the last step in the array.

        //Tutorial commands to initialize the tutorial
        addTutorialCommand("initialize_tutorial");

        addTutorialCommand("set_input", "gridDown", 5, 4);    
        addTutorialCommand("show", ".tutorial-text-wrapper");    
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 5);    
        addTutorialCommand("change_element_text", ".tutorial-text", "First off, let's add a music block. Click the grid here.");

        // To add a new tutorial step, push a new array onto tutorialArray.
        // Subsequent calls to addTutorialCommand add the command to this step.
        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("show", ".tutorial-text-wrapper");    
        addTutorialCommand("change_element_text", ".tutorial-text", "Music blocks store note information and produce sound whenever they collide with something. Let's give this one something to bounce off of besides the wall."); 

        tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 5, 5);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 6);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to create another music block."); 

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice how the new block is slightly darker... this indicates that this block is selected."); 

        tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 5, 4);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 5);  
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to select the first music block again."); 

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice that clicking a single block deselects any other blocks."); 

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "up");
        addTutorialCommand("change_element_text", ".tutorial-text", "OK, let's get this block moving! Click the up arrow on the panel."); 
        addTutorialCommand("move_near", ".tutorial-text-wrapper", ".block-direction-select", 0, 30);    
        
        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 6);
        addTutorialCommand("change_element_text", ".tutorial-text", "Great, notice that the unselected block isn't moving... changing an attribute in the panel or piano roll only effects selected blocks.");     

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Also, notice that each time the block hits the wall, the C5 note plays. How musical!"); 

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 10, 10);    
        addTutorialCommand("change_element_text", ".tutorial-text", "You can tell exactly which note the block will play by checking the display in the panel, or looking at the piano roll."); 
        
        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "D5");
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's change the note... click the D5 on the piano roll."); 
        addTutorialCommand("move_near", ".tutorial-text-wrapper", ".piano-wrapper", 0, -30);        

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now D5 plays on every collision.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("set_input", "gridDown", 5, 5);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 6);
        addTutorialCommand("change_element_text", ".tutorial-text", "Let's copy a block... click on the block that isn't moving.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text", 10, 10);         
        addTutorialCommand("change_element_text", ".tutorial-text", "See how C5 is selected on the piano roll again? Clicking a block updates the panel with all the selected blocks information.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "gridDown", 4, 5);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 4, 6);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click here to create another music block.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "The new block is a copy of the previous block we selected. Sweet.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "left");
        addTutorialCommand("change_element_text", ".tutorial-text", "Click the left arrow to start this one moving left."); 
        addTutorialCommand("move_near", ".tutorial-text-wrapper", ".block-direction-select", 0, 30);    
        
        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 5);  
        addTutorialCommand("change_element_text", ".tutorial-text", "Now we have two blocks moving and playing their notes. Next we'll select a block in motion.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");   
        addTutorialCommand("move_near", ".tutorial-text-wrapper", "#pause-icon", 0, 50);    
        addTutorialCommand("change_element_text", ".tutorial-text", "It can be tricky to select blocks while they are moving... so click on the pause button.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 8, 3);  
        addTutorialCommand("change_element_text", ".tutorial-text", "You may have noticed that you can see an arrow on selected blocks to show which way they are moving. Arrows appear on every block while paused.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "Select the first block. It's the one that is moving vertically.");        

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "mute-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "Click mute to mute the block.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "play-icon");
        addTutorialCommand("change_element_text", ".tutorial-text", "Now click play.");        

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next");
        addTutorialCommand("change_element_text", ".tutorial-text", "Notice we only hear the other block. Any muted block will be... muted. Surprising isn't it?");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "solo-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "When one or more blocks have solo enabled, every other block is muted. Click the solo toggle.");        

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "mute-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "Why don't we hear anything now? Solo mutes the other block, and mute is still enabled on this one. Toggle mute off.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "solo-toggle");
        addTutorialCommand("change_element_text", ".tutorial-text", "There we go. Now that we know how mute and solo work, toggle solo off.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "You might want to move blocks around once you've placed them. Let's move a block.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "element_clicked", "pause-icon");        
        addTutorialCommand("change_element_text", ".tutorial-text", "Click pause again.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", 0);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 5, 6);
        addTutorialCommand("change_element_text", ".tutorial-text", "Click on the selected block and hold the button down.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "gridUp", 7,8);
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 7, 9);
        addTutorialCommand("change_element_text", ".tutorial-text", "Now move the mouse here and let go of the button.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "blockDown", -1);
        addTutorialCommand("change_element_text", ".tutorial-text", "Nice. You can 'paint' multiple blocks to the screen too. Click an empty grid location and hold the button down.");

        tutorialArray.push([]);
        addTutorialCommand("set_input", "gridUp", 10,10);
        addTutorialCommand("change_element_text", ".tutorial-text", "Keep holding the button down, move the mouse here and then let go.");        
        addTutorialCommand("move_to_grid", ".tutorial-text-wrapper", 10, 11);

        tutorialArray.push([]);
        addTutorialCommand("set_input", "next", 0);
        addTutorialCommand("change_element_text", ".tutorial-text", "That's it!");        

        tutorialArray.push([]);
        //addTutorialCommand("clear_all");
        addTutorialCommand("end_tutorial");
    })();

    function setTutorialIndex(index){
        tutorial_index = index;
    }

    function getTutorialIndex(){
        return tutorial_index;
    }

    function setValidInput(type, x, y, keycode, element_id){
        valid_input.type = type;
        valid_input.x = x;
        valid_input.y = y;
        valid_input.keycode = keycode;
        valid_input.element_id = element_id;
        if(type != "next"){
            $(".tutorial-next").hide();
        }
        else{
            $(".tutorial-next").show();   
        }
    }

    function checkValidInput(event){
        //console.log("CHECKING VALID INPUT");
        // console.log(valid_input);
        // console.log(event);
        switch(valid_input.type){
            case "next":
                //Eventually this case should do nothing, for now forwarding to keyDown T
                return (event.type == "keydown" && event.keyCode == 84);
                break;

            case "gridUp":
                var 
                    gridX = utilities.gridify(event.pageX - config.gridOffsetX),
                    gridY = utilities.gridify(event.pageY - config.gridOffsetY);
                return ((event.type == "mouseup" || event.type == "click") && gridX == valid_input.x && gridY == valid_input.y);
                break;

            case "gridDown":            
                
                // console.log(event.pageX + " " + config.gridOffsetX);
                // console.log(event.pageY + " " + config.gridOffsetY);
                
                var 
                    gridX = utilities.gridify(event.pageX - config.gridOffsetX),
                    gridY = utilities.gridify(event.pageY - config.gridOffsetY);
                    // console.log("checking " + gridX + ", " + gridY);
                    var shiftcheck = ((valid_input.keycode == 'shift' && config.shiftkey == 1) || (config.shiftkey == 0 && valid_input.keycode != 'shift'));
                return ((event.type == "mousedown" || event.type == "click") && shiftcheck && gridX == valid_input.x && gridY == valid_input.y);
                break;

            case "blockDown":
                gridX = utilities.gridify(event.pageX - config.gridOffsetX),
                gridY = utilities.gridify(event.pageY - config.gridOffsetY);
                //valid_input.x is used to store the blockref we want
                return ((event.type == "mousedown" || event.type == "click") && gridArray[gridX][gridY] == valid_input.x);
                break;

            case "keyDown":
                return (event.type == "keydown" && event.keyCode == valid_input.keycode);
                break;

            case "element_clicked":    
                $('.tutorial-overlay').hide();
                var id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].id;
                if ($(document.elementFromPoint(event.pageX, event.pageY))[0].tagName == "polygon"){
                    id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].parentElement.parentElement.id;
                }
                else if ($(document.elementFromPoint(event.pageX, event.pageY))[0].id == "Layer_1"){
                    id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].parentElement.id;
                }
                /*if ($(document.elementFromPoint(event.pageX, event.pageY))[0].tagName == "IMG"){
                    console.log("ITS IMG");
                    id_to_check = $(document.elementFromPoint(event.pageX, event.pageY))[0].parentElement.id;
                }*/
                $('.tutorial-overlay').show();
                return (id_to_check == valid_input.element_id);

                break;

            default:
                return false;
                break;
        }
    }

    function positionElementRelative(element, direction, targetElement){
        var tgtPos = targetElement.position();
        switch(direction){
            case "above":
                element.css({
                    left: tgtPos.left ,
                    top: tgtPos.top - element.height(),
                });
                break;

            case "below":
                //element.css({
                $('#next').css({
                    position: 'absolute',
                    left: tgtPos.left ,
                    top: tgtPos.top + targetElement.height(),
                });
                break;
            }
    }

    var advanceTutorial = function (){
        config.gridOffsetX = $("#grid").offset().left;
        config.gridOffsetY = $("#grid").offset().top;

        for (var i = 0; i < tutorialArray[tutorial_index].length; i++) {
            var current_step = tutorialArray[tutorial_index][i];
          //  console.log("processing tutor command: " + current_step.command + " " + current_step.element);
            //console.log($(current_step[1]));
            switch (current_step.command) {
                // Show the element
                case "show":
                // console.log("will target" + current_step.element+ " to be shown");
                    $(current_step.element).show();
                    break;

                // Hide the element
                case "hide":
                    $(current_step.element).hide();
                    break;            

                case "change_element_text":
                    $(current_step.element).html(current_step.text);
                    // //$("#next").width( $(current_step.element).width() );
                    // positionElementRelative($(".next"), 'below', $(current_step.element));
                    break;

                // Move the element to the x,y position in left, top
                case "move":
                    $(current_step.element).css ({
                        //position:'absolute',
                        top: current_step.top,
                        left: current_step.left,
                    });
                    // $(current_step.element).html("Moved to " + current_step.left + ", " +  current_step.top);
                    break;

                case "move_to_grid":
                    var gridpos = $('#grid').offset();
                    var 
                        moveX = current_step.left * config.blockSize,// + gridpos.left,
                        moveY = gridpos.top + current_step.top * config.blockSize;
                    //console.log($(current_step.element));
                    $(current_step.element).css ({
                        //position:'absolute',
                        left: moveX,
                        top: moveY,
                    });
                    break;

                // Resize the element to width, height
                case "resize":
                    $(current_step.element).css ({
                        position:'absolute',
                        width: current_step.width + "px",
                        height: current_step.height + "px",
                    });
                    // $(current_step.element).html("Resized to " + current_step.width + " by " +  current_step.height);
                    break;            

                // Position the element near the element targeted in the "near" attribute
                case "move_near":
                    var near_element_pos = $(current_step.near).position();
                    // console.log("WILL MOVE NEAR");
                    // console.log($(current_step.near));
                    // console.log(near_element_pos.left + near_element_pos.top);
                    $(current_step.element).css ({
                        //position:'absolute',                
                        left: (near_element_pos.left  + current_step.left) + "px",
                        top: (near_element_pos.top + current_step.top) + "px",
                    });
                    break;

                case "set_input":
                    //using element as type
                    //using left as x
                    //using top as y
                    //using width as keycode
                    //using left as element_id
                    setValidInput(current_step.element, current_step.left, current_step.top, current_step.width, current_step.left);
                    break;

                case "clear_all":
                    utilities.deleteAllBlocks();
                    break;

                case "initialize_tutorial":
                    //Clear the blocks                
                    utilities.deleteAllBlocks();

                    //Set mode to create and play
                    $("#create-icon").click();
                    $("#play-icon").click();

                    //Set music block panel
                    $("#block-music").click();                

                    //Set note to C5
                    musicBlockPanel.setParams('note',60);
                    musicBlockPanel.updatePianoRoll();
                    
                    //NEED: Reset all panel values to defaults                

                    break;


                case "end_tutorial":
                    endTutorial();
                    return;
                    break;
            }            
        }
        tutorial_index++;
        if (tutorial_index >= tutorialArray.length){
            tutorial_index = 0;
        }
    }

    endTutorial = function(){
        tutorial_index = -1;
        valid_input.type = null;
        $('.tutorial-text-wrapper').hide();
        $('.tutorial-overlay').hide();
        //$('.html').click();
    }

    simulateEventAtPoint = function(event) {
        var elemAtPnt = $(document.elementFromPoint(event.pageX, event.pageY));
        //console.log(elemAtPnt);
        // console.log(elemAtPnt[0].parentElement);
        // console.log(document.getElementById(elemAtPnt[0].parentElement.id));
        //elemAtPnt.trigger(event);
        if (elemAtPnt[0].tagName == "IMG"){
            //var stopArrow = document.getElementById("stop");
            elemAtPnt[0].click(event);        
        } 
        else if (elemAtPnt[0].tagName == "polygon"){
            elemAtPnt[0].parentElement.parentElement.click();
        }
        else if (elemAtPnt[0].id == "Layer_1"){
            elemAtPnt[0].parentElement.click();
        }
        else if (elemAtPnt[0].id == "grid"){
            if(event.type == "mousedown"){
                setGridEvents.mouseDown(event);
            } else
            if(event.type == "mouseup"){            
                setGridEvents.mouseUp(event);
            }
        }
        else if (elemAtPnt[0].id == "D5"){
            blocks[0].note = 62;
            musicBlockPanel.setParams('note',62);
            musicBlockPanel.updatePianoRoll();
        }
        else if (event.type == "mousedown" || event.type == "mouseup"){
            elemAtPnt[0].click(event);
        }

        // console.log(event);
    }

    /*$('.tutorial-overlay').click(function(event){
            //console.log("VALID INPUT: " + checkValidInput(event));
            if(checkValidInput(event)){
                advanceTutorial();            
            }
            $('.tutorial-overlay').hide();
                 console.log($(document.elementFromPoint(event.pageX, event.pageY)));
                 simulateEventAtPoint(event);
                $('.tutorial-overlay').show();
                
            
        });*/
    $('.tutorial-overlay').mousedown(function(event){

        
            


        if(checkValidInput(event)){
            // $('.tutorial-overlay').hide();
            // simulateEventAtPoint(event);
            // $('.tutorial-overlay').show();
            $('.tutorial-overlay').hide();
            simulateEventAtPoint(event);
            advanceTutorial();
        }
        if(valid_input.type != "gridUp"){
            $('.tutorial-overlay').show(); 
        }
    });

    $('.tutorial-next').mousedown(function(event){
        advanceTutorial();    
    });

    return {
        advanceTutorial:advanceTutorial,
        setTutorialIndex:setTutorialIndex,
        getTutorialIndex:getTutorialIndex,
        checkValidInput: checkValidInput,
    }    
})();