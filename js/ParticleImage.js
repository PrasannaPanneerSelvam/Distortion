const PixelEffect = (function () {
  // const mouse = { x: undefined, y: undefined, radius: 50 };
  class Particle {
    #originalX;
    #originalY;
    #x;
    #y;
    #color;
    #squareSize;
    #blockRadius;
    #mouseObj;

    constructor(x, y, rgbaValues, options = {}) {
      this.#originalX = x;
      this.#originalY = y;
      this.#x = x;
      this.#y = y;
      this.#color = rgbaValues || [255, 255, 255];
      this.#squareSize = 4.5;
      this.#blockRadius = 2.5;

      const mouse = { x: undefined, y: undefined, radius: 50 };
      this.#mouseObj = options.mouse ?? mouse;

      this.density = 10;
    }

    draw(ctx) {
      ctx.fillStyle = 'blue';
      ctx.fillStyle = `rgb(${this.#color.join(',')})`;
      // this.#drawCircularBlock(ctx);
      this.#drawSquareBlock(ctx);
    }

    #drawSquareBlock(ctx) {
      ctx.fillRect(this.#x, this.#y, this.#squareSize, this.#squareSize);
    }

    #drawCircularBlock(ctx) {
      ctx.beginPath();
      ctx.arc(this.#x, this.#y, this.#blockRadius, 0, 360);
      ctx.closePath();
      ctx.fill();
    }

    update(blast) {
      let { x, y, radius } = this.#mouseObj;

      if (blast !== 0) {
        radius += blast;
      }

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
    #canvasOffset;
    #contentOffset;
    #mouseObj;

    constructor(canvasObj, ctx, image, contentOffset = { x: 0, y: 0 }) {
      this.#canvas = canvasObj;
      this.#ctx = ctx;
      this.#image = image;
      this.blast = 0;

      this.#mouseObj = { x: undefined, y: undefined, radius: 50 };

      const { x, y } = canvasObj.getBoundingClientRect();
      this.#canvasOffset = { x, y };
      this.#contentOffset = contentOffset;

      this.#initiate();
    }

    #initiate() {
      this.#setImageData();
      this.#scanImageDataAndCreateParticles();
    }

    #setImageData() {
      const width = this.#image.width,
        height = this.#image.height,
        startX = this.#contentOffset.x,
        startY = this.#contentOffset.y;

      this.#ctx.drawImage(this.#image, startX, startY, width, height);
      this.#pixelArray = this.#ctx.getImageData(startX, startY, width, height);
      this.#ctx.clearRect(startX, startY, width, height);
    }

    #scanImageDataAndCreateParticles() {
      const data = this.#pixelArray.data,
        rowCount = this.#image.height,
        colCount = this.#image.width,
        startX = this.#contentOffset.x,
        startY = this.#contentOffset.y,
        mouse = this.#mouseObj;

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

          const startIndex = row * 4 * colCount + col * 4,
            rVal = data[startIndex],
            gVal = data[startIndex + 1],
            bVal = data[startIndex + 2],
            aVal = data[startIndex + 3],
            x = col + startX,
            y = row + startY;

          if (aVal !== 0) {
            this.#particleArray.push(
              new Particle(x, y, [rVal, gVal, bVal], { mouse })
            );
          }
        }
      }
    }

    render() {
      const arr = this.#particleArray,
        { width, height } = this.#canvas,
        ctx = this.#ctx;

      function animate() {
        ctx.clearRect(0, 0, width, height);
        const b = this.blast;
        arr.forEach(i => i.update(b).draw(ctx));
        if (this.blast > 0) this.blast -= 2;
        requestAnimationFrame(animate.bind(this));
      }

      animate.call(this);
    }

    // ? Should this api need to be public ?
    mountMouseEvents(listenerLayout) {
      const eventMap = {
        mousemove: this.#mousemoveEvent(),
        mouseleave: this.#mouseleaveEvent(),
        mouseenter: this.#mouseenterEvent(),
        click: this.#clickEvent(),
      };

      for (const [eventName, eventCallback] of Object.entries(eventMap))
        listenerLayout.addEventListener(eventName, eventCallback.bind(this));
    }

    #mousemoveEvent() {
      const store = this.#canvasOffset,
        mouse = this.#mouseObj;

      return function ({ x, y }) {
        mouse.x = x - store.x;
        mouse.y = y - store.y;
      };
    }

    #clickEvent() {
      return () => (this.blast = 100);
    }

    #mouseenterEvent() {
      const mouse = this.#mouseObj;
      return function ({ x, y }) {
        mouse.x = x;
        mouse.y = y;
      };
    }

    #mouseleaveEvent() {
      const mouse = this.#mouseObj;
      return function () {
        mouse.x = 0;
        mouse.y = 0;
      };
    }
  }

  return PixelEffect;
})();

export default PixelEffect;