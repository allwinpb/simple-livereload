// Original Static Server Code from
// https://gist.github.com/rpflorence/701407
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    cheerio = require('cheerio')

var fileServer, scriptServer;
var port = process.argv[2] || 8888;

function init(dir) {
    fileServer = http.createServer(function(request, response) {
        var uri = url.parse(request.url).pathname,
            filename = path.join(dir, uri);
        fs.exists(filename, function(exists) {
            if (!exists) {
                response.writeHead(404, {
                    "Content-Type": "text/plain"
                });
                response.write("404 Not Found\n");
                response.end();
                return;
            }
            if (fs.statSync(filename).isDirectory()) filename += '/index.html';
            fs.readFile(filename, function(err, file) {
                if (err) {
                    response.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    response.write(err + "\n");
                    response.end();
                    return;
                }
                //File exists
                response.writeHead(200, {
                    "Cache-Control":"no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                });
                if(path.extname(filename) === '.html'){
                    var modhtml = cheerio.load(file)
                    var parentSelector = null
                    if(modhtml('html head').length != 0){
                        parentSelector = "html head"
                    }else if(modhtml('html body').length != 0){
                        parentSelector = "html body"
                    }
                    //Do not modify if no <head> or <body>
                    if(parentSelector){
                        modhtml(parentSelector).append(
                            '<script>alert("Modified")</script>')
                    }
                    response.write(modhtml.html())
                }else{
                    response.write(file);
                }
                response.end();
            });
        });
    });

    scriptServer = http.createServer(function(request, response){
        if(request.url == "/client"){
            response.writeHead(200)
            response.end('Script')
        }else if(request.url == "/onchange"){
            response.writeHead(200)
            response.end('Longpoll')
        }else{
            response.writeHead(404)
            response.end('404 Not Found')
        }
    });
}

function start() {
    fileServer.listen(parseInt(port, 10));
    scriptServer.listen(3001)
}

module.exports.init = init;
module.exports.start = start;