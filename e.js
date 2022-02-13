// server stuff
const express = require('express')
const path = require('path')
const app = express()
const port = 8080

// image manipulation stuff
const fs = require('fs')
const jimp = require('jimp')
const png = require('png-js')
const imgDir = './test-images/paula.png'
let date = new Date
let imgDims;
let pixelArrBuff;
let pixelArr = []

const bufferPull = () => {
    // store png rgba pixel value in global buffer
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
    // build pixel object from parsed pixel buffer
    for(var i = 0; i < pixelArrBuff.length; i=i+4) {
        pixel++
        x = Math.floor(pixel % imgDims.width)
        y = Math.floor(pixel / imgDims.width)
        pixelArr.push({pixel: pixel, x: x, y: y, r: pixelArrBuff[i], g: pixelArrBuff[i+1], b: pixelArrBuff[i+2], a: pixelArrBuff[i+3]})
    }
    let imgMatrix = []
    // builds array of pixel objects for 2d mapping
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
                   ){maybePile.push(imgMatrix[i][j])
                }
            }
        }
    }
    convertBuffer(imgMatrix, maybePile)
}

const checkDims = () => {
    // store image dimensions in global object
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
    // converts pixel data to buffer arrto save image
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
    checkMaybes(maybePile, 40)
}

const checkMaybes = (maybePile, res) => {
    console.log(maybePile.length)
    var noPile = []
    var newMaybePile = []
    // separates outer edge maybes from inner maybes for exclusion box scan
    for(var i = 0; i < maybePile.length; i++) {
        if(maybePile[i].x < res/2 || maybePile[i].x > imgDims.width-res/2 || maybePile[i].y < res/2 || maybePile[i].y > imgDims.height-res/2){
            noPile.push(maybePile[i])
        }else{newMaybePile.push(maybePile[i])}
    }
    console.log('new maybePile length: ' + newMaybePile.length)
    console.log('noPile length: ' + noPile.length)
    serverSetup(newMaybePile, noPile)
}

const exclusionScan = () => {

}

const serverSetup = (maybePile, noPile) => {
    app.use(express.static(path.join(__dirname, 'public')))

    app.get('/image-gen', (req, res) => {
        res.sendFile(path.join(__dirname, '/public/index.html'))
    })
    // sends image data to front end on button press
    app.post('/test', function (req, res) {
        res.json(JSON.stringify({width: imgDims.width, height: imgDims.height, maybePile: maybePile, noPile: noPile}))
    })

    app.listen(port, () => {
        console.log(`http://localhost:${port}/image-gen`)
    })
}

checkDims()