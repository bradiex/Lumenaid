
const cannyEdgeDetector = require('canny-edge-detector')
const Image = require('image-js').Image

const ImageJS = require('imagejs')
const fs = require('fs')
let bmp = new ImageJS.Bitmap()

function tt() {

  return new Promise((resolve, reject) => {

Image.load('test2.png').then((img) => {
  let grey = img.grey()
  let edge = cannyEdgeDetector(grey, { lowThreshold: 10, highThreshold: 255, gaussianBlur: 1.1 })
  // edge.save('edge.png')
  bmp.readFile('edge.png').then(() => {
    let blurred = bmp.blur()
    resolve(getProbArray(blurred))
    // blurred.writeFile('edge.png').then()
  })
}).catch(err => {
  console.error(err)
})

function getProbArray(bmp) {
  console.log(bmp._data.data.length)
  let view = new Uint32Array(bmp._data.data)
  console.log(view.length)
  let values = []
  let total = 0
  for (let i = 0; i < view.length; i+=4) {
    values.push(view[i])
    total += view[i]
  }
  for (let i = 0; i < values.length; i++) {
    values[i] /= total
    if (values[i] != 0) {
      // console.log(values[i])
    }
    if (values[i] == 0) {
      values[i] = 0.00000015
    }
  }
  for (let i = 1; i < values.length; i++) {
    values[i] += values[i-1]
    if (values[i] != 0) {
      // console.log(values[i])
    }
  }


  let positions = []
  for (let i = 0; i < 1000; i++) {
    let t = Math.random()
    let pos = values.findIndex(v => v > t)
    let x = Math.floor(pos % 1140)
    let y = Math.floor(pos / 1140)
    positions.push({
      x: x,
      y: y
    })
  }
  return positions
}

})

}
/*
tt().then(pos => {
  console.log(pos)
})
*/
module.exports = tt
/*
const cannyEdgeDetector = require('canny-edge-detector')

const ImageJS = require('imagejs')

let bmp = new ImageJS.Bitmap()
bmp.readFile('test.jpg').then(() => {
  cannyEdgeDetector(bmp)
  console.log('ready')
  let blurred = bmp.blur()
  blurred.writeFile('out.jpg')
  bmp.negative().writeFile('neg.jpg')
})
*/

let arr = new ArrayBuffer(16*100)
let view = new Uint32Array(arr)
console.log(view.length)