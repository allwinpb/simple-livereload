var watcher = require('./lib/watcher')
var server = require('./lib/server')

var dir = process.cwd() + "/sandbox";
watcher.init(dir)
server.init(dir)
watcher.setCallback(server.notify)
watcher.start()
server.start()