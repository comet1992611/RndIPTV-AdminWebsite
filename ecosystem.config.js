module.exports = {
    apps: [
        {
            name: 'server',
            script: './server.js',
            instances: 4,
            wait_ready: true,
            listen_timeout: 60000,        
        }
    ]
}