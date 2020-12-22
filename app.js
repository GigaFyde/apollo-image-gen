const express = require('express')
const {Canvas} = require('canvas-constructor')
const fs = require('fs')
const request = require('request')
const app = express()
const port = 3003
const fade = fs.readFileSync('assets/images/template-fade.png')
const vertfade = fs.readFileSync('assets/images/template-fade-vertical.png')
const bg = fs.readFileSync('assets/images/template.png')
const progFade = fs.readFileSync('assets/images/fade.png')

app.use(express.json())

function download(uri, filename, callback) {
    request.head(uri, function () {
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback)
    })
}

app.post('/convert', async function (req, res) {
    const canvas = new Canvas(900, 400) // 1920   -  720
    if (req.body.uri.includes('youtube.com')) {
        download(getYoutubeThumbnailUri(req.body.identifier), 'thumbnail.png', function () {
            canvas
                .addImage(fs.readFileSync('thumbnail.png'), 190, -100, 710, 600,)
                .addImage(vertfade, 0, 0, 900, 150)
                .addImage(fade, 0, 0, 500, 400)
                .setColor('white')
                .setTextSize(32)
                .addWrappedText(req.body.title, 6, 30, 880)
                .setTextSize(20)
                .addText('Length: ' + calcLength(req.body.duration), 10, 365)
                .addText('Added by ' + req.body.author, 10, 390, 350)
            fs.writeFileSync('out.png', canvas.toBuffer())
            res.type('png')
            res.send(canvas.toBuffer())
            try {
                fs.unlinkSync('thumbnail.png')
                fs.unlinkSync('out.png')
            } catch (err) {
                console.error('failed to remove file' + err)
            }
        })
        return
    } else canvas.addImage(bg, 0, 0, 1920, 720,)
        .setColor('white')
        .setTextSize(35)
        .setTextAlign("center")
        .addWrappedText('Added to the queue', 960, 45, 1850)
        .setTextSize(55)
        .addWrappedText(req.body.title, 960, 250, 1850)
        .setTextSize(35)
        .setTextAlign("right")
        .addWrappedText('Length: ' + calcLength(req.body.duration), 900, 700, 500)
        .setTextAlign("left")
        .addText('Requested by ' + req.body.author, 940, 700, 450)
    res.type('png')
    return res.send(canvas.toBuffer())
})

app.post('/np', async function (req, res) {
    const canvas = new Canvas(1920, 720)
        .addImage(bg, 0, 0, 1920, 720)
        .setColor("white")
        .setTextSize(55)
        .setTextAlign("center")
        .addWrappedText(req.body.title, 960, 200, 1850)
        .addText(calcLength(req.body.position) + "/" + calcLength(req.body.duration), 960, 400, 1850)

    req.body.position < 5000 ?
        canvas.addText('The song has just started', 950, 575) :
        canvas.addImage(progFade, 210, 500, calcSongProgress(req.body.position, req.body.duration), 50)

    res.type('png')
    return res.send(canvas.toBuffer())
})

function getYoutubeThumbnailUri(identifier) {
    return 'https://img.youtube.com/vi/%s/hqdefault.jpg'.replace('%s', identifier)
}

function calcSongProgress(position, duration) {
    let width = 1500
    let percent = duration / position
    return width / percent
}

function calcLength(length) {
    let minutes = Math.floor(length / 60000)
    let seconds = ((length % 60000) / 1000).toFixed(0)
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds
}

app.listen(port, () => console.log(`Server listening on port ${port}`))
