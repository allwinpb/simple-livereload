var chokidar = require('chokidar');
var pathParser = require('path')
var fs = require('fs')
var htmlparser2 = require('htmlparser2')

var dependencyMap = {}
var currFile = ""

var watcher = chokidar.watch('./sandbox', {ignored: /[\/\\]\./, persistent: true});

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
		if(name === "script" && (attribs.src != "" || attribs.src != "#")){
			addDependency(attribs.src, currFile)
		}else if(name === "link" && (attribs.rel != "" || attribs.rel != "#")){
			addDependency(attribs.rel, currFile)
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
	htmlParser.write(fs.readFileSync(path))
}

function addDependency(source, dependency){
	if(key in dependencyMap){
		dependencyMap[key][value] = true
	}else{
		dependencyMap[key] = {}
	}
}