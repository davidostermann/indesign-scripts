/*
    json2.js
    2014-02-04

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (typeof JSON !== 'object') {
  JSON = {};
}

(function() {
  'use strict';

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function() {

      return isFinite(this.valueOf()) ? this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z' : null;
    };

    String.prototype.toJSON =
    Number.prototype.toJSON =
    Boolean.prototype.toJSON = function() {
      return this.valueOf();
    };
  }

  var cx, escapable, gap, indent, meta, rep;


  function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
      var c = meta[a];
      return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

    // Produce a string from holder[key].
    var i, // The loop counter.
    k, // The member key.
    v, // The member value.
    length, mind = gap,
        partial, value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.
    if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.
    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

    // What happens next depends on the value's type.
    switch (typeof value) {
    case 'string':
      return quote(value);

    case 'number':

      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(value) ? String(value) : 'null';

    case 'boolean':
    case 'null':

      // If the value is a boolean or null, convert it to a string. Note:
      // typeof null does not produce 'null'. The case is included here in
      // the remote chance that this gets fixed someday.
      return String(value);

      // If the type is 'object', we might be dealing with an object or an array or
      // null.
    case 'object':

      // Due to a specification blunder in ECMAScript, typeof null is 'object',
      // so watch out for that case.
      if (!value) {
        return 'null';
      }

      // Make an array to hold the partial results of stringifying this object value.
      gap += indent;
      partial = [];

      // Is the value an array?
      if (Object.prototype.toString.apply(value) === '[object Array]') {

        // The value is an array. Stringify every element. Use null as a placeholder
        // for non-JSON values.
        length = value.length;
        for (i = 0; i < length; i += 1) {
          partial[i] = str(i, value) || 'null';
        }

        // Join all of the elements together, separated with commas, and wrap them in
        // brackets.
        v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
        gap = mind;
        return v;
      }

      // If the replacer is an array, use it to select the members to be stringified.
      if (rep && typeof rep === 'object') {
        length = rep.length;
        for (i = 0; i < length; i += 1) {
          if (typeof rep[i] === 'string') {
            k = rep[i];
            v = str(k, value);
            if (v) {
              partial.push(quote(k) + (gap ? ': ' : ':') + v);
            }
          }
        }
      } else {

        // Otherwise, iterate through all of the keys in the object.
        for (k in value) {
          if (Object.prototype.hasOwnProperty.call(value, k)) {
            v = str(k, value);
            if (v) {
              partial.push(quote(k) + (gap ? ': ' : ':') + v);
            }
          }
        }
      }

      // Join all of the member texts together, separated with commas,
      // and wrap them in braces.
      v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
      gap = mind;
      return v;
    }
  }

  // If the JSON object does not yet have a stringify method, give it one.
  if (typeof JSON.stringify !== 'function') {
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    meta = { // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    };
    JSON.stringify = function(value, replacer, space) {

      // The stringify method takes a value and an optional replacer, and an optional
      // space parameter, and returns a JSON text. The replacer can be a function
      // that can replace values, or an array of strings that will select the keys.
      // A default replacer method can be provided. Use of the space parameter can
      // produce text that is more easily readable.
      var i;
      gap = '';
      indent = '';

      // If the space parameter is a number, make an indent string containing that
      // many spaces.
      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }

        // If the space parameter is a string, it will be used as the indent string.
      } else if (typeof space === 'string') {
        indent = space;
      }

      // If there is a replacer, it must be a function or an array.
      // Otherwise, throw an error.
      rep = replacer;
      if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }

      // Make a fake root object containing our value under the key of ''.
      // Return the result of stringifying the value.
      return str('', {
        '': value
      });
    };
  }


  // If the JSON object does not yet have a parse method, give it one.
  if (typeof JSON.parse !== 'function') {
    cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    JSON.parse = function(text, reviver) {

      // The parse method takes a text and an optional reviver function, and returns
      // a JavaScript value if the text is a valid JSON text.
      var j;

      function walk(holder, key) {

        // The walk method is used to recursively walk the resulting structure so
        // that modifications can be made.
        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }


      // Parsing happens in four stages. In the first stage, we replace certain
      // Unicode characters with escape sequences. JavaScript handles many characters
      // incorrectly, either silently deleting them, or treating them as line endings.
      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function(a) {
          return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

      // In the second stage, we run the text against regular expressions that look
      // for non-JSON patterns. We are especially concerned with '()' and 'new'
      // because they can cause invocation, and '=' because it can cause mutation.
      // But just to be safe, we want to reject all unexpected forms.
      // We split the second stage into 4 regexp operations in order to work around
      // crippling inefficiencies in IE's and Safari's regexp engines. First we
      // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
      // replace all simple value tokens with ']' characters. Third, we delete all
      // open brackets that follow a colon or comma or that begin the text. Finally,
      // we look to see that the remaining characters are only whitespace or ']' or
      // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
      if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

        // In the third stage we use the eval function to compile the text into a
        // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
        // in JavaScript: it can begin a block or an object literal. We wrap the text
        // in parens to eliminate the ambiguity.
        j = eval('(' + text + ')');

        // In the optional fourth stage, we recursively walk the new structure, passing
        // each name/value pair to a reviver function for possible transformation.
        return typeof reviver === 'function' ? walk({
          '': j
        }, '') : j;
      }

      // If the text is not JSON parseable, then a SyntaxError is thrown.
      throw new SyntaxError('JSON.parse');
    };
  }
}());


#include "libs/json2.js" // jshint ignore:line

Error.prototype.toString = function() {
    if (typeof this.stack === "undefined" || this.stack === null) {
        this.stack = "placeholder";
        // The previous line is needed because the next line may indirectly call this method.
        this.stack = $.stack;
    }
    return "Error";
};

var ratio = 1;

try {
  main();
} catch (e) {
  alert('[Error] \n\r Line: ' + e.line + '\n\r Message: ' + e.message);
  $.writeln("Line: " + e.line);
  $.writeln("File: " + e.fileName);
  $.writeln("Message: " + e.message);
  $.writeln("Stack: " + e.stack);
}

function main() {
  // var filepath = "~/Desktop/test.json";
  // var write_file = File(filepath);

  // PREPARE APP
  // ratio to fit exactly in 920x475
  //var ratio = exportRatio(doc, 920, 475);
  ratio = prompt("Choose the export ratio:", "1.5");
  // si cancel : w: 920 max. h : 600 max.  

  // PARSE FOLDER

  var folder = Folder.selectDialog("Select a folder");

  if (folder !== null) {

    var filesArr = folder.getFiles('*.indd');
    var folderArr = folder.getFiles(isFolder);
    var nbIndd = 0;

   
    var firstDoc = true;
    for (var i = 0; i < filesArr.length; i++) {
      exportDocument(filesArr[i], firstDoc);
      nbIndd++;
    }

    for (var j = 0; j < folderArr.length; j++) {

       filesArr = folderArr[j].getFiles('*.indd');
  
      $.writeln('folderArr /  filesArr : ', filesArr.length);
      
      for (var k = 0; k < filesArr.length; k++) {
        exportDocument(filesArr[k], firstDoc);
        nbIndd++;
       }
   
    }

    if (!nbIndd) {
      alert('Aucun fichier indesign trouvé.');
    } else {
       alert('L\'export est terminé. '+nbIndd+' traités');
    }

    
  }
}

function isFolder(folder) {
  return folder && folder.getFiles;
}

function exportDocument(file, firstDoc) {

  var fileFolder, dataStr, doc;
  // prepare folder and json file
  fileFolder = file.fsName.substr(0, file.fsName.lastIndexOf('.'));
  fileFolder = new Folder(fileFolder.split('.')[0]);
  fileFolder.create();

  ratio = (ratio || exportRatio(doc, 920, 650));

  // doc
  try {
     doc = app.open(file, true);
      exportOriginal(doc, ratio, fileFolder + '/original.png', firstDoc);
      firstDoc = false;

      // bg
      exportBackground(doc, fileFolder + '/bg.png', firstDoc);

      var infos = {};
      //prefs
      infos.prefs = exportPrefs(doc);
      infos.prefs.ratio = ratio;

      // graphics
      infos.backgrounds = exportBackgrounds(doc, fileFolder, firstDoc);

      // graphics
      infos.graphics = exportGraphics(doc, ratio, fileFolder, firstDoc);
      // text
      infos.texts = exportTexts(doc, ratio);
      // overlay
      infos.overlay = exportOverlays(doc, ratio, fileFolder, firstDoc);

      writeJsonFile(fileFolder.fsName + '/data.json', JSON.stringify(infos));
  } catch (e) {
    alert('Une problème empêche le document de s\'ouvrir. '+ e.message);
  }

}


function exportBackgrounds(doc, path, firstDoc) {

  // prefs d'export en 'read only'. Il faut faire un premiere export pour setter les paramètres désirés
  
  var first = firstDoc;

  var arr = [];
  var layer, layerName, fileName, element, rObj, name;
  var count = doc.layers.count();

  for (var i = 0; i < count; i++) {
    layer = doc.layers[i];
    doc.layers.everyItem().visible = false;
    if(layer.name.indexOf('fond') >= 0) {
      layerName = layer.name;
      layer.visible = true;
      doc.save();

      name = 'background' + i;

      element = {
        id: name
      };

      fileName = name +'.png';
      element.color = layerName.split('/')[1];
      element.src = fileName;

      //$.writeln('exportBackgrounds rObj.color : ', rObj.color);

      doc.exportFile(ExportFormat.PNG_FORMAT, new File(path + '/' + fileName), first);
      first = false;
      arr.push(element);
    }
  }

  return arr;

}

function exportOverlays(doc, ratio, path, firstDoc) {

  var arr = [];
  doc.layers.everyItem().visible = false;
  var photoLayer = doc.layers.itemByName('_photos');

  if (photoLayer.isValid) {
    photoLayer.visible = true;
    var rObj, bounds, element, imageBounds;
    for (var i = 0; i < photoLayer.rectangles.length; i++) {
      element = {
        id: 'photo' + i,
        original: {},
        user: {}
      };
      rObj = element.original;

      bounds = photoLayer.rectangles[i].geometricBounds;

      rObj.bounds = getHtmlBounds(bounds, ratio);
      rObj.imageBounds = undefined;
      rObj.verticalScale = undefined;
      rObj.horizontalScale = undefined;
      rObj.src = undefined;

      var image = photoLayer.rectangles[i].images[0];
      if (image !== undefined) {
        imageBounds = image.geometricBounds;
        rObj.imageBounds = getHtmlBounds(imageBounds, ratio);

        rObj.verticalScale = image.verticalScale;
        rObj.horizontalScale = image.horizontalScale;

        var file = new File(image.itemLink.filePath);
        var ext = file.displayName.split('.').pop();
        var fileName = 'overlay-' + i + '.' + ext;
        if (file.exists) {
          
          file.copy(path+'/'+fileName);
          rObj.src = fileName;
        }
    
        //$.writeln('file : ', path+'/'+fileName);
        //$.writeln('rObj.src : ', rObj.src);

      }

      //$.writeln('photoLayer file.exists  : ', file.exists);

      //var pWeb = photoLayer.rectangles[i].images[0].exportForWeb(new File(path+i+'.jpg'));
      //photoLayer.rectangles[i].images[0].exportFile(ExportFormat.PNG_FORMAT , new File(path+i+'.png'), true);
      //$.writeln('photoLayer.rectangles pWeb  : ', pWeb);

      arr.push(element);
    }

  } else {
    return false;
  }
  return arr;
}

function exportGraphics(doc, ratio, path, firstDoc) {

  var folderName = 'icons';
  var fileFolder = new Folder(path+'/'+folderName);
  fileFolder.create();

  var arr = [];
  doc.layers.everyItem().visible = false;

  var graphicsLayer = doc.layers.itemByName('_graphics');

  if (graphicsLayer.isValid) {
    graphicsLayer.visible = true;
    var rObj, element, group, bounds, htmlBounds, newDoc, name, fileName, fullFileName, layerFolder;

    var firstBloc = firstDoc;

    for (var i = 0; i < graphicsLayer.groups.count(); i++) {

      name = 'graphic' + i;
      layerFolder = new Folder(path+'/'+folderName+'/'+name);
      layerFolder.create();

      element = {
        id: name,
        original: {},
        user: {}
      };
      rObj = element.original;
      group = graphicsLayer.groups[i];
      bounds = group.visibleBounds;
      htmlBounds = getHtmlBounds(bounds, ratio);
      element.bounds = htmlBounds;
      element.list = [];

      if(group.isValid) {
        // start : export du graphic par defaut
        //$.writeln('group : ', group);
        group.select(SelectionOptions.REPLACE_WITH);
        app.copy();
        newDoc = app.documents.add({
          documentPreferences: {
            pageWidth: Math.ceil(bounds[3] - bounds[1]),
            pageHeight: Math.ceil(bounds[2] - bounds[0]),
            marginPreferences: { bottom: 0, top: 0, left: 0, right: 0 }
          }
        });
        app.paste();
        fileName = 'default.png';
        fullFileName = path + '/' + folderName + '/' +  name + '/' + fileName;
        //$.writeln('fullFileName : ', fullFileName);
        newDoc.exportFile(ExportFormat.PNG_FORMAT, new File(fullFileName), true);
        newDoc.close(SaveOptions.NO);
        rObj.src = fileName;
        element.list.push(fileName);
        // end : export du graphic par defaut
        arr.push(element);
        firstBloc = false;
      }
     
    }

  } else {
    return false;
  }
  return arr;
}

function exportTexts(doc, ratio) {
  var arr = [];
  doc.layers.everyItem().visible = false;
  var textLayer = doc.layers.itemByName('_textes');
  if (textLayer.isValid) {
    textLayer.visible = true;
    //$.writeln('textLayer.textFrames.length : ', textLayer.textFrames.length);

    var txtFrame, rObj, bounds, element;
    for (var i = 0; i < textLayer.textFrames.length; i++) {
      txtFrame = textLayer.textFrames[i];
      element = {
        id: 'txt' + i,
        original: {},
        user: {}
      };

      rObj = element.original;
      rObj.text = escape(txtFrame.contents);

      bounds = txtFrame.geometricBounds;
      rObj.bounds = getHtmlBounds(bounds, ratio);

      rObj.multiline = Boolean(txtFrame.lines.count() > 1);

      // rObj.bounds = {
      //   x: bounds[1] * ratio,
      //   y: (bounds[0] * ratio) - (txtFrame.texts[0].ascent * ratio),
      //   width: (bounds[3] - bounds[1]) * ratio,
      //   height: (bounds[2] - bounds[0]) * ratio + (txtFrame.texts[0].ascent * ratio) + (txtFrame.texts[0].descent * ratio)
      // };

      // $.writeln('txtFrame fontStyle: ', txtFrame.textStyleRanges[0].fontStyle);
      // $.writeln('txtFrame appliedFont.fontFamily: ', txtFrame.texts[0].appliedFont.fontFamily);
      // $.writeln(': ', txtFrame.texts[0].appliedFont.fontStyleName);
      // $.writeln('txtFrame appliedFont.fontStyleNameNative: ', txtFrame.texts[0].appliedFont.fontStyleNameNative);
      // $.writeln('txtFrame appliedFont.fsName: ', txtFrame.texts[0].appliedFont.fsName);
      // $.writeln('txtFrame appliedFont.fullNameNative: ', txtFrame.texts[0].appliedFont.fullNameNative);
      // $.writeln('txtFrame pointSize: ', txtFrame.texts[0].pointSize);
      // $.writeln('txtFrame characterAlignment: ', txtFrame.texts[0].characterAlignment);
      //$.writeln('txtFrame characterAlignment: ', txtFrame.texts[0].justification);
      //$.writeln('1P txtFrame fillColor: ', txtFrame.texts[0].fillColor.colorValue);
      //$.writeln('1P txtFrame color space : ', txtFrame.texts[0].fillColor.space);
      
      var color = txtFrame.texts[0].fillColor;
      var hex = '#000000';
      if(!color) {
          alert("L'element dont le texte \""+rObj.text+"\" est n'a pas de couleur.");
      } else {
           if(color.space == ColorSpace.CMYK) {
            hex = cmykToHex.apply(this, color.colorValue);
            //$.writeln('ColorSpace.CMYK : '+ rObj.text+' = '+hex);
          } else if(color.space == ColorSpace.RGB) {
            hex = rgbToHex.apply(this, color.colorValue);
           //$.writeln('ColorSpace.RGB : '+ rObj.text+' = '+hex);
          } else {
            alert("Le colorspace n'est ni en RVB ni en CMYK, le texte sera noir.");
          }
      }

      /**/
      try {
       rObj.fontFile = txtFrame.texts[0].appliedFont.location.split('/').pop();
      } catch(e) {
       // alert('Une erreur est survenue concernant les elements textes \n\r', e.message, ' \n\r en ligne : ', e.line);
      }
      /**/
      
      try {
        rObj.fontFamily = txtFrame.texts[0].appliedFont.platformName;
      } catch(e) {
        $.writeln('platformName NOT FOUND for fontFamily: ', txtFrame.texts[0].appliedFont.fontFamily);
        rObj.fontFamily = txtFrame.texts[0].appliedFont.fontFamily;
      }
  
      try {
        rObj.fontStyleName = txtFrame.texts[0].appliedFont.fontStyleName;
      } catch(e) {
        $.writeln('FONT STYLE NOT FOUND for fontFamily: ', txtFrame.texts[0].appliedFont.fontFamily);
        rObj.fontStyleName = "Regular";
      }

      var fw = rObj.fontStyleName.toLowerCase();
      switch(fw) {
        case 'normal':
        case 'bold':
          break;
        case 'regular':
        case 'medium':
          fw = 'normal';
          break;
        default:
          fw = 'normal';
          break;
      }
      rObj.fontWeight = fw;
      
      rObj.pointSize = txtFrame.texts[0].pointSize * ratio;
      rObj.verticalAlign = exportAlign(txtFrame.texts[0].characterAlignment);
      rObj.horizontalAlign = exportJustification(txtFrame.texts[0].justification);
      rObj.color = hex;
      arr.push(element);
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

