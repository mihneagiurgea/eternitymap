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

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function MapPoint(point) {
  this.x = Math.floor(point.x / planeWidth);
  this.y = Math.floor(point.y / planeHeight);
  // Apply eternityMap offsets.
  var bounds = eternityMap.getBounds();
  this.x += bounds['x']['min'];
  this.y += bounds['y']['min'];
}

function equalCoords(a, b) {
  if (!a || !b) return false;
  return a['x'] == b['x'] && a['y'] == b['y'];
}

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
  return new Point(x, y);
}

function getMapPoint(e) {
  var cursor = getCursorPosition(e);
  return new MapPoint(cursor);
}

var hovered;
var active;

function onMouseMove(e) {
  try {
    var mapPoint = getMapPoint(e);
    if (!equalCoords(mapPoint, hovered)) {
      hovered = mapPoint;
      drawMap();
      // debug('MapPoint: ' + hovered.x + ', ' + hovered.y);
    }
  } catch (err) {
    alert('Error in onMouseMove: ' + err);
  }
}

function onClick(e) {
  try {
    var mapPoint = getMapPoint(e);
    var validMove = eternityMap.moveTo(mapPoint.x, mapPoint.y);
    if (validMove) {
      debug('Valid move: ' + mapPoint.x + ', ' + mapPoint.y);
      setTimeout('drawMap();', 100);
    } else {
      debug('Invalid move: ' + mapPoint.x + ', ' + mapPoint.y);
    }

  } catch (err) {
    alert('Error in onMouseMove: ' + err);
  }
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
  gDrawingContext.fillStyle = '#fff';
  gDrawingContext.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  gDrawingContext.rect(0, 0, MAP_WIDTH, MAP_HEIGHT);
  gDrawingContext.strokeStyle = '#000';
  gDrawingContext.stroke();

  // Distribute all the space among the available planes.
  var bounds = eternityMap.getBounds();
  var plane, x, y;
  planeWidth = Math.floor(MAP_WIDTH / bounds['x']['length']);
  planeHeight = Math.floor(MAP_HEIGHT / bounds['y']['length']);

  for (var i = 0; i < eternityMap.map.length; i++) {
    plane = eternityMap.map[i];
    x = (plane.x - bounds['x']['min']) * planeWidth;
    y = (plane.y - bounds['y']['min']) * planeHeight;

    gDrawingContext.save();
    gDrawingContext.translate(x, y);
    if (equalCoords(plane, active)) {
      gDrawingContext.fillStyle = '#edf';
      gDrawingContext.fillRect(0, 0, planeWidth, planeHeight);
    }
    gDrawingContext.translate(MARGIN, MARGIN);
    fitImage(plane.image, planeWidth - 2 * MARGIN, planeHeight - 2 * MARGIN);
    gDrawingContext.restore();

  }

  gDrawingContext.restore();

  // Pop-out hovered plane.
  if (hovered) {
    plane = eternityMap.findPlane(hovered.x, hovered.y);
    if (plane) {
      gDrawingContext.save();

      // Put the image centered in a box. The box is limited in size and
      // has the same center as the smaller image in the eternityMap.
      var boxx, boxy;
      if (plane.image.width > plane.image.height) {
        // Horizontal-style
        boxx = 400;
        boxy = 279;
      }
      else {
        // Vertical-style
        boxx = 375;
        boxy = 470;
      }
      x = (plane.x - bounds['x']['min']) * planeWidth;
      y = (plane.y - bounds['y']['min']) * planeHeight;
      // Align centers.
      x = x + (planeWidth - boxx) / 2;
      y = y + (planeHeight - boxy) / 2;
      x = Math.max(x, 0);
      y = Math.max(y, 0);
      if (x + boxx >= MAP_WIDTH)
        x = MAP_WIDTH - boxx;
      if (y + boxy >= MAP_HEIGHT)
        y = MAP_HEIGHT - boxy;
      gDrawingContext.translate(x, y);
      fitImage(plane.image, boxx, boxy);
      // gDrawingContext.drawImage(plane.image, 0, 0);

      gDrawingContext.restore();
    }
  }


}

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

function initGame() {
  try {
    if (!eternityMap) {
      eternityMap = new EternityMap(38);
      eternityMap.moveTo(0, 0);
      active = {'x': 0, 'y': 0};
      // eternityMap.moveTo(0, 1);
      // eternityMap.moveTo(1, 1);
      // eternityMap.moveTo(2, 1);
      // eternityMap.moveTo(3, 0);
      // eternityMap.moveTo(3, 1);
      // eternityMap.moveTo(3, 2);
      // eternityMap.moveTo(4, 2);
    }
    gCanvasElement = document.getElementById('mapCanvas');
    MAP_WIDTH = gCanvasElement.width;
    MAP_HEIGHT = gCanvasElement.height;
    gCanvasElement.addEventListener("click", onClick, false);
    gCanvasElement.addEventListener("mousemove", onMouseMove, false);
    gDrawingContext = gCanvasElement.getContext("2d");
    // Quick fix to image onload: wait a little before drawing :).
    setTimeout('drawMap();', 100);
  } catch (err) {
    alert('Error while initializing game: ' + err);
  }
}
