#include "libs/json2.js" // jshint ignore:line
#include "libs/lodash.js" // jshint ignore:line
#include "libs/async.js" // jshint ignore:line

main();

function main() {
    // var filepath = "~/Desktop/test.json";
    // var write_file = File(filepath);

    var folder = Folder.selectDialog ("Select a folder");
    if(folder !== null){
        var filesArr = folder.getFiles ('*.indd');
        var file, fileFolder, dataStr, doc;
        for (var i = 0; i < filesArr.length; i++) {
          file = filesArr[i];

          // prepare folder and json file
          fileFolder = new Folder(file.fullName.split('.')[0]);
          fileFolder.create();

          // doc
          doc = app.open(file, true);

          // bg
          exportBackground(doc, fileFolder+'/bg.png');

          var infos = {};
          //prefs
          infos.prefs = exportAppPrefs();
          // text
          infos.texts = exportTexts(doc, fileFolder+'/text');

          writeJsonFile(fileFolder.fullName+'/data.json', JSON.stringify(infos));

        }
    }
}

function exportTexts(doc, fullName) {
  var arr = [];
  doc.layers.everyItem().visible = false;
  var textLayer =  doc.layers.itemByName('_textes');
  if(textLayer.isValid) {
    textLayer.visible = true;
    $.writeln('textLayer.textFrames.length : ', textLayer.textFrames.length);
    
    var txtFrame, rObj, bounds;
    for (var i = 0; i < textLayer.textFrames.length; i++) {
      txtFrame = textLayer.textFrames[i];
      rObj = {};
      rObj.text =  escape(txtFrame.contents);
      bounds = txtFrame.geometricBounds;
      rObj.bounds = {
        x: bounds[1], 
        y: bounds[0], 
        width: bounds[3] - bounds[1],
        height: bounds[2] - bounds[0]
      };
      // $.writeln('txtFrame fontStyle: ', txtFrame.textStyleRanges[0].fontStyle);
      // $.writeln('txtFrame appliedFont.fontFamily: ', txtFrame.texts[0].appliedFont.fontFamily);
      // $.writeln('txtFrame appliedFont.fontStyleName: ', txtFrame.texts[0].appliedFont.fontStyleName);
      // $.writeln('txtFrame appliedFont.fontStyleNameNative: ', txtFrame.texts[0].appliedFont.fontStyleNameNative);
      // $.writeln('txtFrame appliedFont.fullName: ', txtFrame.texts[0].appliedFont.fullName);
      // $.writeln('txtFrame appliedFont.fullNameNative: ', txtFrame.texts[0].appliedFont.fullNameNative);
      // $.writeln('txtFrame pointSize: ', txtFrame.texts[0].pointSize);
      // $.writeln('txtFrame characterAlignment: ', txtFrame.texts[0].characterAlignment);
      //$.writeln('txtFrame characterAlignment: ', txtFrame.texts[0].justification);
      rObj.fontFamily = txtFrame.texts[0].appliedFont.fontFamily;
      rObj.fontStyleName = txtFrame.texts[0].appliedFont.fontStyleName;
      rObj.pointSize = txtFrame.texts[0].pointSize;
      rObj.verticalAlign = exportAlign(txtFrame.texts[0].characterAlignment);
      rObj.horizontalAlign = exportJustification(txtFrame.texts[0].justification);
      arr.push(rObj);
      //txtFrame.exportFile(ExportFormat.TEXT_TYPE, new File(fullName+i), true);
    }
  } else {
    return false;
  }
  return arr;
}

function exportAlign(align) {
  // CharacterAlignment.ALIGN_BASELINE
  // CharacterAlignment.ALIGN_EM_TOP
  // CharacterAlignment.ALIGN_EM_CENTER
  // CharacterAlignment.ALIGN_EM_BOTTOM
  // CharacterAlignment.ALIGN_ICF_TOP
  // CharacterAlignment.ALIGN_ICF_BOTTOM
  return align.toString();
}

function exportJustification(justif) {
  return justif.toString();
// Justification.LEFT_ALIGN
// Justification.CENTER_ALIGN
// Justification.RIGHT_ALIGN
// Justification.LEFT_JUSTIFIED
// Justification.RIGHT_JUSTIFIED
// Justification.CENTER_JUSTIFIED
// Justification.FULLY_JUSTIFIED
// Justification.TO_BINDING_SIDE
// Justification.AWAY_FROM_BINDING_SIDE
}

function exportBackground(doc, fullName) {
  // prefs d'export en 'read only'. Il faut faire un premiere export pour setter les paramètres désirés
  doc.layers.everyItem().visible = false;
  var bgLayer =  doc.layers.itemByName('_fond');
  if(bgLayer.isValid) {
      bgLayer.visible = true;
    if (!doc.saved) { doc.save(); }
    doc.exportFile(ExportFormat.PNG_FORMAT , new File(fullName), false);
  } else {
    return false;
  }
}

function exportAppPrefs() {
  var obj = {};
  obj.xUnitsIsPixel = (app.viewPreferences.horizontalMeasurementUnits == MeasurementUnits.PIXELS);
  obj.yUnitsIsPixel = (app.viewPreferences.verticalMeasurementUnits == MeasurementUnits.PIXELS);
  if(!obj.xUnitsIsPixel || !obj.yUnitsIsPixel) {
    $.writeln('Fermer toutes les documents ouverts dans Indesign et changer les prefs "Units and roulers" pour PIXELS. Ainsi ce seront les prefs par defaut');
  }
  return obj;
}

function writeJsonFile(fullName, dataStr) {
  var write_file = new File(fullName);

  var out = write_file.open('w', undefined, undefined);
  write_file.encoding = "UTF-8";
  write_file.lineFeed = "Unix"; //convert to UNIX lineFeed
  write_file.writeln(dataStr);
  write_file.close();
}
