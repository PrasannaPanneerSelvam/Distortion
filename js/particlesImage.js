const PixelEffect = (function () {
  const mouse = { x: undefined, y: undefined, radius: 100 };
  class Particle {
    #originalX;
    #originalY;
    #x;
    #y;
    #color;
    #size;
    #mouseObj;

    constructor(x, y, rgbaValues, mouseObj = {}) {
      this.#originalX = x;
      this.#originalY = y;
      this.#x = x;
      this.#y = y;
      this.#color = rgbaValues || [255, 255, 255];
      this.#size = 1;

      this.#mouseObj = mouseObj;

      this.density = 10;
    }

    draw(ctx) {
      ctx.fillStyle = 'blue';
      ctx.fillStyle = `rgb(${this.#color.join(',')})`;
      ctx.beginPath();
      ctx.arc(this.#x, this.#y, this.#size, 0, 360);
      ctx.closePath();
      ctx.fill();
    }

    update() {
      const { x, y, radius } = this.#mouseObj;
      let dx = x - this.#x,
        dy = y - this.#y,
        distance = Math.sqrt(dx ** 2 + dy ** 2);

      if (radius > distance) {
        const fx = dx / distance,
          fy = dy / distance,
          f = (radius - distance) / radius;

        this.#x -= fx * f * this.density;
        this.#y -= fy * f * this.density;
      } else {
        let dx = this.#x - this.#originalX,
          dy = this.#y - this.#originalY;

        if (dx) this.#x -= dx / 10;
        if (dy) this.#y -= dy / 10;
      }
      return this;
    }
  }

  class PixelEffect {
    #particleArray = [];
    #pixelArray = [];
    #ctx;
    #canvas;
    #image;

    constructor(canvasObj, ctx, image) {
      this.#canvas = canvasObj;
      this.#ctx = ctx;
      this.#image = image;
      this.#initiate();
    }

    #initiate() {
      this.#setImageData();
      this.#scanImageDataAndCreateParticles();
    }

    #setImageData() {
      const width = this.#image.width,
        height = this.#image.height;

      this.#ctx.drawImage(this.#image, 0, 0, width, height);
      this.#pixelArray = this.#ctx.getImageData(0, 0, width, height);
      this.#ctx.clearRect(0, 0, width, height);
    }

    #scanImageDataAndCreateParticles() {
      const data = this.#pixelArray.data,
        rowCount = this.#image.height,
        colCount = this.#image.width;

      let skip = 5,
        n = 0,
        m = 0;
      for (let row = 0; row < rowCount; row++) {
        m++;
        if (m % skip === 0) {
          m = 0;
        } else {
          continue;
        }
        for (let col = 0; col < colCount; col++) {
          n++;
          if (n % skip === 0) {
            n = 0;
          } else {
            continue;
          }

          const startIndex = row * 4 * rowCount + col * 4,
            rVal = data[startIndex],
            gVal = data[startIndex + 1],
            bVal = data[startIndex + 2],
            aVal = data[startIndex + 3],
            x = col,
            y = row;

          if (aVal !== 0) {
            this.#particleArray.push(
              new Particle(x, y, [rVal, gVal, bVal], mouse)
            );
          }
        }
      }
    }

    render() {
      const arr = this.#particleArray;

      function animate() {
        this.#ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
        arr.forEach(i => i.update().draw(this.#ctx));
        requestAnimationFrame(animate.bind(this));
      }

      animate.call(this);
    }
  }

  PixelEffect.mouseMoveEvent = ({ x, y }) => {
    mouse.x = x;
    mouse.y = y;
  };

  return PixelEffect;
})();

const handleImages = (function () {
  const canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d');

  function setCanvasDimensions() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  setCanvasDimensions();
  window.addEventListener('resize', setCanvasDimensions);

  canvas.addEventListener('mousemove', PixelEffect.mouseMoveEvent);

  function handleImages(imageUrl) {
    const htmlImage = new Image();
    htmlImage.src = imageUrl;
    htmlImage.height = 400;
    htmlImage.width = 400;

    htmlImage.onload = function () {
      const effect = new PixelEffect(canvas, ctx, htmlImage);
      effect.render();
    };
  }
  return handleImages;
})();

handleImages('./images/html.png');
