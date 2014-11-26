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

// 'add', 'addDir' and 'change' events also receive stat() results as second argument.
// http://nodejs.org/api/fs.html#fs_class_fs_stats
// watcher.on('change', function(path, stats) {
//   console.log('File', path, 'changed size to', stats.size);
// });

var htmlParser = new htmlparser2.Parser({
	onopentag: function(name, attribs){
		if(name === "script" && (attribs.src != "" || attribs.src != "#")){
			dependencyMap[attribs.src] = currFile
			console.log(dependencyMap)
		}
	}
});

function onUpdateFile(path, stats){
	var filename = pathParser.basename(path);
	var filename_ext = filename.split('.').pop().toLowerCase()

	if(filename_ext == "html" || filename_ext == "htm"){
		updateDepMap(path, filename)
	}
}

function updateDepMap(path, filename){
	currFile = filename
	htmlParser.write(fs.readFileSync(path))
}