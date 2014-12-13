var watcher = require('./lib/watcher')
var server = require('./lib/server')

var dir = "sandbox";
watcher.init(dir)
server.init(dir)

watcher.start()
server.start()