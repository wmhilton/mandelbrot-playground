import { HSVtoRGB } from './utils/HSVtoRGB.js'
import { iter } from './utils/iter.js'
import { iter as bigIter } from './utils/decimal/iter.js'
import Decimal from 'decimal.js'

var ctx
var WIDTH
var HEIGHT
var imageData
let bounds = [{"r":0.2361513689220573,"i":-0.5210970613723728},{"r":0.23662026741217732,"i":-0.5207844623789595}]

onmessage = function(evt) {
  console.log(evt.data)
  if (evt.data.WIDTH) {
    WIDTH = evt.data.WIDTH
  }
  if (evt.data.HEIGHT) {
    HEIGHT = evt.data.HEIGHT
  }
  if (evt.data.canvas) {
    var canvas = evt.data.canvas;
    ctx = canvas.getContext("2d");
    imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    draw();
  }
  if (evt.data.bounds) {
    bounds = evt.data.bounds
    draw();
  }
  if (evt.data.bigBounds) {
    bigBounds = [
      {
        "r": new Decimal(evt.data.bigBounds[0].r),
        "i": new Decimal(evt.data.bigBounds[0].i)
      },
      {
        "r": new Decimal(evt.data.bigBounds[1].r),
        "i": new Decimal(evt.data.bigBounds[1].i)
      }
    ]
  }
};


const draw = () => {
  let start = performance.now();

  let finished = drawCanvas(
    WIDTH,
    HEIGHT,
    bounds[0].r,
    bounds[0].i,
    bounds[1].r,
    bounds[1].i,
    imageData.data
  );
  if (!finished) return;

  console.log("draw3");
  ctx.putImageData(imageData, 0, 0);
  let finish = performance.now();
  self.postMessage({done: true})
};

const drawCanvas = (
  canvasWidth,
  canvasHeight,
  lowerBoundr,
  lowerBoundi,
  upperBoundr,
  upperBoundi,
  data
) => {
  let n = 0;

  const gWIDTH = upperBoundr - lowerBoundr;
  const gLEFT = lowerBoundr;
  const scaleX = gWIDTH / (canvasWidth - 1);

  const gHEIGHT = upperBoundi - lowerBoundi;
  const gTOP = upperBoundi;
  const scaleY = -gHEIGHT / (canvasHeight - 1);

  // let val;
  let color;
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      let count = Math.max(0, iter(x * scaleX + gLEFT, y * scaleY + gTOP));
      color = count === 1024 ? {r: 0, g: 0, b: 0} : HSVtoRGB(
        count / 100.0,
        0.9,
        1.0
      );
      data[n] = color.r;
      data[n + 1] = color.g;
      data[n + 2] = color.b;
      data[n + 3] = 255;
      n += 4;
    }
  }
  return true;
};


const bigDrawCanvas = (
  canvasWidth,
  canvasHeight,
  lowerBoundr,
  lowerBoundi,
  upperBoundr,
  upperBoundi,
  data
) => {
  let n = 0;

  const gWIDTH = upperBoundr.minus(lowerBoundr);
  const gLEFT = lowerBoundr;
  const scaleX = gWIDTH.dividedBy(canvasWidth);

  const gHEIGHT = upperBoundi.minus(lowerBoundi);
  const gTOP = upperBoundi;
  const scaleY = gHEIGHT.dividedBy(canvasHeight);

  // let val;
  let color;
  for (let y = 0; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      let count = Math.max(0, bigIter(scaleX.times(x).plus(gLEFT), scaleY.times(-y).plus(gTOP)));
      color = count === 1024 ? {r: 0, g: 0, b: 0} : HSVtoRGB(
        count / 100.0,
        0.9,
        1.0
      );
      data[n] = color.r;
      data[n + 1] = color.g;
      data[n + 2] = color.b;
      data[n + 3] = 255;
      n += 4;
    }
    console.log((y / 4).toFixed(0) + '%')
  }
  return true;
};