function exportOriginal(doc, ratio, fullName, firstDoc) {
  doc.layers.everyItem().visible = true;
  if (!doc.saved) {
    doc.save();
  }
  if(firstDoc) {
    alert('Preciser la resolution suivante [ ' + Math.round(ratio * 72) + ' ] dans la fenêtre d\'option d\'export');
  }
  doc.exportFile(ExportFormat.PNG_FORMAT, new File(fullName), firstDoc);
}

function exportBackground(doc, fullName, firstDoc) {
  // prefs d'export en 'read only'. Il faut faire un premiere export pour setter les paramètres désirés
  doc.layers.everyItem().visible = false;
  var bgLayer = doc.layers.itemByName('_fond');
  if (bgLayer.isValid) {
    bgLayer.visible = true;
  } 

  if (!doc.saved) {
    doc.save();
  }
  doc.exportFile(ExportFormat.PNG_FORMAT, new File(fullName), firstDoc);

}

function exportRatio(doc, destW, destH) {
/** /
  var origW = doc.pages[0].bounds[3];
  var origH = doc.pages[0].bounds[2];
  var destRatio = destW / destH;
  var origRatio = origW / origH;
  var scaleRatio = (origRatio < destRatio) ? (destH / origH) : (destW / origW);
/**/
  return 1;
}

