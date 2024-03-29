var chokidar = require('chokidar');
var pathParser = require('path')
var fs = require('fs')
var htmlparser2 = require('htmlparser2')

var dependencyMap = {}
var currFile = ""
var currFileDir = ""

var rootDir;
var watcher;
var htmlParser;
var callback = null;

function notify(path){
    var filesToUpdate = [path];
    if(path in dependencyMap){
        for (var dependency in dependencyMap[path]) {
            if (dependencyMap[path].hasOwnProperty(dependency) && callback) {
                //Remove the root prefix from the path before sending to server
                filesToUpdate.push(dependency);
                break;
            }
        }
    }
    for(var i=0; i<filesToUpdate.length; i++){
        console.log("Waiting to reload ", filesToUpdate[i]);
        callback(filesToUpdate[i].replace(rootDir, ''));
    }
}

function onUpdateFile(path){
    var filename = pathParser.basename(path);
    var filename_ext = filename.split('.').pop().toLowerCase()

    if(filename_ext == "html" || filename_ext == "htm"){
        updateDepMap(path)
    }

    notify(path)
}

function updateDepMap(path){
    currFile = pathParser.basename(path);
    currFileDir = pathParser.dirname(path)
    htmlParser.write(fs.readFileSync(path))
}

function addDependency(source, dependency){
    source = normalizePath(source)
    if(source == null){
        return null
    }
    if(!(source in dependencyMap)){
        dependencyMap[source] = {}
    }
    dependencyMap[source][dependency] = true
}

function normalizePath(path){
    if(path.indexOf("http") == 0 || path.indexOf("//") == 0){
        //Absolute path, ignore for now
        return null
    }else if(path.indexOf("/") == 0){
        //Relative to the root directory
        return pathParser.join(rootDir, path)
    }else{
        //Relative to the containing HTML file
        return pathParser.join(currFileDir, path)
        //TODO: Dynamically add out-of-dir file references to watch list
    }
}

function getDepMap(){
    return dependencyMap
}

function setCallback(newCallback){
    callback = newCallback;
}

function init(dir){
    dependencyMap = {}
    currFile = ""
    currFileDir = ""
    rootDir = dir
    htmlParser = new htmlparser2.Parser({
        onopentag: function(name, attribs){
            var invalidSrc = [undefined, "#", ""]
            var source;
            if(name === "script" && invalidSrc.indexOf(attribs.src) < 0){
                source = attribs.src
            }else if(name === "link" && invalidSrc.indexOf(attribs.href) < 0){
                source = attribs.href
            }
            if(source){
                addDependency(source, pathParser.join(currFileDir, currFile))
            }
        }
    });
}

function start(){
    // ignored: /[\/\\]\./,
    watcher = chokidar.watch(rootDir, {ignored: /[\/\\]\./, persistent: true});
    watcher
    .on('add', onUpdateFile)
    .on('change', onUpdateFile)
    .on('unlink', function(path) {console.log('File', path, 'has been removed');})
    .on('unlinkDir', function(path) {console.log('Directory', path, 'has been removed');})
    .on('error', function(error) {console.error('Error happened', error);})
    .on('ready', function() {
            // console.log(dependencyMap)
        });
}

function stop(){
    if(watcher){
        watcher.close();
    }
}

function reset(dir){
    stop();
    init(dir);
    start();
}

//Expose all functions for TDD
module.exports.onUpdateFile = onUpdateFile
module.exports.updateDepMap = updateDepMap
module.exports.addDependency = addDependency
module.exports.normalizePath = normalizePath
module.exports.getDepMap = getDepMap
module.exports.setCallback = setCallback
module.exports.init = init
module.exports.start = start
module.exports.stop = stop
module.exports.reset = reset