type Maybe<a> = a | undefined | null

interface MouseObj {
  x: Maybe<number>,
  y: Maybe<number>,
  radius: number
}

interface Point {
  x: number,
  y: number
}

class Particle {
  private originalX: number;
  private originalY: number;
  private x: number;
  private y: number;
  private color: number[];
  private squareSize: number;
  private blockRadius: number;
  private mouseObj: MouseObj;

  density: number;

  constructor(x: number, y: number, rgbaValues: number[], options: { mouse: Maybe<MouseObj> }) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.color = rgbaValues || [255, 255, 255];
    this.squareSize = 4.5;
    this.blockRadius = 2.5;

    const mouse: MouseObj = { x: undefined, y: undefined, radius: 50 };
    this.mouseObj = options?.mouse ?? mouse;

    this.density = 10;
  }

  updateMouseRadius(inp: number) {
    this.mouseObj.radius = inp;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'blue';
    ctx.fillStyle = `rgb(${this.color.join(',')})`;
    // this.drawCircularBlock(ctx);
    this.drawSquareBlock(ctx);
  }

  private drawSquareBlock(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(this.x, this.y, this.squareSize, this.squareSize);
  }

  private drawCircularBlock(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.blockRadius, 0, 360);
    ctx.closePath();
    ctx.fill();
  }

  update(blast: number) {
    let { x, y, radius } = this.mouseObj;

    if (blast !== 0) {
      radius += blast;
    }

    let dx = x - this.x,
      dy = y - this.y,
      distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (radius > distance) {
      const fx = dx / distance,
        fy = dy / distance,
        f = (radius - distance) / radius;

      this.x -= fx * f * this.density;
      this.y -= fy * f * this.density;
    } else {
      let dx = this.x - this.originalX,
        dy = this.y - this.originalY;

      if (dx) this.x -= dx / 10;
      if (dy) this.y -= dy / 10;
    }
    return this;
  }
}

class PixelEffect {
  private particleArray: Particle[] = [];
  private pixelArray: ImageData;// = [];
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private image;
  private canvasOffset: Point;
  private contentOffset: Point;
  private mouseObj: MouseObj;

  blast: number;

  constructor(canvasObj: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement, contentOffset: Point = { x: 0, y: 0 }, mouseRadius = 50) {
    this.canvas = canvasObj;
    this.ctx = ctx;
    this.image = image;
    this.blast = 0;

    this.mouseObj = { x: undefined, y: undefined, radius: mouseRadius };

    const { x, y } = canvasObj.getBoundingClientRect();
    this.canvasOffset = { x, y };
    this.contentOffset = contentOffset;

    this.initiate();
  }

  private initiate() {
    this.setImageData();
    this.scanImageDataAndCreateParticles();
  }

  private setImageData() {
    const width = this.image.width,
      height = this.image.height,
      startX = this.contentOffset.x,
      startY = this.contentOffset.y;

    this.ctx.drawImage(this.image, startX, startY, width, height);
    this.pixelArray = this.ctx.getImageData(startX, startY, width, height);
    this.ctx.clearRect(startX, startY, width, height);
  }

  private scanImageDataAndCreateParticles() {
    const data = this.pixelArray.data,
      rowCount = this.image.height,
      colCount = this.image.width,
      startX = this.contentOffset.x,
      startY = this.contentOffset.y,
      mouse = this.mouseObj;

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
          this.particleArray.push(
            new Particle(x, y, [rVal, gVal, bVal], { mouse })
          );
        }
      }
    }
  }

  render() {
    const arr = this.particleArray,
      { width, height } = this.canvas,
      ctx = this.ctx;

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
  mountMouseEvents(listenerLayout: HTMLElement) {
    const eventMap = {
      mousemove: this.mousemoveEvent(),
      mouseleave: this.mouseleaveEvent(),
      mouseenter: this.mouseenterEvent(),
      click: this.clickEvent(),
    };

    for (const [eventName, eventCallback] of Object.entries(eventMap))
      listenerLayout.addEventListener(eventName, eventCallback.bind(this));
  }

  private mousemoveEvent() {
    const store = this.canvasOffset,
      mouse = this.mouseObj;

    return function ({ x, y }: Point) {
      mouse.x = x - store.x;
      mouse.y = y - store.y;
    };
  }

  updateMousePoints({ x, y }: Point) {
    this.mouseObj.x = x;
    this.mouseObj.y = y;
  }

  private clickEvent() {
    return () => (this.blast = 100);
  }

  private mouseenterEvent() {
    const mouse = this.mouseObj;
    return function ({ x, y }: Point) {
      mouse.x = x;
      mouse.y = y;
    };
  }

  private mouseleaveEvent() {
    const mouse = this.mouseObj;
    return function () {
      mouse.x = 0;
      mouse.y = 0;
    };
  }

  updateMouseRadius(inputRadius: number) {
    this.particleArray.forEach((particle) =>
      particle.updateMouseRadius(inputRadius)
    );
  }
}

export { Maybe }

export default PixelEffect;