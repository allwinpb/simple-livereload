// Original Static Server Code from
// https://gist.github.com/rpflorence/701407
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    cheerio = require("cheerio")

var AJAX_TIMEOUT = 30; //seconds
var fileServer;
var livePages = {};
var port = process.argv[2] || 8888;

function insertPage(page, response){
    if(!(page in livePages)){
        livePages[page] = response;
    }else{
        livePages[page].writeHead(408)
        livePages[page].end()
        livePages[page] = response;
    }
}

function clearPage(page, expired){
    if(page in livePages){
        if(expired){
            livePages[page].writeHead(408)
        }else{
            console.log('Page Reloaded: ', page);
            livePages[page].writeHead(200)
        }
        livePages[page].end()
        delete livePages[page];
    }
}

function notify(page){
    clearPage(page)
}

function init(dir) {
    var clientJs = fs.readFileSync("lib/client.js")
    fileServer = http.createServer(function(request, response) {
        //Intercept Longpoll request and respond accordingly
        if(url.parse(request.url).pathname == "/onchange" && request.headers['x-requested-with'] == "XMLHttpRequest"){
            var page = url.parse(request.url, true).query.location
            insertPage(page, response);
            setTimeout(function(){
                clearPage(page, true);
            }, AJAX_TIMEOUT*1000);
            return;
        }
        //Static Server
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
            if (fs.statSync(filename).isDirectory()) filename += "/index.html";
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
                if(path.extname(filename) === ".html"){
                    var modhtml = cheerio.load(file)
                    var parentSelector = null
                    if(modhtml("html head").length != 0){
                        parentSelector = "html head"
                    }else if(modhtml("html body").length != 0){
                        parentSelector = "html body"
                    }
                    //Do not modify if no <head> or <body>
                    if(parentSelector){
                        modhtml(parentSelector).append(
                            "<script type='text/javascript'>"+clientJs+"</script>")
                    }
                    response.write(modhtml.html())
                }else{
                    response.write(file);
                }
                response.end();
            });
        });
    });
}


function start() {
    fileServer.listen(parseInt(port, 10));
}

module.exports.init = init;
module.exports.start = start;
module.exports.notify = notify;