const canvasDraw = (data) => {
    const parsedData = JSON.parse(data)
    var canvas = document.getElementById("zeCanvas")
    var ctx = canvas.getContext("2d")
    ctx.canvas.width = parsedData.width
    ctx.canvas.height = parsedData.height
    ctx.fillStyle = "#ff0000"
    ctx.fillRect(0, 0, 5, 5)
    var pixel = 0
    for (var y = 0; y < parsedData.height-1; y++) {
        pixel++
        for (var x = 0; x < parsedData.width-1; x++) {
            pixel++
            for(var n = 0; n < parsedData.maybePile.length; n++) {
                if(parsedData.maybePile[n].pixel == pixel){
                    // console.log(parsedData.maybePile[n].pixel)
                    // console.log('x: ' + x)
                    // console.log('y: ' + y)
                    // console.log("width: " + parsedData.width)
                    // console.log("height: " + parsedData.height)
                    ctx.fillRect(x, y, 5, 5)
                    // break
                }
            }
        }
    }
}