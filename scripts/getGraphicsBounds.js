  var doc = app.activeDocument; // works with no doc
  var graphicLayer = doc.layers.itemByName('_graphics');

  if (graphicLayer.isValid) {
    graphicLayer.visible = true;

    $.writeln('graphicLayer.groups.count : ', graphicLayer.groups.count());

    var group, bounds, htmlBounds;
    for (var i = 0; i < graphicLayer.groups.count(); i++) {

      group = graphicLayer.groups[i];

      bounds = group.visibleBounds;

      htmlBounds = {
        x: bounds[1],
        y: bounds[0],
        width: (bounds[3] - bounds[1]),
        height: (bounds[2] - bounds[0]),
        marginPreferences: {
          bottom: 0,
          top: 0,
          left: 0,
          right: 0
        }
      };

      $.writeln('group.htmlBounds.x: ', htmlBounds.x);
      $.writeln('group.htmlBounds.y: ', htmlBounds.y);
      $.writeln('group.htmlBounds.width: ', htmlBounds.width);
      $.writeln('group.htmlBounds.height: ', htmlBounds.height);

      group.select(SelectionOptions.REPLACE_WITH);

      app.copy();

      var newDoc = app.documents.add({
        documentPreferences: {
          pageWidth: htmlBounds.width,
          pageHeight: htmlBounds.height,
          marginPreferences: {
            bottom: 0,
            top: 0,
            left: 0,
            right: 0
          }
        }
      });

      app.paste();
      
      var f = File(File(doc.filePath).fsName + '/graphic'+i+'.png');
      newDoc.exportFile(ExportFormat.PNG_FORMAT, f, true);
      newDoc.close(SaveOptions.NO);

    }
  }
