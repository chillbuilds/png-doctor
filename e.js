const fs = require('fs')
const jimp = require('jimp')
const png = require('png-js')
const imgDir = './test-2.png'
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
    pixelCheck(imgMatrix)
}

const pixelCheck = (imgMatrix) => {
    fs.writeFileSync('./imgMatrix.txt', JSON.stringify(imgMatrix))
    let maybePile = []
    for(var i = 1; i < imgDims.height-1; i++) {
        for(var j = 1; j < imgDims.width-1; j++) {
            if(imgMatrix[i][j].a != 0){
                // look to the left right top and bottom for alpha val of 0
                let clearCount = 0
                if(imgMatrix[i][j-1].a == 0){
                    clearCount++
                }
                if(imgMatrix[i][j+1].a == 0){
                    clearCount++
                }
                if(imgMatrix[i-1][j].a == 0){
                    clearCount++
                }
                if(imgMatrix[i+1][j].a == 0){
                    clearCount++
                }
                if(clearCount >= 1){
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
        })
}

checkDims()

const convertBuffer = (imgMatrix, maybePile) => {
    let bufferArr = []
    for (var i = 0; i < imgDims.height; i++) {
      for (var j = 0; j < imgDims.width; j++) {
          bufferArr.push(imgMatrix[i][j].r)
          bufferArr.push(imgMatrix[i][j].g)
          bufferArr.push(imgMatrix[i][j].b)
        //   bufferArr.push(imgMatrix[i][j].a)
        bufferArr.push(255)
      }
    }
    const buffer = Buffer.from(bufferArr)
    var image = new jimp({ data: buffer, width: imgDims.width, height: imgDims.height }, function (err, image) {
    })

    image.write('image.png')
}