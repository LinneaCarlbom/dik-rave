
const WIDTH = 1300;
const HEIGHT = 800;

const cols = 64;   // färre = mjukare former och inga ansiktsdrag
let rows;
let video;
let values = [];
let path;

// lila, röd, orange, gul, ljusgul (ett lager per färg)
const colors = ['#5a2dff', '#8a22d0', '#d0208a', '#ff2a50', '#ff8c1a', '#ffd21f']; 
const brightness = [0.2, 0.35, 0.5, 0.65, 0.8, 0.9];

function setup() {
  createCanvas(WIDTH, HEIGHT);
  pixelDensity(1);
  rows = round(cols * HEIGHT / WIDTH);

  video = createCapture({
    video: { width: WIDTH, height: HEIGHT },
    audio: false
  });
  video.size(cols, rows);
  video.hide();

  path = d3.geoPath(null, drawingContext); // ritar d3-former på p5:s canvas
}

function draw() {
  background('#3627a3'); 
  video.loadPixels();
  if (video.pixels.length === 0) return;

  for (let i = 0; i < cols * rows; i++) {
    const p = i * 4;
    const b = (video.pixels[p] + video.pixels[p + 1] + video.pixels[p + 2]) / 3;
    const v = constrain((b - 40) / 180, 0, 1);   // ljus = varm
    values[i] = lerp(values[i] ?? v, v, 0.4);    // mjukar upp flimmer
  }

  // Skapa formerna
  const silhouettes = d3.contours()
    .size([cols, rows])
    .thresholds(brightness)(values);

  // Rita dem, spegelvända och förstorade till hela canvasen
  drawingContext.save();
  drawingContext.translate(width, 0);
  drawingContext.scale(-width / cols, height / rows);
  silhouettes.forEach((silhouette, i) => {
    drawingContext.fillStyle = colors[i];
    drawingContext.beginPath();
    path(silhouette);
    drawingContext.fill();
  });
  drawingContext.restore();
}