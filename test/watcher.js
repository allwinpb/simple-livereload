var cheerio = require('cheerio');
var fs = require('fs')

//Enable should syntax for JS
require('chai').should();

//Module being tested
var module = require('../lib/watcher');

describe("Watcher", function(){
    describe("#updateDepMap", function(){
        var filename = "./.tmp.html"
        before(function(){
            //Creating test case html
            var $ = cheerio.load('<html></html>')
            $('html').append('<head></head>')
            $('html').append('<body></body>')
            $('head')
                .append('<script></script>')
                .append('<script src=""></script>')
                .append('<script src="#"></script>')
                .append('<script src="/root.js"></script>')
                .append('<script src="//ignored1.js"></script>')
                .append('<script src="https://igno.re/ignored2.js"></script>')
                .append('<script src="./samedir_script.js"></script>')
                .append('<script src="samedir_script2.js"></script>')
                .append('<script src="subdir/subdir_script.js"></script>')
            var rootHTML = $.html()
            $('head')
                .append('<script src="../parentdir_script.js"></script>')
            var subdirHTML = $.html()
            //Creating necessary files and folders
            fs.mkdir('./subdir')
            fs.writeFileSync('./root.html',rootHTML)
            fs.writeFileSync('./subdir/subdir.html',subdirHTML)
            module.init("./")
        })
        //Test cases
        it("this test case will always pass", function(){

        })
        after(function(){
            //Cleanup
            fs.unlinkSync('./root.html')
            fs.unlinkSync('./subdir/subdir.html')
            fs.rmdirSync('./subdir')
        })
    })
});