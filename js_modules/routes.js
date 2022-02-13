module.exports = function routes() {
    const checkDims = require('../e.js')
    const express = require('express')
    const path = require('path')
    const app = express()
    const port = 8080

    app.use(express.static(path.join(__dirname, 'public')))
    app.get('/image-gen', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'))
    })
    app.post('/image-gen', function (req, res) {
        checkDims()
        res.send('function started')
    })
    app.listen(port, () => {
        checkDims()
        console.log(`http://localhost:${port}/image-gen`)
    })
}