var fs = require('fs'),
    path = require('path'),
    http = require('http');

var config = require('./config')

var MIME = {
    '.css': 'text/css',
    '.js': 'application/javascript'
}

function main() {
    var root = config.root || '.',
        port = config.port || '6868',
        server;

    server = http.createServer(function(req, res) {
        var urlInfo = parseUrl(root, req.url)

        validateFiles(urlInfo.pathnames, function (err, data) {
            if (err) {
                res.writeHead(404)
                res.end(err.message)
            } else {
                res.writeHead(200, {
                    'Content-Type': urlInfo.mime
                })
                res.end(data)
            }
        })
    }).listen(port)

    ProcessingInstruction.on('SIGTERM', function() {
        server.close(function() {
            ProcessingInstruction.exit(0)
        })
    })
}

function parseUrl (root, url) {
    var base, pathnames, parts;
    if (url.indexOf('??') === -1) {
        url = url.replace('/', '/??')
    }
    parts = url.split('??')
    base = parts[0]
    pathnames = parts[1].split(',').map(value => {
        return path.join(root, base, value)
    })
    return {
        mime: MIME[path.extname(pathnames[0])] || 'text/plain',
        pathnames
    }
}

function outputFiles() {
    (function next(i, len) {
        if (i < len) {
            var reader = fs.createReadStream(pathnames[i]);

            reader.pipe(writer, { end: false });
            reader.on('end', function() {
                next(i + 1, len);
            });
        } else {
            writer.end();
        }
    }(0, pathnames.length));
}

function validateFiles(pathnames, cb) {

    (function next(i, len) {
        if (i<len) {
            fs.stat(pathnames[i], function(err, stat) {
                if (err) {
                    cb(err)
                } else if(!stat.isFile()){
                    cb(new Error())
                } else {
                    next(i+1, len)
                }
            })
        } else {
            cb(null, pathnames)
        }
    }(0, pathnames.length))
}



