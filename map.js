function debug(msg) {
  try {
    document.getElementById('debug').innerHTML = msg + '<br />' +
      document.getElementById('debug').innerHTML;
  } catch (err) {
  }
}

var kBoardWidth = 9;
var kBoardHeight= 9;
var kPieceWidth = 50;
var kPieceHeight= 50;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement;
var gDrawingContext;

function getCursorPosition(e) {
  var x;
  var y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  }
  else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= gCanvasElement.offsetLeft;
  y -= gCanvasElement.offsetTop;
  x = Math.min(x, MAP_WIDTH);
  y = Math.min(y, MAP_HEIGHT);
  var planeX = Math.floor(y / planeHeight);
  var planeY = Math.floor(x / planeWidth);
  return {'x': planeX, 'y': planeY};
}

var hovered;
var active;

function equalCoords(a, b) {
  return a['x'] == b['x'] && a['y'] == b['y'];
}

function onMouseMove(e) {
  var cursor = getCursorPosition(e);
  if (!equalCoords(cursor, hovered)) {
    hovered = cursor;
  }
}

function halmaOnClick(e) {
  getCursorPosition(e);
}

var eternityMap;
var MAP_WIDTH = 750;
var MAP_HEIGHT = 450;
var PLANE_RATIO = 3 / 5;
var MARGIN = 15;
var BORDER = 10;
var planeWidth, planeHeight;

function fitImage(image, fitx, fity) {
  var ratio = 1.0;
  if (image.width > fitx)
    ratio = Math.min(ratio, fitx / image.width);
  if (image.height > fity)
    ratio = Math.min(ratio, fity / image.height);
  gDrawingContext.scale(ratio, ratio);
  // Scaling down also affects fit parameters.
  fitx /= ratio;
  fity /= ratio;
  // Center on both axes by applying an offset.
  offx = (fitx - image.width) / 2;
  offy = (fity - image.height) / 2;
  gDrawingContext.drawImage(image, offx, offy);
}

function drawMap() {
  // Draw map border.
  gDrawingContext.save();
  gDrawingContext.rect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  gDrawingContext.strokeStyle = '#000';
  gDrawingContext.stroke();

  // Distribute all the space among the available planes.
  var bounds = eternityMap.getBounds();
  planeWidth = Math.floor(MAP_WIDTH / bounds['x']['length']);
  planeHeight = Math.floor(MAP_HEIGHT / bounds['y']['length']);

  for (var i = 0; i < eternityMap.map.length; i++) {
    var plane = eternityMap.map[i];
    var x = (plane.x - bounds['x']['min']) * planeWidth;
    var y = (plane.y - bounds['y']['min']) * planeHeight;

    gDrawingContext.save();
    /*
    // Quadratric curves example
    var ctx = gDrawingContext;
    ctx.beginPath();
    ctx.moveTo(75,25);
    ctx.quadraticCurveTo(25,25,25,62.5);
    ctx.quadraticCurveTo(25,100,50,100);
    //ctx.quadraticCurveTo(50,120,30,125);
    ctx.quadraticCurveTo(60,120,65,100);
    ctx.quadraticCurveTo(125,100,125,62.5);
    ctx.quadraticCurveTo(125,25,75,25);
    ctx.stroke();
    */
    gDrawingContext.translate(x, y);
    if (i >= 0) {
      var clr = 5 + i;
      gDrawingContext.fillStyle = '#' + clr + clr + clr;
      gDrawingContext.fillRect(0, 0, planeWidth, planeHeight);
    }
    gDrawingContext.translate(MARGIN, MARGIN);
    fitImage(plane.image, planeWidth - 2 * MARGIN, planeHeight - 2 * MARGIN);
    gDrawingContext.restore();
  }
  gDrawingContext.restore();
}

function initGame() {
  try {
    if (!eternityMap) {
      eternityMap = new EternityMap(38);
      eternityMap.moveTo(0, 0);
      // eternityMap.moveTo(0, 1);
      // eternityMap.moveTo(1, 1);
      // eternityMap.moveTo(2, 1);
      // eternityMap.moveTo(3, 0);
      // eternityMap.moveTo(3, 1);
      // eternityMap.moveTo(3, 2);
      // eternityMap.moveTo(4, 2);
    }
    gCanvasElement = document.getElementById('mapCanvas');
    gCanvasElement.addEventListener("click", halmaOnClick, false);
    gCanvasElement.addEventListener("onmousemove", onMouseMove, false);
    gDrawingContext = gCanvasElement.getContext("2d");
    // Quick fix to image onload: wait a little before drawing :).
    setTimeout('drawMap();', 100);
	  drawMap();
  } catch (err) {
    alert('Error while initializing game: ' + err);
  }
}
