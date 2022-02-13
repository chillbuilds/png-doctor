// server stuff
const express = require('express')
const path = require('path')
const app = express()
const port = 8080

// image manipulation stuff
const fs = require('fs')
const jimp = require('jimp')
const png = require('png-js')
const imgDir = './test-images/search.png'
let date = new Date
let imgDims;
let pixelArrBuff;
let pixelArr = []

const bufferPull = () => {
    try{
        png.decode(imgDir, function(pixels) {
            pixelArrBuff = Buffer.from(pixels)
            bufferParse()
        })
    }
    catch(err){
        fs.appendFileSync('./error-log.txt', date.toString()+'\n'+err+'\n\n')
        console.log(err)
    }
}

const bufferParse = () => {
    let pixel = 0
    for(var i = 0; i < pixelArrBuff.length; i=i+4) {
        pixel++
        x = Math.floor(pixel % imgDims.width)
        y = Math.floor(pixel / imgDims.width)
        pixelArr.push({pixel: pixel, x: x, y: y, r: pixelArrBuff[i], g: pixelArrBuff[i+1], b: pixelArrBuff[i+2], a: pixelArrBuff[i+3]})
    }
    let imgMatrix = []
    for(var i = 0; i < pixelArr.length; i=i+imgDims.width) {
        let lineArr = []
        for(var j = 0; j < imgDims.width; j++) {
            lineArr.push(pixelArr[i+j])
        }
        imgMatrix.push(lineArr)
    }
    pixelCheck(imgMatrix)
}

const pixelCheck = (imgMatrix) => {
    let maybePile = []
    for(var i = 1; i < imgDims.height-1; i++) {
        for(var j = 1; j < imgDims.width-1; j++) {
            if(imgMatrix[i][j].a != 0){
                // look to the left right top and bottom for alpha val of 0
                if(imgMatrix[i][j-1].a == 0 ||
                   imgMatrix[i][j+1].a == 0 ||
                   imgMatrix[i-1][j].a == 0 ||
                   imgMatrix[i+1][j].a == 0
                   ){
                    maybePile.push(imgMatrix[i][j])
                }
            }
        }
    }
    convertBuffer(imgMatrix, maybePile)
}

const checkDims = () => {
    jimp.read(imgDir)
        .then(image => {
            imgDims = {width: image.bitmap.width, height: image.bitmap.height}
            bufferPull()
        }).catch(err => {
            fs.appendFileSync('./error-log.txt', date.toString()+'\n'+err+'\n\n')
            console.log(err)
        })
}

const convertBuffer = (imgMatrix, maybePile) => {
    let bufferArr = []
    for (var y = 0; y < imgDims.height; y++) {
      for (var x = 0; x < imgDims.width; x++) {
          bufferArr.push(imgMatrix[y][x].r)
          bufferArr.push(imgMatrix[y][x].g)
          bufferArr.push(imgMatrix[y][x].b)
        //   bufferArr.push(imgMatrix[y][x].a)
        bufferArr.push(255)
      }
    }
    const buffer = Buffer.from(bufferArr)
    var image = new jimp({ data: buffer, width: imgDims.width, height: imgDims.height }, function (err, image) {
    })

    image.write('./public/assets/images/image.png')
    serverSetup(maybePile)
}

checkDims()

const serverSetup = (maybePile) => {
    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/image-gen', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/index.html'))
    })

    app.post('/test', function (req, res) {
        res.json(JSON.stringify({width: imgDims.width, height: imgDims.height, maybePile: maybePile}))
    })

    app.listen(port, () => {
        console.log(`http://localhost:${port}/image-gen`)
    })
}