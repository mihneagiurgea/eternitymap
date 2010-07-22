/* Eternity map implementation */

function rand(limit) {
  // Returns a random integer in interval [0, limit).
  return Math.floor(Math.random() * limit);
}

function shuffle(arr) {
  N = arr.length;
  for (var i = 0; i < N; i++) {
    r = i + rand(N - i);
    if (r != i) {
      t = arr[i];
      arr[i] = arr[r];
      arr[r] = t;
    }
  }
}

function Plane(src, x, y) {
  this.src = src;
  this.x = x;
  this.y = y;
  this.image = new Image();
  this.image.src = 'images/' + src;

  this.manhattan = function(destX, destY) {
    return Math.abs(destX - this.x) + Math.abs(destY - this.y);
  }
}

function EternityMap(nr, distance) {
  // Bind methods first.
  this._getBounds = _getBounds;
  this.getBounds = getBounds;
  this.findPlane = findPlane;
  this.pushPlane = pushPlane;
  this.moveTo = moveTo;

  // Initialize object.
  if (!distance)
    this.distance = 3;
  else
    this.distance = distance;
  this.planes = new Array();
  for (var i = 0; i < nr; i++)
    this.planes[i] = i + 1 + '.jpg';
  shuffle(this.planes);
  this.map = Array();
  this.pushPlane(0, 0);
}

function _getBounds(dimension) {
  with (this) {
    var vmin, vmax, value;
    // Init min & max.
    vmin = vmax = this.map[0][dimension];
    for (var i = 0; i < this.map.length; i++) {
      value = this.map[i][dimension];
      vmin = Math.min(vmin, value);
      vmax = Math.max(vmax, value);
    }
    return {'min': vmin, 'max': vmax, 'length': vmax - vmin + 1}
  }
}

function getBounds() {
  with (this) {
    var result = {};
    result['x'] = this._getBounds('x');
    result['y'] = this._getBounds('y');
    return result;
  }
}

function findPlane(x, y) {
  with (this) {
    for (var i = 0; i < this.map.length; i++)
      if (this.map[i].x == x && this.map[i].y == y)
        return map[i];
    return null;
  }
}

function pushPlane(x, y) {
  // Pop a plane from planes deck, and push it into map at (x, y),
  // only if that location is empty.
  with (this) {
    if (!this.findPlane(x, y)) {
      // alert('Pushing ' + x + ',' + y);
      src = this.planes.pop();
      plane = new Plane(src, x, y);
      this.map.push(plane);
    }
  }
}

function moveTo(x, y) {
  with (this) {
    // Hellride - make sure a plane exists @ (x, y).
    this.pushPlane(x, y);
    // Check that adjacent planes are visible.
    dx = [0, 1, 0, -1];
    dy = [-1, 0, 1, 0];
    for (var i = 0; i < 4; i++) {
      this.pushPlane(x + dx[i], y + dy[i]);
    }
    // Drop planes that are too far away - iterate backwards because we are
    // deleting from this array while iterating.
    for (var i = this.map.length - 1; i >= 0; i--) {
      plane = this.map[i];
      if (plane.manhattan(x, y) > this.distance) {
        plane = this.map.splice(i, 1)[0];
        this.planes.push(plane.src);
      }
    }
    // Shuffle removed planes back into plane deck.
    shuffle(this.planes);
    return true;
  }
}
