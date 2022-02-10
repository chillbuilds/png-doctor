const fs = require('fs')
const jimp = require('jimp')
const png = require('png-js')
const imgDir = './test-2.png'
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
        fs.appendFileSync('./error-log.txt', err+'\n\n')
    }
}

const bufferParse = () => {
    let pixel = 0
    for(var i = 0; i < pixelArrBuff.length; i=i+4) {
        pixel++
        pixelArr.push({pixel: pixel, r: pixelArrBuff[i], g: pixelArrBuff[i+1], b: pixelArrBuff[i+2], a: pixelArrBuff[i+3]})
    }
    let imgMatrix = []
    for(var i = 0; i < pixelArr.length; i=i+imgDims.width) {
        let lineArr = []
        for(var j = 0; j < imgDims.width; j++) {
            lineArr.push(pixelArr[i+j])
        }
        imgMatrix.push(lineArr)
    }
    pixelCheck()
}

const pixelCheck = () => {
    
}

const checkDims = () => {
    jimp.read(imgDir)
        .then(image => {
            imgDims = {width: image.bitmap.width, height: image.bitmap.height}
            bufferPull()
        }).catch(err => {
            fs.appendFileSync('./error-log.txt', err+'\n\n')
        })
}

checkDims()