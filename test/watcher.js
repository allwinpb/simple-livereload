var cheerio = require('cheerio');
var fs = require('fs')

//Enable should syntax for JS
require('chai').should();

var watcher = require('../lib/watcher');

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
            fs.mkdirSync('test-sandbox')
            fs.mkdirSync('test-sandbox/subdir')
            fs.writeFileSync('test-sandbox/root.html',rootHTML)
            fs.writeFileSync('test-sandbox/subdir/subdir.html',subdirHTML)
            watcher.init("test-sandbox")
            watcher.start()
        })
        //Test cases
        it("should ignore empty script tags", function(){
            watcher.getDepMap().should.not.have.property(undefined)
        })
        it("should ignore scripts with src=''", function(){
            watcher.getDepMap().should.not.have.property('')
        })
        it("should ignore scripts with src=#", function(){
            watcher.getDepMap().should.not.have.property('#')
        })
        it("should ignore script src starting with //..", function(){
            watcher.getDepMap().should.not.have.property('test-sandbox/ignored1.js')
            watcher.getDepMap().should.not.have.property('ignored1.js')
            watcher.getDepMap().should.not.have.property('//ignored1.js')
        })
        it("should ignore script src with different origin", function(){
            watcher.getDepMap().should.not.have.property('test-sandbox/ignored2.js')
            watcher.getDepMap().should.not.have.property('ignored2.js')
            watcher.getDepMap().should.not.have.property('https://igno.re/ignored2.js')
        })
        it("should capture scripts in the same directory", function(){
            watcher.getDepMap().should.have.property('test-sandbox/samedir_script.js')
            watcher.getDepMap().should.not.have.property('samedir_script.js')
            watcher.getDepMap().should.have.property('test-sandbox/samedir_script2.js')
            watcher.getDepMap().should.not.have.property('samedir_script2.js')
        })
        it("should capture scripts in a subdirectory", function(){
            watcher.getDepMap().should.have.property('test-sandbox/subdir/subdir_script.js')
            watcher.getDepMap().should.not.have.property('subdir/subdir_script.js')
        })
        after(function(){
            //Cleanup
            watcher.stop();
            fs.unlinkSync('./test-sandbox/root.html')
            fs.unlinkSync('./test-sandbox/subdir/subdir.html')
            fs.rmdirSync('./test-sandbox/subdir')
            fs.rmdirSync('./test-sandbox')
        })
    })
});