const cursor = document.querySelector(".pixel-cursor");
const brandMark = document.querySelector(".brand-mark");

if (cursor) {
  const root = document.documentElement;
  let x = 0;
  let y = 0;
  let visible = false;

  const flameImage = new Image();
  flameImage.src = "./assets/cursor/flame-reference.png";
  flameImage.addEventListener("load", () => {
    const canvas = document.createElement("canvas");
    canvas.width = flameImage.naturalWidth;
    canvas.height = flameImage.naturalHeight;
    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(flameImage, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const isNearWhite =
        red > 238 &&
        green > 238 &&
        blue > 238 &&
        Math.abs(red - green) < 14 &&
        Math.abs(green - blue) < 14;

      if (isNearWhite) {
        pixels[index + 3] = 0;
      }
    }

    context.putImageData(imageData, 0, 0);
    root.style.setProperty("--cursor-flame-image", `url(${canvas.toDataURL("image/png")})`);
  });

  const moveCursor = (clientX, clientY) => {
    x = clientX;
    y = clientY;
    root.style.setProperty("--cursor-x", `${x}px`);
    root.style.setProperty("--cursor-y", `${y}px`);
  };

  window.addEventListener("pointermove", (event) => {
    if (!visible) {
      cursor.classList.add("is-visible");
      visible = true;
    }
    moveCursor(event.clientX, event.clientY);
  });

  window.addEventListener("pointerdown", () => {
    cursor.classList.add("is-pressed");
  });

  window.addEventListener("pointerup", () => {
    cursor.classList.remove("is-pressed");
  });

  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible");
    visible = false;
  });
}

if (brandMark) {
  brandMark.addEventListener("pointerenter", () => {
    brandMark.classList.add("is-rippling");
  });

  brandMark.addEventListener("pointermove", (event) => {
    brandMark.style.setProperty("--boil-x", `${event.offsetX}px`);
    brandMark.style.setProperty("--boil-y", `${event.offsetY}px`);
  });

  brandMark.addEventListener("pointerleave", () => {
    brandMark.classList.remove("is-rippling");
  });
}
