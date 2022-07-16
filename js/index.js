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

  function handleImage(inputData) {
    const htmlImage = new Image();

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

    if (typeof inputData === 'string') {
      htmlImage.src = inputData;
    } else {
      const reader = new FileReader();
      reader.onload = function (event) {
        htmlImage.src = event.target.result;
      };
      reader.readAsDataURL(inputData);
    }
  }
  return handleImage;
})();

handleImage('./images/html.png');

const imageInput = document.getElementById('input-image');
imageInput.addEventListener('change', (e) => handleImage(e.target.files[0]));
