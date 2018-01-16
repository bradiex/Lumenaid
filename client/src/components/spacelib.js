
function Space () {
  this.testStars = 0

  this.canvas = document.querySelector('#space')
  console.log(this.canvas.parentElement.getBoundingClientRect())
  console.log(this.canvas.parentElement.offsetWidth)
  this.ctx = this.canvas.getContext('2d')

  this.width = this.canvas.parentElement.offsetWidth - 50 || 1000
  this.height = this.canvas.parentElement.offsetHeight - 50 || 1000

  this.canvas.width = this.width
  this.canvas.height = this.height

  this.stars = []

  for (let i = 0; i < this.testStars; i++) {
    let x = Math.round((0.01 + Math.random() * 0.98) * this.width)
    let y = Math.round((0.01 + Math.random() * 0.98) * this.height)
    let length = 1 + Math.random() * 2
    let opacity = Math.random()

    this.stars.push(new Star(x, y, length, opacity))
  }

  let fps = 10
  setInterval(() => {
    this.animate()
  }, 1000 / fps)

  let add = setInterval(() => {
    let x = Math.round(Math.random() * this.width)
    let y = Math.round(Math.random() * this.height)

    let length = 1 + Math.random() * 2
    let opacity = Math.random()

    // Add the the stars array
    this.stars.push(new Star(x, y, length, opacity, 5))
  }, Math.random() * 2000)
  clearInterval(add)

  this.canvas.addEventListener('mousemove', (ev) => {
    console.log(this.getClosestStars(ev.offsetX, ev.offsetY))
  })
}

Space.prototype.animate = function () {
  this.ctx.clearRect(0, 0, this.width, this.height)
  this.stars.forEach(star => {
    star.draw(this.ctx)
  })
}

Space.prototype.setStars = function (stars) {
  this.stars = []
  stars.forEach(star => {
    this.stars.push(new Star(
      Math.round(star.display.pos.x * this.width),
      Math.round(star.display.pos.y * this.height),
      1 + star.display.size * 2,
      Math.random(),
      0,
      star.display.color,
      star.message
    ))
  })
}

Space.prototype.addStar = function (star) {
  this.stars.push(new Star(
    Math.round(star.display.pos.x * this.width),
    Math.round(star.display.pos.y * this.height),
    1 + star.display.size * 2,
    Math.random(),
    5,
    star.display.color,
    star.message
  ))
}

Space.prototype.getClosestStars = function (x, y) {
  return this.stars.filter(star => {
    return Math.sqrt(Math.pow(star.x - x, 2) + Math.pow(star.y - y, 2)) < 10
  }).map(star => star.message + ' ' + star.x + ' ' + star.y).slice(0, 5)
}

function componentToHex (c) {
  var hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

const colors = [
  [144, 180, 255], // O
  [166, 194, 255], // B
  [218, 227, 255], // A
  [240, 240, 253], // F
  [254, 237, 228], // G
  [255, 220, 187], // K
  [255, 177, 98], // M
  [255, 106, 0], // L
  [255, 53, 1] // T
]

/*
function rgbToHex (r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
*/
function getColor (value) {
  let idx = Math.floor(value * 8)
  let color = colors[idx]
  return {
    'comp': color,
    'hex': `#${componentToHex(color[0])}${componentToHex(color[1])}${componentToHex(color[2])}`
  }
}

function Star (x, y, length, opacity, startLength, color, message) {
  this.x = parseInt(x)
  this.y = parseInt(y)
  this.length = parseInt(length)
  this.startLength = parseInt(startLength) || 0
  this.opacity = opacity
  this.factor = 1
  this.increment = Math.random() * 0.06
  this.color = getColor(color || Math.pow(Math.sin(Math.PI * Math.random()), 2))
  this.message = message || 'no message'
}

Star.prototype.draw = function (ctx) {
  ctx.save()

  ctx.translate(this.x, this.y)

  if (this.startLength) {
    this.startLength -= 0.2
    if (this.startLength < 0) {
      this.startLength = 0
    }
    this.opacity = 1.0
  } else {
    // Change the opacity
    if (this.opacity > 1) {
      this.factor = -1
    } else if (this.opacity <= 0.2) {
      this.factor = 1

      // this.x = Math.round(Math.random() * screenW);
      // this.y = Math.round(Math.random() * screenH);
    }

    this.opacity += this.increment * this.factor
  }
  let len = this.length + this.startLength
  ctx.beginPath()
  for (let i = 5; i--;) {
    ctx.lineTo(0, len)
    ctx.translate(0, len)
    ctx.rotate((Math.PI * 2 / 10))
    ctx.lineTo(0, -len)
    ctx.translate(0, -len)
    ctx.rotate(-(Math.PI * 6 / 10))
  }
  ctx.lineTo(0, len)
  ctx.closePath()
  ctx.fillStyle = `rgba(${this.color.comp[0]}, ${this.color.comp[1]}, ${this.color.comp[2]}, ${this.opacity})`
  ctx.shadowBlur = 10
  ctx.shadowColor = this.color.hex
  ctx.fill()

  ctx.restore()
}

export default Space
