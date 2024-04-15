
window.addEventListener('DOMContentLoaded', (event) => {
    const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
    for (let t = 0; t < 10000000; t++) {
        squaretable[`${t}`] = Math.sqrt(t)
        if (t > 999) {
            t += 9
        }
    }
    let video_recorder
    let recording = 0
    function CanvasCaptureToWEBM(canvas, bitrate) {
        // the video_recorder is set to  '= new CanvasCaptureToWEBM(canvas, 4500000);' in the setup, 
        // it uses the same canvas as the rest of the file.
        // to start a recording call .record() on video_recorder
        /*
        for example, 
        if(keysPressed['-'] && recording == 0){
            recording = 1
            video_recorder.record()
        }
        if(keysPressed['='] && recording == 1){
            recording = 0
            video_recorder.stop()
            video_recorder.download('File Name As A String.webm')
        }
        */
        this.record = Record
        this.stop = Stop
        this.download = saveToDownloads
        let blobCaptures = []
        let outputFormat = {}
        let recorder = {}
        let canvasInput = canvas.captureStream()
        if (typeof canvasInput == undefined || !canvasInput) {
            return
        }
        const video = document.createElement('video')
        video.style.display = 'none'

        function Record() {
            let formats = [
                'video/vp8',
                "video/webm",
                'video/webm,codecs=vp9',
                "video/webm\;codecs=vp8",
                "video/webm\;codecs=daala",
                "video/webm\;codecs=h264",
                "video/mpeg"
            ];

            for (let t = 0; t < formats.length; t++) {
                if (MediaRecorder.isTypeSupported(formats[t])) {
                    outputFormat = formats[t]
                    break
                }
            }
            if (typeof outputFormat != "string") {
                return
            } else {
                let videoSettings = {
                    mimeType: outputFormat,
                    videoBitsPerSecond: bitrate || 2000000 // 2Mbps
                };
                blobCaptures = []
                try {
                    recorder = new MediaRecorder(canvasInput, videoSettings)
                } catch (error) {
                    return;
                }
                recorder.onstop = handleStop
                recorder.ondataavailable = handleAvailableData
                recorder.start(100)
            }
        }
        function handleAvailableData(event) {
            if (event.data && event.data.size > 0) {
                blobCaptures.push(event.data)
            }
        }
        function handleStop() {
            const superBuffer = new Blob(blobCaptures, { type: outputFormat })
            video.src = window.URL.createObjectURL(superBuffer)
        }
        function Stop() {
            recorder.stop()
            video.controls = true
        }
        function saveToDownloads(input) { // specifying a file name for the output
            const name = input || 'video_out.webm'
            const blob = new Blob(blobCaptures, { type: outputFormat })
            const url = window.URL.createObjectURL(blob)
            const storageElement = document.createElement('a')
            storageElement.style.display = 'none'
            storageElement.href = url
            storageElement.download = name
            document.body.appendChild(storageElement)
            storageElement.click()
            setTimeout(() => {
                document.body.removeChild(storageElement)
                window.URL.revokeObjectURL(url)
            }, 100)
        }
    }
    const gamepadAPI = {
        controller: {},
        turbo: true,
        connect: function (evt) {
            if (navigator.getGamepads()[0] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[1] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[2] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[3] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            }
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] === null) {
                    continue;
                }
                if (!gamepads[i].connected) {
                    continue;
                }
            }
        },
        disconnect: function (evt) {
            gamepadAPI.turbo = false;
            delete gamepadAPI.controller;
        },
        update: function () {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.buttonsCache = [];// clear the buttons cache
            for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
                gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
            }
            gamepadAPI.buttonsStatus = [];// clear the buttons status
            var c = gamepadAPI.controller || {}; // get the gamepad object
            var pressed = [];
            if (c.buttons) {
                for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                    if (c.buttons[b].pressed) {
                        pressed.push(gamepadAPI.buttons[b]);
                    }
                }
            }
            var axes = [];
            if (c.axes) {
                for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                    axes.push(c.axes[a].toFixed(2));
                }
            }
            gamepadAPI.axesStatus = axes;// assign received values
            gamepadAPI.buttonsStatus = pressed;
            // console.log(pressed); // return buttons for debugging purposes
            return pressed;
        },
        buttonPressed: function (button, hold) {
            var newPress = false;
            for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
                if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                    newPress = true;// set the boolean variable to true
                    if (!hold) {// if we want to check the single press
                        for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                            if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                                newPress = false;
                            }
                        }
                    }
                }
            }
            return newPress;
        },
        buttons: [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
        ],
        buttonsCache: [],
        buttonsStatus: [],
        axesStatus: []
    };
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    let XS_engine
    let YS_engine
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }

    class Vector { // vector math and physics if you prefer this over vector components on circles
        constructor(object = (new Point(0, 0)), xmom = 0, ymom = 0) {
            this.xmom = xmom
            this.ymom = ymom
            this.object = object
        }
        isToward(point) {
            let link = new LineOP(this.object, point)
            let dis1 = link.squareDistance()
            let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
            let link2 = new LineOP(dummy, point)
            let dis2 = link2.squareDistance()
            if (dis2 < dis1) {
                return true
            } else {
                return false
            }
        }
        rotate(angleGoal) {
            let link = new Line(this.xmom, this.ymom, 0, 0)
            let length = link.hypotenuse()
            let x = (length * Math.cos(angleGoal))
            let y = (length * Math.sin(angleGoal))
            this.xmom = x
            this.ymom = y
        }
        magnitude() {
            return (new Line(this.xmom, this.ymom, 0, 0)).hypotenuse()
        }
        normalize(size = 1) {
            let magnitude = this.magnitude()
            this.xmom /= magnitude
            this.ymom /= magnitude
            this.xmom *= size
            this.ymom *= size
        }
        multiply(vect) {
            let point = new Point(0, 0)
            let end = new Point(this.xmom + vect.xmom, this.ymom + vect.ymom)
            return point.pointDistance(end)
        }
        add(vect) {
            return new Vector(this.object, this.xmom + vect.xmom, this.ymom + vect.ymom)
        }
        subtract(vect) {
            return new Vector(this.object, this.xmom - vect.xmom, this.ymom - vect.ymom)
        }
        divide(vect) {
            return new Vector(this.object, this.xmom / vect.xmom, this.ymom / vect.ymom) //be careful with this, I don't think this is right
        }
        draw() {
            let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
            let link = new LineOP(this.object, dummy, "#FFFFFF", 1)
            link.draw()
        }
    }
    class Line {
        constructor(x, y, x2, y2, color, width) {
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        angle() {
            return Math.atan2(this.y1 - this.y2, this.x1 - this.x2)
        }
        squareDistance() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if (hypotenuse < 10000000 - 1) {
                if (hypotenuse > 1000) {
                    return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
                } else {
                    return squaretable[`${Math.round(hypotenuse)}`]
                }
            } else {
                return Math.sqrt(hypotenuse)
            }
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.x1, this.y1)
            canvas_context.lineTo(this.x2, this.y2)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class LineOP {
        constructor(object, target, color, width) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        intersects(line) {
            console.log(line)
            var det, gm, lm;
            det = (this.target.x - this.object.x) * (line.target.y - line.object.y) - (line.target.x - line.object.x) * (this.target.y - this.object.y);
            if (det === 0) {
                return false;
            } else {
                lm = ((line.target.y - line.object.y) * (line.target.x - this.object.x) + (line.object.x - line.target.x) * (line.target.y - this.object.y)) / det;
                gm = ((this.object.y - this.target.y) * (line.target.x - this.object.x) + (this.target.x - this.object.x) * (line.target.y - this.object.y)) / det;
                return (0 < lm && lm < 1) && (0 < gm && gm < 1);
            }
        }
        squareDistance() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if (hypotenuse < 10000000 - 1) {
                if (hypotenuse > 1000) {
                    return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
                } else {
                    return squaretable[`${Math.round(hypotenuse)}`]
                }
            } else {
                return Math.sqrt(hypotenuse)
            }
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                // canvas_context.fill()
                canvas_context.stroke();
            } else {
                // console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    }
    class Polygon {
        constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
            if (sides < 2) {
                sides = 2
            }
            this.reflect = reflect
            this.xmom = xmom
            this.ymom = ymom
            this.body = new Circle(x, y, size - (size * .293), "transparent")
            this.nodes = []
            this.angle = angle
            this.size = size
            this.color = color
            this.angleIncrement = (Math.PI * 2) / sides
            this.sides = sides
            for (let t = 0; t < sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
        }
        isPointInside(point) { // rough approximation
            this.body.radius = this.size - (this.size * .293)
            if (this.sides <= 2) {
                return false
            }
            this.areaY = point.y - this.body.y
            this.areaX = point.x - this.body.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
                return true
            }
            return false
        }
        move() {
            if (this.reflect == 1) {
                if (this.body.x > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.body.x < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.body.x += this.xmom
            this.body.y += this.ymom
        }
        draw() {
            this.nodes = []
            this.angleIncrement = (Math.PI * 2) / this.sides
            this.body.radius = this.size - (this.size * .293)
            for (let t = 0; t < this.sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
            canvas_context.strokeStyle = this.color
            canvas_context.fillStyle = this.color
            canvas_context.lineWidth = 0
            canvas_context.beginPath()
            canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
            for (let t = 1; t < this.nodes.length; t++) {
                canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
            }
            canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
            canvas_context.fill()
            canvas_context.stroke()
            canvas_context.closePath()
        }
    }
    class Shape {
        constructor(shapes) {
            this.shapes = shapes
        }
        draw() {
            for (let t = 0; t < this.shapes.length; t++) {
                this.shapes[t].draw()
            }
        }
        move() {
            if (typeof this.xmom != "number") {
                this.xmom = 0
            }
            if (typeof this.ymom != "number") {
                this.ymom = 0
            }
            for (let t = 0; t < this.shapes.length; t++) {
                this.shapes[t].x += this.xmom
                this.shapes[t].y += this.ymom
                this.shapes[t].draw()
            }
        }
        isPointInside(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].isPointInside(point)) {
                    return true
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return true
                }
            }
            return false
        }
        innerShape(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return this.shapes[t]
                }
            }
            return false
        }
        isInsideOf(box) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (box.isPointInside(this.shapes[t])) {
                    return true
                }
            }
            return false
        }
        adjustByFromDisplacement(x, y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (typeof this.shapes[t].fromRatio == "number") {
                    this.shapes[t].x += x * this.shapes[t].fromRatio
                    this.shapes[t].y += y * this.shapes[t].fromRatio
                }
            }
        }
        adjustByToDisplacement(x, y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (typeof this.shapes[t].toRatio == "number") {
                    this.shapes[t].x += x * this.shapes[t].toRatio
                    this.shapes[t].y += y * this.shapes[t].toRatio
                }
            }
        }
        mixIn(arr) {
            for (let t = 0; t < arr.length; t++) {
                for (let k = 0; k < arr[t].shapes.length; k++) {
                    this.shapes.push(arr[t].shapes[k])
                }
            }
        }
        push(object) {
            this.shapes.push(object)
        }
    }

    class Spring {
        constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
            if (body == 0) {
                this.body = new Circle(x, y, radius, color)
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            } else {
                this.body = body
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            }
            this.gravity = gravity
            this.width = width
        }
        balance() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += (this.body.x - this.anchor.x) / this.length
                this.body.ymom += (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
            } else {
                this.body.xmom -= (this.body.x - this.anchor.x) / this.length
                this.body.ymom -= (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
            }
            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            this.beam.draw()
            this.body.draw()
            this.anchor.draw()
        }
        move() {
            this.anchor.ymom += this.gravity
            this.anchor.move()
        }

    }
    class SpringOP {
        constructor(body, anchor, length, width = 3, color = body.color) {
            this.body = body
            this.anchor = anchor
            this.beam = new LineOP(body, anchor, color, width)
            this.length = length
        }
        balance() {
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += ((this.body.x - this.anchor.x) / this.length)
                this.body.ymom += ((this.body.y - this.anchor.y) / this.length)
                this.anchor.xmom -= ((this.body.x - this.anchor.x) / this.length)
                this.anchor.ymom -= ((this.body.y - this.anchor.y) / this.length)
            } else if (this.beam.hypotenuse() > this.length) {
                this.body.xmom -= (this.body.x - this.anchor.x) / (this.length)
                this.body.ymom -= (this.body.y - this.anchor.y) / (this.length)
                this.anchor.xmom += (this.body.x - this.anchor.x) / (this.length)
                this.anchor.ymom += (this.body.y - this.anchor.y) / (this.length)
            }

            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam.draw()
        }
        move() {
            //movement of SpringOP objects should be handled separate from their linkage, to allow for many connections, balance here with this object, move nodes independently
        }
    }

    class Color {
        constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
            this.hue = baseColor
            if (red != -1 && green != -1 && blue != -1) {
                this.r = red
                this.g = green
                this.b = blue
                if (alpha != 1) {
                    if (alpha < 1) {
                        this.alpha = alpha
                    } else {
                        this.alpha = alpha / 255
                        if (this.alpha > 1) {
                            this.alpha = 1
                        }
                    }
                }
                if (this.r > 255) {
                    this.r = 255
                }
                if (this.g > 255) {
                    this.g = 255
                }
                if (this.b > 255) {
                    this.b = 255
                }
                if (this.r < 0) {
                    this.r = 0
                }
                if (this.g < 0) {
                    this.g = 0
                }
                if (this.b < 0) {
                    this.b = 0
                }
            } else {
                this.r = 0
                this.g = 0
                this.b = 0
            }
        }
        normalize() {
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        }
        randomLight() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12) + 4)];
            }
            var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
            return color;
        }
        randomDark() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12))];
            }
            var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
            return color;
        }
        random() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 16))];
            }
            var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
            return color;
        }
    }
    class Softbody { //buggy, spins in place
        constructor(x, y, radius, color, members = 10, memberLength = 5, force = 10, gravity = 0) {
            this.springs = []
            this.pin = new Circle(x, y, radius, color)
            this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
            this.springs.push(this.spring)
            for (let k = 0; k < members; k++) {
                this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
                if (k < members - 1) {
                    this.springs.push(this.spring)
                } else {
                    this.spring.anchor = this.pin
                    this.springs.push(this.spring)
                }
            }
            this.forceConstant = force
            this.centroid = new Point(0, 0)
        }
        circularize() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            this.angle = 0
            this.angleIncrement = (Math.PI * 2) / this.springs.length
            for (let t = 0; t < this.springs.length; t++) {
                this.springs[t].body.x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
                this.springs[t].body.y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
                this.angle += this.angleIncrement
            }
        }
        balance() {
            for (let s = this.springs.length - 1; s >= 0; s--) {
                this.springs[s].balance()
            }
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            for (let s = 0; s < this.springs.length; s++) {
                this.link = new Line(this.centroid.x, this.centroid.y, this.springs[s].anchor.x, this.springs[s].anchor.y, 0, "transparent")
                if (this.link.hypotenuse() != 0) {
                    this.springs[s].anchor.xmom += (((this.springs[s].anchor.x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                    this.springs[s].anchor.ymom += (((this.springs[s].anchor.y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
                }
            }
            for (let s = 0; s < this.springs.length; s++) {
                this.springs[s].move()
            }
            for (let s = 0; s < this.springs.length; s++) {
                this.springs[s].draw()
            }
        }
    }
    class Observer {
        constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
            this.body = new Circle(x, y, radius, color)
            this.color = color
            this.ray = []
            this.rayrange = range
            this.globalangle = Math.PI
            this.gapangle = angle
            this.currentangle = 0
            this.obstacles = []
            this.raymake = rays
        }
        beam() {
            this.currentangle = this.gapangle / 2
            for (let k = 0; k < this.raymake; k++) {
                this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
                ray.collided = 0
                ray.lifespan = this.rayrange - 1
                this.ray.push(ray)
            }
            for (let f = 0; f < this.rayrange; f++) {
                for (let t = 0; t < this.ray.length; t++) {
                    if (this.ray[t].collided < 1) {
                        this.ray[t].move()
                        for (let q = 0; q < this.obstacles.length; q++) {
                            if (this.obstacles[q].isPointInside(this.ray[t])) {
                                this.ray[t].collided = 1
                            }
                        }
                    }
                }
            }
        }
        draw() {
            this.beam()
            this.body.draw()
            canvas_context.lineWidth = 1
            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath()
            canvas_context.moveTo(this.body.x, this.body.y)
            for (let y = 0; y < this.ray.length; y++) {
                canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                canvas_context.lineTo(this.body.x, this.body.y)
            }
            canvas_context.stroke()
            canvas_context.fill()
            this.ray = []
        }
    }
    function setUp(canvas_pass, style = "#444400") {
        canvas = canvas_pass
        video_recorder = new CanvasCaptureToWEBM(canvas, 4500000);
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 40)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
            let wet = 0
            if (forge.isPointInside(TIP_engine) && enemies.length > 0) {
                let fruit = new Fruit(Math.floor(Math.random() * 41))
                let wet2 = 1
                let t = 0
                while (wet2 != 0) {
                    fruit.body.x =( (t * 50) % 500)+10
                    fruit.body.y =( Math.floor(t / 10) * 70)+25
                    wet2 = 0
                    for (let k = 0; k < fruitlist.length; k++) {
                        if (fruit.body.isPointInside(fruitlist[k].body)) {
                            wet2 = 1
                        }
                    }
                    t++
                }
                wet = 1
                if (fruitlist.length < pomao.maxfruits) {
                    pomao.turn--
                    fruitlist.push(fruit)
                }
            }
            
            for (let t = 0; t < fruitlist.length; t++) {
                if (fruitlist[t].use()) {
                    wet = 1
                }
            }
            if (wet == 0) {

                for (let t = 0; t < enemies.length; t++) {
                    enemies[t].selected = 0
                }
            }
            for (let t = 0; t < enemies.length; t++) {
                enemies[t].check()
            }
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
        });
        window.addEventListener('pointermove', continued_stimuli);
        window.addEventListener('pointerup', e => {
            // window.removeEventListener("pointermove", continued_stimuli);
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
        }
    }
    function gamepad_control(object, speed = 1) { // basic control for objects using the controler
        //         console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
        if (typeof object.body != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.body.x += (gamepadAPI.axesStatus[0] * speed)
                    object.body.y += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        } else if (typeof object != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.x += (gamepadAPI.axesStatus[0] * speed)
                    object.y += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        }
    }
    function control(object, speed = 1) { // basic control for objects
        if (typeof object.body != 'undefined') {
            if (keysPressed['w']) {
                object.body.y -= speed
            }
            if (keysPressed['d']) {
                object.body.x += speed
            }
            if (keysPressed['s']) {
                object.body.y += speed
            }
            if (keysPressed['a']) {
                object.body.x -= speed
            }
        } else if (typeof object != 'undefined') {
            if (keysPressed['w']) {
                object.y -= speed
            }
            if (keysPressed['d']) {
                object.x += speed
            }
            if (keysPressed['s']) {
                object.y += speed
            }
            if (keysPressed['a']) {
                object.x -= speed
            }
        }
    }
    function getRandomLightColor() { // random color that will be visible on  black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        return color;
    }
    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    function getRandomDarkColor() {// color that will be visible on a black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12))];
        }
        return color;
    }
    function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
        let limit = granularity
        let shape_array = []
        for (let t = 0; t < limit; t++) {
            let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
            circ.toRatio = t / limit
            circ.fromRatio = (limit - t) / limit
            shape_array.push(circ)
        }
        return (new Shape(shape_array))
    }

    function castBetweenPoints(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
        let limit = granularity
        let shape_array = []
        for (let t = 0; t < limit; t++) {
            let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
            circ.toRatio = t / limit
            circ.fromRatio = (limit - t) / limit
            shape_array.push(circ)
        }
        return shape_array
    }

    class Disang {
        constructor(dis, ang) {
            this.dis = dis
            this.angle = ang
        }
    }

    class BezierHitbox {
        constructor(x, y, cx, cy, ex, ey, color = "red") { // this function takes a starting x,y, a control point x,y, and a end point x,y
            this.color = color
            this.x = x
            this.y = y
            this.cx = cx
            this.cy = cy
            this.ex = ex
            this.ey = ey
            this.metapoint = new Circle((x + cx + ex) / 3, (y + cy + ey) / 3, 3, "#FFFFFF")
            this.granularity = 100
            this.body = [...castBetweenPoints((new Point(this.x, this.y)), (new Point(this.ex, this.ey)), this.granularity, 0)]

            let angle = (new Line(this.x, this.y, this.ex, this.ey)).angle()

            this.angles = []
            for (let t = 0; t < this.granularity; t++) {
                this.angles.push(angle)
            }
            for (let t = 0; t <= 1; t += 1 / this.granularity) {
                this.body.push(this.getQuadraticXY(t))
                this.angles.push(this.getQuadraticAngle(t))
            }
            this.hitbox = []
            for (let t = 0; t < this.body.length; t++) {
                let link = new LineOP(this.body[t], this.metapoint)
                let disang = new Disang(link.hypotenuse(), link.angle() + (Math.PI * 2))
                this.hitbox.push(disang)
            }
            this.constructed = 1
        }
        isPointInside(point) {
            let link = new LineOP(point, this.metapoint)
            let angle = (link.angle() + (Math.PI * 2))
            let dis = link.hypotenuse()
            for (let t = 1; t < this.hitbox.length; t++) {
                if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                    continue
                }
                if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                    if (dis < (this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) {
                        return true
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            let link = new LineOP(point, this.metapoint)
            let angle = (link.angle() + (Math.PI * 2))
            let dis = link.hypotenuse()
            for (let t = 1; t < this.hitbox.length; t++) {
                if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                    continue
                }
                if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                    if (dis < ((this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) + point.radius) {
                        return this.angles[t]
                    }
                }
            }
            return false
        }
        draw() {
            this.metapoint.draw()
            let tline = new Line(this.x, this.y, this.ex, this.ey, this.color, 3)
            tline.draw()
            canvas_context.beginPath()
            this.median = new Point((this.x + this.ex) * .5, (this.y + this.ey) * .5)
            let angle = (new LineOP(this.median, this.metapoint)).angle()
            let dis = (new LineOP(this.median, this.metapoint)).hypotenuse()
            canvas_context.bezierCurveTo(this.x, this.y, this.cx - (Math.cos(angle) * dis * .38), this.cy - (Math.sin(angle) * dis * .38), this.ex, this.ey)

            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = 3
            canvas_context.stroke()
        }
        getQuadraticXY(t) {
            return new Point((((1 - t) * (1 - t)) * this.x) + (2 * (1 - t) * t * this.cx) + (t * t * this.ex), (((1 - t) * (1 - t)) * this.y) + (2 * (1 - t) * t * this.cy) + (t * t * this.ey))
        }
        getQuadraticAngle(t) {
            var dx = 2 * (1 - t) * (this.cx - this.x) + 2 * t * (this.ex - this.cx);
            var dy = 2 * (1 - t) * (this.cy - this.y) + 2 * t * (this.ey - this.cy);
            return -Math.atan2(dx, dy) + 0.5 * Math.PI;
        }
    }
    Number.prototype.between = function (a, b, inclusive) {
        var min = Math.min(a, b),
            max = Math.max(a, b);
        return inclusive ? this >= min && this <= max : this > min && this < max;
    }



    class Weight {
        constructor(from, to) {
            this.value = this.weight()
            this.from = from
            this.to = to
            this.change = 0
            this.delta = 1
        }
        valueOf() {
            return this.value
        }
        weight() {
            return ((Math.random() - .5) * 2)
        }
        setChange(num) {
            this.change = num
        }
        setWeight(num) {
            this.value = num
        }
    }
    class Perceptron {
        constructor(inputs) {
            this.bias = ((Math.random() - .5) * 2) / 1
            this.value = this.bias
            this.weights = []
            this.outputConnections = []
            this.inputs = inputs
            this.error = 0
            this.delta = 1
            for (let t = 0; t < this.inputs.length; t++) {
                this.weights.push(this.weight(this.inputs[t]))
            }
            this.z = -1
            this.change = 0
        }
        setError(error) {
            this.error = error
        }
        setDelta(delta) {
            this.delta = delta
            for (let t = 0; t < this.outputConnections.length; t++) {
                this.outputConnections[t].delta = this.delta
            }
        }
        setBias(bias) {
            this.bias = bias
        }
        setChange(num) {
            this.change = num
        }
        weight(link) {
            let weight = new Weight(link, this)
            if (typeof link != "number") {
                link.outputConnections.push(weight)
            }
            return weight
        }
        valueOf() {
            return this.value
        }
        compute(inputs = this.inputs) {
            this.inputs = inputs
            this.value = this.bias
            for (let t = 0; t < inputs.length; t++) {
                if (t > this.weights.length - 1) {
                    this.weights.push(this.weight())
                    this.value += (inputs[t].valueOf() * this.weights[t].valueOf())
                } else {
                    this.value += (inputs[t].valueOf() * this.weights[t].valueOf())
                }
            }
            this.sig()
            // this.gauss()
            return this.value
        }
        relu() {
            this.value = Math.min(Math.max(this.value, perc.reluslime), 1)
        }
        sig() {
            this.value = 1 / (1 + (Math.pow(Math.E, -this.value)))
        }
        gauss() {
            this.value = Math.min(Math.max(Math.abs(this.value), 0.00000001), 1)

        }
    }
    class Network {
        constructor(inputs, layerSetupArray) {
            this.reluslime = .00001
            this.momentum = .025
            this.learningRate = .0025
            this.setup = layerSetupArray
            this.inputs = inputs
            this.structure = []
            this.outputs = []
            for (let t = 0; t < layerSetupArray.length; t++) {
                let scaffold = []
                for (let k = 0; k < layerSetupArray[t]; k++) {
                    let cept
                    if (t == 0) {
                        cept = new Perceptron(this.inputs)
                    } else {
                        cept = new Perceptron(this.structure[t - 1])
                    }
                    scaffold.push(cept)
                }
                this.structure.push(scaffold)
            }
            this.lastinputs = [...this.inputs]
            this.lastgoals = [...this.lastinputs]
            this.swap = []
        }

        becomeNetworkFrom(network) { //using a js file with one variable can be good for this
            // console.log(this.structure[0][0].bias)
            for (let t = 0; t < this.structure.length; t++) {
                // console.log("h1")
                for (let k = 0; k < this.structure[t].length; k++) {
                    // console.log("h2")
                    this.structure[t][k].bias = network.structure[t][k].bias
                    for (let w = 0; w < this.structure[t][k].weights.length; w++) {
                        // console.log("h3")
                        this.structure[t][k].weights[w].setWeight(network.structure[t][k][w].valueOf())
                    }
                }
            }
            // console.log(this.structure[0][0].bias)
        }
        log() {
            let json = {}
            json.structure = []
            json.setup = [...this.setup]
            for (let t = 0; t < this.structure.length; t++) {
                json.structure.push({})
                for (let k = 0; k < this.structure[t].length; k++) {
                    json.structure[t][k] = {}
                    json.structure[t][k].bias = this.structure[t][k].bias.valueOf()
                    for (let w = 0; w < this.structure[t][k].weights.length; w++) {
                        json.structure[t][k][w] = (this.structure[t][k].weights[w].valueOf())
                    }
                }
            }
            console.log(json)
        }
        calculateDeltasSigmoid(goals) {
            for (let t = this.structure.length - 1; t >= 0; t--) {
                const layer = this.structure[t]
                for (let k = 0; k < layer.length; k++) {
                    const perceptron = layer[k]
                    let output = perceptron.valueOf()
                    let error = 0
                    if (t === this.structure.length - 1) {
                        error = goals[k] - output;
                    } else {
                        for (let k = 0; k < perceptron.outputConnections.length; k++) {
                            const currentConnection = perceptron.outputConnections[k]
                            //console.log(currentConnection)
                            error += currentConnection.to.delta * currentConnection.valueOf()
                        }
                    }
                    perceptron.setError(error)
                    perceptron.setDelta(error * output * (1 - output))
                }
            }
        }
        adjustWeights() {
            for (let t = 0; t < this.structure.length; t++) {
                const layer = this.structure[t]
                for (let k = 0; k < layer.length; k++) {
                    const perceptron = layer[k]
                    let delta = perceptron.delta
                    for (let i = 0; i < perceptron.weights.length; i++) {
                        const connection = perceptron.weights[i]
                        let change = connection.change
                        change = (this.learningRate * delta * perceptron.inputs[i].valueOf()) + (this.momentum * change);
                        connection.setChange(change)
                        connection.setWeight(connection.valueOf() + change)
                    }
                    perceptron.setBias(perceptron.bias + (this.learningRate * delta))
                }
            }
        }
        clone(nw) {
            let input = nw.inputs
            let perc = new Network(input, nw.setup)
            for (let t = 0; t < nw.structure.length; t++) {
                for (let k = 0; k < nw.structure[t].length; k++) {
                    perc.structure[t][k] = new Perceptron([0, 0, 0, 0, 0, 0, 0])
                    for (let f = 0; f < nw.structure[t][k].weights.length; f++) {
                        perc.structure[t][k].weights[f] = nw.structure[t][k].weights[f]
                        perc.structure[t][k].bias = nw.structure[t][k].bias
                    }
                }
            }
            return perc
        }
        compute(inputs = this.inputs) {
            this.inputs = [...inputs]
            for (let t = 0; t < this.structure.length; t++) {
                for (let k = 0; k < this.structure[t].length; k++) {
                    if (t == 0) {
                        this.structure[t][k].compute(this.inputs)
                    } else {
                        this.structure[t][k].compute(this.structure[t - 1])
                    }
                }
            }
            this.outputs = []
            this.dataoutputs = []
            for (let t = 0; t < this.structure[this.structure.length - 1].length; t++) {
                this.outputs.push(this.structure[this.structure.length - 1][t].valueOf())
                this.dataoutputs.push(new Data(this.structure[this.structure.length - 1][t].valueOf()))
            }
        }
    }
    class Data {
        constructor(input = -100) {
            this.delta = 0
            this.outputConnections = []
            if (input == -100) {
                this.value = this.weight()
            } else {
                this.value = input
            }
        }
        valueOf() {
            return this.value
        }
        weight() {
            return Math.random() - .5
        }
    }

    let setup_canvas = document.getElementById('canvas') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    // object instantiation and creation happens here 

    let fruits = new Image()
    fruits.src = "fruits41.png"

    let song = new Audio()
    song.src = "song173.mp3"

    class Fruit {
        constructor(type) {
            this.type = type
            this.names = ["Blueberry", "Black Currant", "Blackberry", "Olive", "Avocado", "Tomato", "Cranberry", "Raspberry", "Bell Pepper", "Hot Pepper", "Pomegranate", "Eggplant", "Mangosteen", "Plum", "Fig", "Acorn", "Broccoli", "Lime", "Zucchini", "Watermelon", "Nectarine", "Orange", "Pumpkin", "Persimmon", "Guarana", "Beet", "Turnip", "Carrot", "Radish", "Daikon", "Squash", "Papaya", "Starfruit", "Lemon", "Plantain", "Tamarind", "Coconut", "Star Anise", "Yam", "Pineapple", "Psylocybe Cubensis"]
            this.damage = 0
            this.poison = 0
            this.armor = 0
            this.mass = 0
            this.heal = 0
            this.stun = 0
            this.name = this.names[this.type]
            if (this.type < 5) {
                this.color = "#8888ff"
                this.damage = (this.type) + 2
                this.poison = ((this.type * 2) + 1)
            } else if (this.type < 10) {
                this.color = "#FF8888"
                this.damage = ((this.type - 5) * 3) + 5
            } else if (this.type < 15) {
                this.color = "#AA00AA"
                this.damage = ((this.type - 10)) + 1
                this.poison = (((this.type - 10)) + 1)
                this.mass = 1
            } else if (this.type < 20) {
                this.color = "#00DD00"
                this.damage = ((this.type - 15)) + 1
                this.armor = (((this.type - 15)) + 1)
                this.poison = (((this.type - 15)) + 1)
            } else if (this.type < 25) {
                this.color = "#FFAA00"
                this.damage = ((this.type - 20)) + 1
                this.armor = (((this.type - 20)) + 1)
                this.mass = 1
            } else if (this.type < 30) {
                this.color = "#888888"
                this.damage = ((this.type - 25) * 2) + 3
                this.mass = 1
            } else if (this.type < 35) {
                this.color = "yellow"
                this.damage = ((this.type - 30) * 1) + 2
                this.armor = ((this.type - 30) * 2) + 2
                this.mass = 1
            } else if (this.type < 40) {
                this.color = "brown"
                this.damage = ((this.type - 35) * 1) + 2
                this.heal = ((this.type - 35) * 1) + 1
                this.mass = 1
            } else if (this.type == 40) {
                this.color = "tan"
                this.damage = 5
                this.mass = 1
                this.stun = 1
            }
            this.body = new Rectangle(0, 0, 186 / 4, 270 / 4, "#888888")
        }
        draw() {
            this.body.draw()
            canvas_context.drawImage(fruits, 186 * this.type, 0, 186, 270, this.body.x, this.body.y, this.body.width, this.body.height)
            this.on = 0
            if (this.body.isPointInside(TIP_engine)) {
                this.on = 1
            }
            // console.log(this)
        }
        point() {
            if (this.on == 1) {
                canvas_context.font = "25px comic sans ms"
                canvas_context.fillStyle = this.color
                canvas_context.strokeStyle = "black"
                canvas_context.lineWidth = 4
                if (this.stun > 0) {
                    canvas_context.strokeText(this.name + ` Stuns, Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Splash: ${this.mass ? "true" : "no"}, Armor pierce: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                    canvas_context.fillText(this.name + ` Stuns, Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Splash: ${this.mass ? "true" : "no"}, Armor pierce: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                } else if (this.heal > 0) {
                    canvas_context.strokeText(this.name + ` Heals + Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Splash: ${this.mass ? "true" : "no"}, Armor pierce: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                    canvas_context.fillText(this.name + ` Heals + Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Splash: ${this.mass ? "true" : "no"}, Armor pierce: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                } else {
                    canvas_context.strokeText(this.name + ` Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Splash: ${this.mass ? "true" : "no"}, Armor pierce: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                    canvas_context.fillText(this.name + ` Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Splash: ${this.mass ? "true" : "no"}, Armor pierce: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                }
            }
        }
        use() {
            if (this.on == 1 && enemies.length > 0) {
                let wet = 0
                for (let t = 0; t < enemies.length; t++) {
                    if (enemies[t].selected == 1 || this.mass == 1) {
                        wet = 1
                        enemies[t].health -= Math.max(0, (this.damage - Math.max(enemies[t].armor - this.armor, 0)))
                        enemies[t].poison += this.poison
                        enemies[t].stunned = this.stun
                        pomao.health += this.heal
                        if(pomao.health > pomao.maxhealth){
                            pomao.health = pomao.maxhealth
                        }
                    }
                    if (enemies[t].health < 0) {
                        enemies[t].health = 0
                    }
                }
                if (wet == 1) {

                    this.marked = 1
                    pomao.turn--
                    return true
                }
            }
        }
    }
    
    let rs = []
    for (let t = 1; t < 101; t++) {
        const ing = new Image()
        ing.src = `r${t}.png`
        rs.push(ing)
    }


    class Enemy {
        constructor(x, y, type) {
            this.body = new Circle(x, y, 40, "red")
            this.type = type
            this.health = (this.type + 1) * 5
            this.maxhealth = this.health
            this.armor = Math.min(Math.floor((1 + this.type) / 2), 5)
            this.poison = 0
            this.stunned = 0
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y - (this.body.radius * 1.5), this.body.radius * 2, 5, "#00ff00")
            this.name = "Enemy"
            this.damage = (this.type * 1)+1
            if(this.type == 11){
                this.type =12
            }
            this.count = 0
        }
        draw() {

            if (this.selected == 1) {
                this.body.radius = 70
                this.body.color = "black"
                this.body.draw()
            }
            this.body.radius = 40
            this.body.color = "red"
            // this.body.draw()
            if(this.stunned >0){

            }else{

                this.count++
            }
            canvas_context.drawImage(rs[this.type],(this.count%(rs[this.type].width/64)) *64,0,64,64,this.body.x-this.body.radius, this.body.y-this.body.radius, this.body.radius*2, this.body.radius*2)
            this.healthbar.width = this.body.radius * 2
            this.healthbar.color = "black"
            this.healthbar.draw()
            this.healthbar.width = this.body.radius * 2 * (this.health / this.maxhealth)
            this.healthbar.color = "#00ff00"
            this.healthbar.draw()
            canvas_context.strokeText(Math.max(this.health, 0)+"/"+this.maxhealth, this.body.x - 20, this.body.y-64)
            canvas_context.fillText(Math.max(this.health, 0)+"/"+this.maxhealth, this.body.x - 20, this.body.y-64)

            this.on = 0
            if (this.body.isPointInside(TIP_engine)) {
                this.on = 1
            }


        }

        point() {
            if (this.on == 1) {
                canvas_context.font = "16px comic sans ms"
                canvas_context.fillStyle = "red"
                canvas_context.strokeStyle = "black"
                canvas_context.lineWidth = 4
                canvas_context.strokeText("Health: " + this.health + ` Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Stunned: ${this.stunned > 0 ? "true" : "no"}, Armor: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)
                canvas_context.fillText("Health: " + this.health + ` Damage: ${this.damage}, Poison: ${(this.poison) > 0 ? this.poison : "no"}, Stunned: ${this.stunned > 0 ? "true" : "no"}, Armor: ${(this.armor) > 0 ? this.armor : "no"}. `, TIP_engine.x, TIP_engine.y)

            }
        }


        check() {
            if (this.body.isPointInside(TIP_engine)) {
                this.selected = 1
            }
        }
    }


    class Pomao {
        constructor() {
            this.maxturn =3
            this.health = 10
            this.maxhealth = this.health
            this.maxfruits = 7
            this.body = new Circle(620, 450, 40, "#00ff00")
            this.turn = 3
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y - (this.body.radius * 1.5), this.body.radius * 2, 5, "#00ff00")
            this.count = 0
        }
        draw() {
            if (this.turn == 0) {
                for (let t = 0; t < enemies.length; t++) {
                    if(enemies[t].stunned <=0 && enemies[t].health > 0){
                        // this.health -= enemies[t].damage
                        let shot = new Circle(enemies[t].body.x, enemies[t].body.y, 6, "red", -((enemies[t].body.x-this.body.x)/10), -((enemies[t].body.y-this.body.y)/10))
                        shot.life = 10
                        shot.damage = enemies[t].damage
                        shots.push(shot)
                    }
                }
                for (let t = 0; t < enemies.length; t++) {
                    enemies[t].health -= enemies[t].poison
                    enemies[t].stunned--
                    if (enemies[t].health < 0) {
                        enemies[t].health = 0
                    }
                }
                this.turn = -1
            }
            if (this.turn < 0) {
                this.turn--
                if (this.turn < -25) {
                    this.turn = this.maxturn
                }
            }
            if (this.health <= 0) {
                this.health = 0
                this.sleep = 1
            }
            // this.body.draw()
            this.type = 11
            this.count++
            canvas_context.drawImage(rs[this.type],(this.count%(rs[this.type].width/64)) *64,0,64,64,this.body.x-this.body.radius, this.body.y-this.body.radius, this.body.radius*2, this.body.radius*2)
            this.healthbar.width = this.body.radius * 2
            this.healthbar.color = "black"
            this.healthbar.draw()
            this.healthbar.width = this.body.radius * 2 * (this.health / this.maxhealth)
            this.healthbar.color = "#00ff00"
            this.healthbar.draw()



            canvas_context.font = "18px comic sans ms"
            canvas_context.fillStyle = "red"
            canvas_context.strokeStyle = "black"
            canvas_context.lineWidth = 4
            canvas_context.strokeText(Math.max(this.turn, 0)+"/"+this.maxturn, this.body.x + 42, this.body.y)
            canvas_context.fillText(Math.max(this.turn, 0)+"/"+this.maxturn, this.body.x + 42, this.body.y)
            canvas_context.strokeText(Math.max(this.health, 0)+"/"+this.maxhealth, this.body.x - 20, this.body.y-64)
            canvas_context.fillText(Math.max(this.health, 0)+"/"+this.maxhealth, this.body.x - 20, this.body.y-64)

            for (let t = 0; t < this.maxfruits; t++) {
                let fruit = new Rectangle(0, 0, 186 / 4, 270 / 4, "#444444")
                fruit.x =( (t * 50) % 500)+10
                fruit.y = (Math.floor(t / 10) * 70)+25
                fruit.draw()
            }
        }
    }



    let pomao = new Pomao()
    let fruit = new Fruit(Math.floor(Math.random() * 41))

    let fruitlist = []
    for (let t = 0; t < 0; t++) {
        let fruit = new Fruit(Math.floor(Math.random() * 41))
        fruit.body.x = ((t * 50) % 500)+10
        fruit.body.y =( Math.floor(t / 10) * 70)+25
        fruitlist.push(fruit)
    }
    let enemies = []
    for (let t = 0; t < 1; t++) {
        let enemy = new Enemy(570 + (t * 50), 200, 0)
        enemies.push(enemy)
    }

    class Pop{
        constructor(point){
            this.dots = []
            for(let t = 0;t<9;t++){
                let dot = new Circle(point.x, point.y, point.radius, "red")
                dot.xmom = Math.cos(t*(Math.PI*2/9))*4
                dot.ymom = Math.sin(t*(Math.PI*2/9))*4
                this.dots.push(dot)
            }
            this.time = 10
        }
        draw(){
            this.time--
            for(let t = 0;t<9;t++){
            this.dots[t].radius*=.8
            this.dots[t].move()
            this.dots[t].draw()
            }
        }
    }
    let pops = []
    let shots = []
    song.volume = .1
    let elevel = 1
    let play = 1

    let time = 40
    let forge = new Rectangle(570, 600, 120, 50, "pink")

    function main() {
        if(keysPressed['m']){
            song.pause()
            play = 0
        }else{
            if(play == 1){
                song.play()
            }
        }
        if(pomao.health <= 0){
            pops = []
            time = 40
            pomao = new Pomao() 
            elevel = 1
            enemies = []
            for (let t = 0; t < 1; t++) {
                let enemy = new Enemy(570 + (t * 50), 200, 0)
                enemies.push(enemy)
            }
            fruitlist = []
            for (let t = 0; t < 0; t++) {
                let fruit = new Fruit(Math.floor(Math.random() * 41))
                fruit.body.x = ((t * 50) % 500)+10
                fruit.body.y = (Math.floor(t / 10) * 70)+25
                fruitlist.push(fruit)
            }
        }
        canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image
        gamepadAPI.update() //checks for button presses/stick movement on the connected controller)
        forge.draw()
        canvas_context.font = "18px comic sans ms"
        canvas_context.fillStyle = "red"
        canvas_context.strokeStyle = "black"
        canvas_context.lineWidth = 4
        canvas_context.strokeText("Forage", forge.x + 20, forge.y+25)
        canvas_context.fillText("Forage", forge.x + 20, forge.y+25)
        pomao.draw()
        // game code goes here
        for (let t = 0; t < enemies.length; t++) {
            enemies[t].draw()
        }
        for (let t = 0; t < enemies.length; t++) {
            enemies[t].point()
        }
        for (let t = 0; t < enemies.length; t++) {
            if (enemies[t].health == 0) {
                let pop = new Pop(enemies[t].body)
                pops.push(pop)
                enemies.splice(t, 1)
            }
        }
        for (let t = 0; t < shots.length; t++) {
            shots[t].move()
            shots[t].life--
            shots[t].draw()
        }
        for (let t = 0; t < shots.length; t++) {
            if (shots[t].life <= 0) {
                pomao.health-=shots[t].damage
                console.log(shots[t])
                shots.splice(t, 1)
            }
        }
        for (let t = 0; t < pops.length; t++) {
           pops[t].draw()
        }
        for (let t = 0; t < pops.length; t++) {
            if (pops[t].time <= 0) {
                pops.splice(t, 1)
            }
        }
        for (let t = 0; t < fruitlist.length; t++) {
            fruitlist[t].draw()
        }
        for (let t = 0; t < fruitlist.length; t++) {
            fruitlist[t].point()
        }
        for (let t = 0; t < fruitlist.length; t++) {
            if (fruitlist[t].marked == 1) {
                fruitlist.splice(t, 1)
            }
        }

        if (enemies.length == 0) {
            time--
            if(time < 0){
                time = 40
                pomao.turn = pomao.maxturn
                if(Math.random()< .5){
                    pomao.maxhealth+=5
                    pomao.health = pomao.maxhealth
                    if(Math.random()< .05){
                        pomao.maxturn++
                    }else{
                        pomao.maxhealth+=5
                        pomao.health = pomao.maxhealth
                    }
                }else{
                    pomao.maxfruits+=1
                    pomao.health = pomao.maxhealth
                    if(Math.random()< .05){
                        pomao.maxturn++
                    }else{
                        pomao.maxfruits+=1
                        pomao.health = pomao.maxhealth
                    }
                }
                elevel++
                enemies = []
                let flevel = elevel
                let t = 0
                while (flevel > 0 && enemies.length < 5) {
                    let level = Math.floor(Math.random() * elevel)
                    flevel -= level
                    let enemy = new Enemy(520 + (t * 105), 200, level)
                    t++
                    enemies.push(enemy)
                }
            }
        }
    }


})
