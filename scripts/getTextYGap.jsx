  var ratio = 1;
  var doc = app.activeDocument; // works with no doc
  var textLayer = doc.layers.itemByName('_textes');
  if (textLayer.isValid) {
    textLayer.visible = true;
    var txtFrame, bounds, htmlBounds;
    for (var i = 0; i < textLayer.textFrames.length; i++) {
        
      txtFrame = textLayer.textFrames[i];

      bounds = txtFrame.geometricBounds;
      
      htmlBounds = {
        x: bounds[1],
        y: bounds[0],
        width: (bounds[3] - bounds[1]),
        height: (bounds[2] - bounds[0])
      };
       
      $.writeln('txtFrame.contents: ', txtFrame.contents);
      $.writeln('txtFrame.htmlBounds.y: ', htmlBounds.y);
      $.writeln('txtFrame.htmlBounds.height: ', htmlBounds.height);
      $.writeln('txtFrame .ascent: ', txtFrame.texts[0].ascent);
      $.writeln('txtFrame .descent: ', txtFrame.texts[0].descent);
      $.writeln('txtFrame baseline: ', txtFrame.texts[0].baseline);
      $.writeln('txtFrame pointSize: ', txtFrame.texts[0].pointSize);
      $.writeln('txtFrame .characters: ', txtFrame.texts[0].characters);
      $.writeln('txtFrame .gridAlignment: ', txtFrame.texts[0].gridAlignment);
      $.writeln('txtFrame .yOffsetDiacritic: ', txtFrame.texts[0].yOffsetDiacritic);
      $.writeln('txtFrame .position: ', txtFrame.texts[0].position);
      $.writeln('\n\r ');
      
    }
  }
