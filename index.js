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
        port = config.port || '6868';

    http.createServer(function(req, res) {
        var urlInfo = parseUrl(root, req.url)

        combineFiles(urlInfo.pathnames, function (err, data) {
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

function combineFiles(pathnames, cb) {
    var output = []

    (function next(i, len) {
        if (i<len) {
            fs.readFile(pathnames[i], function(err, data) {
                if (err) {
                    cb(err)
                } else {
                    output.push(data)
                    next(i+1, leg)
                }
            })
        } else {
            cb(null, Buffer.concat(output))
        }
    }(0, pathnames.length))
}



