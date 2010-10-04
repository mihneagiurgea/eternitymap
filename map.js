function debug(msg) {
  try {
    document.getElementById('debug').innerHTML = msg + '<br />' +
      document.getElementById('debug').innerHTML;
  } catch (err) {
  }
}

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
  var x, y;
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

function delayedMouseMove(x, y) {
  // Redraw map only if cursor is in the same spot.
  if (equalCoords(hovered, new Point(x, y))) {
    drawMap();
  }
}

function onMouseMove(e) {
  try {
    var mapPoint = getMapPoint(e);
    if (!equalCoords(mapPoint, hovered)) {
      hovered = mapPoint;
      setTimeout('delayedMouseMove(' + mapPoint.x + ', ' + mapPoint.y + ')', 500);
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
      alert('You find that your planeswalking powers are somewhat limited. You cannot travel that far...');
      debug('Invalid move: ' + mapPoint.x + ', ' + mapPoint.y);
    }

  } catch (err) {
    alert('Error in onMouseMove: ' + err);
  }
}

var eternityMap;
var MAP_WIDTH, MAP_HEIGHT;
var MARGIN = 10;
var planeWidth, planeHeight;

function fitImage(image, fitx, fity) {
  var ratio;
  ratio = Math.min(fitx / image.width, fity / image.height);
  ratio = Math.min(ratio, 1.5);
  gDrawingContext.scale(ratio, ratio);
  // Scaling down also affects fit parameters.
  fitx /= ratio;
  fity /= ratio;
  // Center on both axes by applying an offset.
  offx = (fitx - image.width) / 2;
  offy = (fity - image.height) / 2;
  gDrawingContext.drawImage(image, offx, offy);
}

function limitPlaneSize(image, height) {
  var boxx, boxy, width;
  if (!height) {
    // Image passed as 1st parameter.
    width = image.width;
    height = image.height;
  } else {
    // Width, height passed as parameters.
    width = image;
  }
  // Image sizes: (620, 433), (400, 279), (350, 450)
  if (width > height) {
    // Horizontal-style
    boxx = 620;
    boxy = 433;
  } else {
    // Vertical-style
    boxx = 420;
    boxy = 540;
  }
  return [boxx, boxy];
}

function drawMap() {
  // Draw map border.
  gDrawingContext.save();
  gDrawingContext.fillStyle = '#fef5ef';
  gDrawingContext.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  // Distribute all the space among the available planes.
  var bounds = eternityMap.getBounds();
  var plane, x, y, temp;
  planeWidth = Math.floor(MAP_WIDTH / bounds['x']['length']);
  planeHeight = Math.floor(MAP_HEIGHT / bounds['y']['length']);

  for (var i = 0; i < eternityMap.map.length; i++) {
    plane = eternityMap.map[i];
    x = (plane.x - bounds['x']['min']) * planeWidth;
    y = (plane.y - bounds['y']['min']) * planeHeight;

    gDrawingContext.save();
    gDrawingContext.translate(x, y);
    if (equalCoords(plane, eternityMap.active)) {
      var halfx = planeWidth / 2;
      var halfy = planeHeight / 2;
      var radgrad = gDrawingContext.createRadialGradient(halfx, halfy,
                            planeWidth * 0.10, halfx, halfy, planeWidth * 0.55);
      radgrad.addColorStop(0, '#765cad');
      radgrad.addColorStop(0.95, '#eee2fc');
      radgrad.addColorStop(1, '#fef5ef');

      gDrawingContext.fillStyle = radgrad;
      gDrawingContext.fillRect(0, 0, planeWidth, planeHeight);
    }
    gDrawingContext.translate(MARGIN, MARGIN);
    fitImage(plane.image, planeWidth - 2 * MARGIN, planeHeight - 2 * MARGIN);
    gDrawingContext.restore()
  }

  // Highlight hellride.
  if (hovered && eternityMap.validHellride(hovered.x, hovered.y)) {
    x = (hovered.x - bounds['x']['min']) * planeWidth;
    y = (hovered.y - bounds['y']['min']) * planeHeight;

    gDrawingContext.save();
    gDrawingContext.translate(x, y);

    var halfx = planeWidth / 2;
    var halfy = planeHeight / 2;
    var radgrad = gDrawingContext.createRadialGradient(halfx - 10, halfy + 15,
                          planeHeight * 0.20, halfx, halfy, planeHeight * 0.45);
    radgrad.addColorStop(0, '#000');
    radgrad.addColorStop(0.95, '#f00');
    radgrad.addColorStop(1, '#fef5ef');

    gDrawingContext.fillStyle = radgrad;
    gDrawingContext.fillRect(0, 0, planeWidth, planeHeight);
    gDrawingContext.restore()

  }

  gDrawingContext.restore();

  // Pop-out hovered plane only if > 1 planes.
  if (hovered && eternityMap.map.length > 1) {
    plane = eternityMap.findPlane(hovered.x, hovered.y);
    if (plane) {
      gDrawingContext.save();

      // Put the image centered in a box. The box is limited in size and
      // has the same center as the smaller image in the eternityMap.
      var boxx, boxy, temp;
      temp = limitPlaneSize(plane.image);
      boxx = temp[0];
      boxy = temp[1];
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

      gDrawingContext.restore();
    }
  }
}

function initGame() {
  try {
    eternityMap = new EternityMap(38);
    // eternityMap.moveTo(0, 0);

    gCanvasElement = document.getElementById('mapCanvas');
    gCanvasElement.width = document.width - 50;
    gCanvasElement.height = document.height - 50;
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
