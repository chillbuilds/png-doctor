const canvasDraw = (data) => {
    const parsedData = JSON.parse(data)
    $('#zeCanvas').attr('style', `background: rgba(0,0,0,0.2);margin-left:${window.innerWidth/2-parsedData.width/2}px`)
    var canvas = document.getElementById("zeCanvas")
    var ctx = canvas.getContext("2d")
    ctx.canvas.width = parsedData.width
    ctx.canvas.height = parsedData.height
    ctx.fillStyle = "#ff0000"
    var pixel = 0
    for (var y = 0; y < parsedData.height-1; y++) {
        pixel++
        for (var x = 0; x < parsedData.width-1; x++) {
            pixel++
            for(var n = 0; n < parsedData.maybePile.length; n++) {
                if(parsedData.maybePile[n].pixel == pixel){
                    ctx.fillRect(x, y, 6, 6)
                }
            }
        }
    }
}