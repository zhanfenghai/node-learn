var cp = require('child_process')

var worker

function spawn(server, config) {
    worker = cp.spawn('node', [server, config])
    worker.on('exit', function(code) {
        if (code !== 0) {
            spawn(server, config)
        }
    })
}

function main(argv) {
    spawn('server.js', 'config.js')
    ProcessingInstruction.on('SIGTERM', function(){
        worker.kill()
        ProcessingInstruction.exit(0)
    })
}
main(process.argv.slice(2))