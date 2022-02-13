$('.genBtn').on('mousedown', () => {
    $('.genBtn').attr('style', 'border-bottom:4px solid rgba(0,0,0,0);position:relative;top:4px;')
    $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8080/test',						
        success: function(data) {
            canvasDraw(data)
        }
    })
})
$('.genBtn').on('mouseup', () => {
    $('.genBtn').attr('style', 'border-bottom: 4px solid rgba(0, 0, 0, 0.2);position:relative;top:0px;')
})