const canvasDraw = (data) => {
    const parsedData = JSON.parse(data)
    const stroke = 4
    $('#zeCanvas').attr('style', `background: rgba(0,0,0,0.2);margin-left:${window.innerWidth/2-parsedData.width/2}px`)
    var canvas = document.getElementById("zeCanvas")
    var ctx = canvas.getContext("2d")
    ctx.canvas.width = parsedData.width
    ctx.canvas.height = parsedData.height
    ctx.fillStyle = "#ff0000"
    for(var n = 0; n < parsedData.maybePile.length; n++) {
        ctx.fillRect(parsedData.maybePile[n].x, parsedData.maybePile[n].y, stroke, stroke)
    }
    console.log(parsedData.maybePile.length)
}