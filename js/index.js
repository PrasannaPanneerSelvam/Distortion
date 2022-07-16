import PixelEffect from './ParticleImage.js';

const handleImage = (function () {
  const horizontalPadding = 80,
    verticalPadding = 30;

  let loadedImageHeight, loadedImageWidth;

  const height = 400,
    width = 400;

  const canvas = document.getElementById('myCanvas'),
    ctx = canvas.getContext('2d');

  function setCanvasDimensions() {
    canvas.height = height + 2 * verticalPadding;
    canvas.width = width + 2 * horizontalPadding;
  }

  setCanvasDimensions();
  window.addEventListener('resize', setCanvasDimensions);

  function handleImage(imageUrl) {
    const htmlImage = new Image();
    htmlImage.src = imageUrl;

    htmlImage.onload = function () {
      loadedImageHeight = htmlImage.height;
      loadedImageWidth = htmlImage.width;

      htmlImage.height = height;
      htmlImage.width = width;

      const effect = new PixelEffect(canvas, ctx, htmlImage, {
        x: horizontalPadding,
        y: verticalPadding,
      });
      effect.mountMouseEvents(canvas);
      effect.render();
    };
  }
  return handleImage;
})();

handleImage('./images/html.png');
