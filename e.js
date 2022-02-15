// server stuff
const express = require('express')
const path = require('path')
const app = express()
const port = 8080
let res = 50

// image manipulation stuff
const fs = require('fs')
const jimp = require('jimp')
const png = require('png-js')
const imgDir = './public/assets/images/image.png'
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
          bufferArr.push(imgMatrix[y][x].a)
        // bufferArr.push(255)
      }
    }
    const buffer = Buffer.from(bufferArr)
    var image = new jimp({ data: buffer, width: imgDims.width, height: imgDims.height }, function (err, image) {
    })

    image.write('./public/assets/images/image.png')
    // console.log('image saved')
    if(maybePile != false){
        checkMaybes(maybePile, res, imgMatrix, false)
        res = res - 10
        checkMaybes(maybePile, res, imgMatrix, false)
        res = res - 10
        checkMaybes(maybePile, res, imgMatrix, false)
        res = res - 10
        checkMaybes(maybePile, res, imgMatrix, true)
    }
}

const checkMaybes = (maybePile, res, imgMatrix, server) => {
    var noPile = []
    var newMaybePile = []
    // separates outer edge maybes from inner maybes for exclusion box scan
    for(var i = 0; i < maybePile.length; i++) {
        if(maybePile[i].x < res/2 || maybePile[i].x > imgDims.width-res/2 || maybePile[i].y < res/2 || maybePile[i].y > imgDims.height-res/2){
            noPile.push(maybePile[i])
        }else{newMaybePile.push(maybePile[i])}
    }
    exclusionScan(newMaybePile, noPile, res, imgMatrix)
    if(server == true){
        serverSetup(newMaybePile, noPile)
    }
}

const exclusionScan = (maybePile, noPile, res, imgMatrix) => {
    const pixelCount = imgDims.width*imgDims.height
    // build array of res x res pixels to check
    for(var i = 0; i < maybePile.length; i++) {
        // console.log(imgMatrix[maybePile[i].y][maybePile[i].x-1])
        var exclusionArr = []
        for(var j = 1; j < res/2+1; j++) {
            for(var n = 1; n < res/2+1; n++) {
                let coordYPlus = {x: (imgMatrix[maybePile[i].y][maybePile[i].x-1].x)+n, y: (imgMatrix[maybePile[i].y][maybePile[i].x-1].y)+j}
                let coordYMinus = {x: (imgMatrix[maybePile[i].y][maybePile[i].x-1].x)-n, y: (imgMatrix[maybePile[i].y][maybePile[i].x-1].y)-j}
                let coordXPlus = {x: (imgMatrix[maybePile[i].y][maybePile[i].x-1].x)+j, y: (imgMatrix[maybePile[i].y][maybePile[i].x-1].y)+n}
                let coordXMinus = {x: (imgMatrix[maybePile[i].y][maybePile[i].x-1].x)-j, y: (imgMatrix[maybePile[i].y][maybePile[i].x-1].y)-n}
                if(coordYPlus.x > 0 && coordYPlus.y > 0){
                    exclusionArr.push(coordYPlus)}
                if(coordYMinus.x > 0 && coordYMinus.y > 0){
                exclusionArr.push(coordYMinus)}
                if(coordXPlus.x > 0 && coordXPlus.y > 0){
                exclusionArr.push(coordXPlus)}
                if(coordXMinus.x > 0 && coordXMinus.y > 0){
                exclusionArr.push(coordXMinus)}
            }
        }
        if(maybePile[i].x > 0 && maybePile[i].y > 0){
            exclusionArr.push({x: maybePile[i].x, y: maybePile[i].y})}
            if(maybePile[i].x+1 > 0 && maybePile[i].y > 0){
        exclusionArr.push({x: maybePile[i].x+1, y: maybePile[i].y})}
            if(maybePile[i].x-1 > 0 && maybePile[i].y > 0){
        exclusionArr.push({x: maybePile[i].x-1, y: maybePile[i].y})}
            if(maybePile[i].x > 0 && maybePile[i].y+1 > 0){
        exclusionArr.push({x: maybePile[i].x, y: maybePile[i].y+1})}
            if(maybePile[i].x > 0 && maybePile[i].y-1 > 0){
        exclusionArr.push({x: maybePile[i].x, y: maybePile[i].y-1})}
        perimeterScan(exclusionArr, imgMatrix)
        // break
    }
}

const perimeterScan = (exclusionArr, imgMatrix) => {
    let xMax = exclusionArr[0].x
    let xMin = exclusionArr[0].x
    let yMax = exclusionArr[0].y
    let yMin = exclusionArr[0].y
    for(var i of exclusionArr) {
        if(i.x > xMax){xMax = i.x}
        if(i.x < xMin){xMin = i.x}
        if(i.y > yMax){yMax = i.y}
        if(i.y < yMin){yMin = i.y}
    }
    let clearPerimeter = true
    for(var x = 0; x < xMax-xMin+1; x++) {
        // console.log(imgMatrix[yMin+x][xMin-1]) //positive y x min
        // console.log(imgMatrix[yMin][xMin+x-1]) //positive x y min
        // console.log(imgMatrix[yMin+x][xMax-1]) // positive y x max
        // console.log(imgMatrix[yMax][xMin+x-1]) // positive x y max
        try{
        // if(){
            if(imgMatrix[yMin+x][xMin-1].a != 0){
                clearPerimeter = false
            }
            if(imgMatrix[yMin][xMin+x-1].a != 0){
                clearPerimeter = false
            }
            if(imgMatrix[yMin+x][xMax-1].a != 0){
                clearPerimeter = false
            }
            if(imgMatrix[yMax][xMin+x-1].a != 0){
                clearPerimeter = false
            }}
        // }   
        catch(err){
            fs.appendFileSync('./error-log.txt', date.toString()+'\n'+err+'\n\n')
            console.log(err)
        }
    }
    if(clearPerimeter == true){
        // console.log(exclusionArr)
        failClear(exclusionArr, imgMatrix)
    }
}

const failClear = (exclusionArr, imgMatrix) => {
    for(var i of exclusionArr) {
        // imgMatrix[i.y][i.x].r = 0
        // imgMatrix[i.y][i.x].g = 0
        // imgMatrix[i.y][i.x].b = 0
        imgMatrix[i.y-1][i.x-1].a = 0
        // console.log(imgMatrix[i.y][i.x].a)
    }
    convertBuffer(imgMatrix, false)
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