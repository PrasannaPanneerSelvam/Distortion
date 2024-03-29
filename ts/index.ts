import PixelEffect, { Maybe } from './ParticleImage';
import DemoPoints from './DemoPoints';

let showDemoOnLoop = false;

class DistortionEffect {
  private canvas: Maybe<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  private loadedImageHeight: number;
  private loadedImageWidth: number;
  private height: number;
  private width: number;
  private aspectRatio: number;

  private htmlImage: HTMLImageElement;
  private pixelEffect: PixelEffect;
  private mouseRadius: number;

  private timeoutIds: NodeJS.Timeout[];

  // ? Do we need to have this based on screen dimensions
  verticalPadding = 30;
  horizontalPadding = 80;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as Maybe<HTMLCanvasElement>;
    this.ctx = this.canvas?.getContext('2d');
    this.pixelEffect = null;
    this.mouseRadius = 50;

    window.addEventListener('resize', this.setCanvasDimensions.bind(this));
  }

  updateMouseRadius(inputRadius: number) {
    this.pixelEffect.updateMouseRadius(inputRadius);
    this.mouseRadius = inputRadius;
  }

  private alterHeightAndCreateCanvas() {
    // TODO :: Compute based on max dimension
    this.htmlImage.height = 400;
    this.htmlImage.width = this.htmlImage.height * this.aspectRatio;

    this.height = this.htmlImage.height;
    this.width = this.htmlImage.width;

    this.setCanvasDimensions();

    const effect = new PixelEffect(
      this.canvas,
      this.ctx,
      this.htmlImage,
      {
        x: this.horizontalPadding,
        y: this.verticalPadding,
      },
      this.mouseRadius
    );

    if (!showDemoOnLoop) effect.mountMouseEvents(this.canvas);
    effect.render();

    this.pixelEffect = effect;
    this.timeoutIds = [];
  }

  showDemo() {
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];

    DemoPoints.forEach((point, idx, arr) =>
      this.timeoutIds.push(
        setTimeout(() => {
          this.pixelEffect.updateMousePoints(point);
          if (idx === arr.length - 1) {
            this.timeoutIds = [];
            if (showDemoOnLoop) this.showDemo();
          }
        }, point.t)
      )
    );
  }

  private setCanvasDimensions() {
    this.canvas.height = this.height + 2 * this.verticalPadding;
    this.canvas.width = this.width + 2 * this.horizontalPadding;
  }

  handleImage(inputData: string | File) {
    this.htmlImage = new Image();

    this.htmlImage.onload = () => {
      this.loadedImageHeight = this.htmlImage.height;
      this.loadedImageWidth = this.htmlImage.width;

      this.aspectRatio = this.loadedImageWidth / this.loadedImageHeight;

      this.alterHeightAndCreateCanvas();

      if (showDemoOnLoop) this.showDemo();
    };

    if (typeof inputData === 'string') {
      this.htmlImage.src = inputData;
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.htmlImage.src = event.target.result as string;
      };
      reader.readAsDataURL(inputData);
    }
  }
}

window.onload = function () {
  const DistortionObject = new DistortionEffect('myCanvas');

  if (window.location.hash === 'demo') {
    showDemoOnLoop = true;
    ['input-image-holder', 'src-footer'].forEach((_id) => {
      document.getElementById(_id).style.display = 'none';
    });
  }

  // Default image for preview
  DistortionObject.handleImage('./images/html.svg');

  const imageInput = document.getElementById('input-image') as Maybe<HTMLInputElement>;

  imageInput?.addEventListener('change', () =>
    DistortionObject.handleImage(imageInput.files[0])
  );
};