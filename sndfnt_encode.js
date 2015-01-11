#!/bin/bash

instr="banjo"

echo "if (typeof(MIDI) === 'undefined') var MIDI = {};" > $instr-mp3.js
echo "if (typeof(MIDI) === 'undefined') var MIDI = {};" > $instr-ogg.js
echo "if (typeof(MIDI.Soundfont) === 'undefined') MIDI.Soundfont = {};" >> $instr-mp3.js
echo "if (typeof(MIDI.Soundfont) === 'undefined') MIDI.Soundfont = {};" >> $instr-ogg.js
echo "MIDI.Soundfont.${instr} = {" >> $instr-mp3.js
echo "MIDI.Soundfont.${instr} = {" >> $instr-ogg.js
#find ./soundfont/$instr-mp3/ -name '*.mp3' -print0 | while read -d $'\0' file
 #   do
  #      # from OGG to base64 embedded in Javascript
   #     echo "\"`basename $file .mp3`\": \"data:audio/mp3;base64,`openssl enc -base64 -bufsize 9999 -in $file`\"," > tempfile.js
    #    cat tempfile.js | tr -d '\n' >> $instr-mp3.js
     #   echo "" >> $instr-mp3.js
    #done


find ./soundfont/$instr-ogg/ -name '*.ogg' -print0 | while read -d $'\0' file
    do
        # from OGG to base64 embedded in Javascript
        echo "\"`basename $file .ogg`\": \"data:audio/ogg;base64,`openssl enc -base64 -bufsize 9999 -in $file`\"," > tempfile.js
        cat tempfile.js | tr -d '\n' >> $instr-ogg.js
        echo "" >> $instr-ogg.js
    done
echo "" >> $instr-mp3.js    
echo "" >> $instr-ogg.js
echo "}" >> $instr-mp3.js    
echo "}" >> $instr-ogg.js