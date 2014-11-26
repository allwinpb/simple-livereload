var chokidar = require('chokidar');
var pathParser = require('path')
var fs = require('fs')
var htmlparser2 = require('htmlparser2')

var dependencyMap = {}
var currFile = ""
var currFilePath = ""

var rootDir = "./sandbox"
var watcher = chokidar.watch(rootDir, {ignored: /[\/\\]\./, persistent: true});

watcher
  .on('add', onUpdateFile)
  .on('addDir', function(path) {console.log('Directory', path, 'has been added');})
  .on('change', onUpdateFile)
  .on('unlink', function(path) {console.log('File', path, 'has been removed');})
  .on('unlinkDir', function(path) {console.log('Directory', path, 'has been removed');})
  .on('error', function(error) {console.error('Error happened', error);})
  .on('ready', function() {console.info('Initial scan complete. Ready for changes.')})

var htmlParser = new htmlparser2.Parser({
	onopentag: function(name, attribs){
		if(name === "script" && isValid(attribs.src)){
			addDependency(attribs.src, currFile)
		}else if(name === "link" && isValid(attribs.href)){
			addDependency(attribs.href, currFile)
		}
	}
});

function onUpdateFile(path, stats){
	var filename = pathParser.basename(path);
	var filename_ext = filename.split('.').pop().toLowerCase()

	if(filename_ext == "html" || filename_ext == "htm"){
		updateDepMap(path, filename)
	}
	//TODO: Initiate refresh of affected HTML files
}

function updateDepMap(path, filename){
	currFile = filename
	currFilePath = path
	htmlParser.write(fs.readFileSync(path))
}

function addDependency(source, dependency){
	source = normalizePath(source)
	if(source in dependencyMap){
		dependencyMap[source][value] = true
	}else{
		dependencyMap[source] = {}
	}
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
		return pathParser.join(currFilePath, path)
	}
}

function isValid(src){
	return !isEqualsAny(src, [undefined, "", "#"])
}

function isEqualsAny(input, args_array){
	var output = false
	for(var i=0; i < args_array.length; i++){
		output = output || (input === args_array[i])
		if(output){
			break;
		}
	}
	return output
}