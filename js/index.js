import PixelEffect from './ParticleImage.js';

class DistortionEffect {
  #canvas;
  #ctx;

  #loadedImageHeight;
  #loadedImageWidth;
  #height;
  #width;
  #aspectRatio;

  #htmlImage;

  // ? Do we need to have this based on screen dimensions
  verticalPadding = 30;
  horizontalPadding = 80;

  constructor(canvasId) {
    (this.#canvas = document.getElementById(canvasId)),
      (this.#ctx = this.#canvas.getContext('2d'));

    window.addEventListener('resize', this.#setCanvasDimensions.bind(this));
  }

  #alterHeightAndCreateCanvas() {
    // TODO :: Compute based on max dimension
    this.#htmlImage.height = 400;
    this.#htmlImage.width = this.#htmlImage.height * this.#aspectRatio;

    this.#height = this.#htmlImage.height;
    this.#width = this.#htmlImage.width;

    this.#setCanvasDimensions();

    const effect = new PixelEffect(this.#canvas, this.#ctx, this.#htmlImage, {
      x: this.horizontalPadding,
      y: this.verticalPadding,
    });

    effect.mountMouseEvents(this.#canvas);
    effect.render();
  }

  #setCanvasDimensions() {
    this.#canvas.height = this.#height + 2 * this.verticalPadding;
    this.#canvas.width = this.#width + 2 * this.horizontalPadding;
  }

  handleImage(inputData) {
    this.#htmlImage = new Image();

    this.#htmlImage.onload = () => {
      this.#loadedImageHeight = this.#htmlImage.height;
      this.#loadedImageWidth = this.#htmlImage.width;

      this.#aspectRatio = this.#loadedImageWidth / this.#loadedImageHeight;

      this.#alterHeightAndCreateCanvas();
    };

    if (typeof inputData === 'string') {
      this.#htmlImage.src = inputData;
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.#htmlImage.src = event.target.result;
      };
      reader.readAsDataURL(inputData);
    }
  }
}

const DistortionObject = new DistortionEffect('myCanvas');

// Default image for preview
DistortionObject.handleImage('./images/html.png');

const imageInput = document.getElementById('input-image');
imageInput.addEventListener('change', (e) =>
  DistortionObject.handleImage(e.target.files[0])
);