function exportPrefs(doc) {
  var obj = {};
  obj.xUnitsIsPixel = (doc.viewPreferences.horizontalMeasurementUnits == MeasurementUnits.PIXELS);
  obj.yUnitsIsPixel = (doc.viewPreferences.verticalMeasurementUnits == MeasurementUnits.PIXELS);
  if (!obj.xUnitsIsPixel || !obj.yUnitsIsPixel) {
    alert('Fermer tous les documents ouverts dans Indesign et changer les prefs "Units and roulers" pour PIXELS. Ainsi ce seront les prefs par defaut');
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

function getHtmlBounds(bounds, ratio) {
  return {
        x: bounds[1] * ratio,
        y: (bounds[0] * ratio),
        width: (bounds[3] - bounds[1]) * ratio,
        height: (bounds[2] - bounds[0]) * ratio
      };
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function cmykToHex(c,m,y,k) {
  //$.writeln('c,m,y,k : ', c, ' / ', m, ' / ', y, ' / ', k );

  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  function padZero(str) {
    return "000000".substr(str.length)+str;
  }
  var cyan = (c * 255 * (1-k)) << 16;
  var magenta = (m * 255 * (1-k)) << 8;
  var yellow = (y * 255 * (1-k)) >> 0;
  var black = 255 * (1-k);
  var white = black | black << 8 | black << 16;
  var color = white - (cyan | magenta | yellow );
  return ("#"+padZero(color.toString(16)));
}
