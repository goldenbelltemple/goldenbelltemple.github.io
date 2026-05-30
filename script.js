window.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector(".stage");
  const typeNodes = Array.from(document.querySelectorAll("[data-text]"));
  const archiveImages = Array.from(document.querySelectorAll(".archive-image"));
  const bookTitle = document.querySelector(".book-title");
  const bookIndex = document.querySelector(".book-index");
  const bookDescription = document.querySelector(".book-description");
  const bookSelectedImage = document.querySelector(".book-selected-image img");
  const bookCanvas = document.querySelector(".book-canvas");
  const bookMap = document.querySelector(".book-map");
  const backButton = document.querySelector(".back-button");
  let timers = [];
  let mapScale = 0.95;
  let mapX = 40;
  let mapY = 92;
  let dragStart = null;

  const books = {
    vending: {
      title: "Seoul Vending Machine<br />Archive",
      index: "(1)",
      x: 80,
      y: 90,
      scale: 0.92,
      image: "스프레드페이지/북페어_포폴작업중(작업소개).jpg",
      paragraphs: [
        "On the walls, utility poles, construction fences, and glass doors of Seoul, there are pieces of information that do not appear on official maps: labor agency ads, boarding house notices, tutoring flyers, warehouse clearance sales, demolition signs, job postings, urgent sale announcements. They are another way the city explains itself.",
        "These flyers and stickers are not made to be beautiful. They are made to be read quickly and to survive outdoors. Bold letters, fluorescent paper, repeated phone numbers, exaggerated phrases, torn edges, and layers of tape reveal traces of someone’s livelihood, need, anxiety, and opportunity. Across Seoul, these small advertisements appear and disappear every day. They are too small to become official signs, yet too urgent to exist only online.",
        "This book records how the city looks for workers, rents rooms, sells goods, and calls out for chances through papers and stickers attached to the street. This is an archive of Seoul’s temporary language a city continually pasted, torn away, and pasted over again.",
      ],
    },
    street: {
      title: "Seoul Street Advertisement<br />Archive",
      index: "(2)",
      x: 10,
      y: 78,
      scale: 0.78,
      image: "스프레드페이지/북페어_포폴작업중(작업소개)6.jpg",
      paragraphs: [
        "Street advertisements collect the city’s fast language: rent, repair, delivery, jobs, loans, lessons, and sales. Their typography is direct because the message has to survive weather, speed, and competition.",
        "Numbers repeat, colors shout, and layers of paper overlap until the wall becomes a public notice board. This archive follows those small signs as unofficial graphics that reveal how Seoul asks, offers, warns, and negotiates.",
        "The book treats each flyer and sticker as a document of urgency. They are temporary, but they describe a permanent rhythm of the city.",
      ],
    },
    hof: {
      title: "Seoul Hof(korean pub)<br />Archive",
      index: "(3)",
      x: -80,
      y: 38,
      scale: 0.76,
      image: "스프레드페이지/북페어_포폴작업중(작업소개)9.jpg",
      paragraphs: [
        "Hof bars are everyday rooms of light, draft beer, plastic menus, delivery boxes, and old signs. Their fronts carry a graphic language that is loud, practical, and familiar.",
        "This archive records the glow of Korean pubs and the visual systems that make them recognizable from the street: beer marks, chicken signs, window stickers, menu boards, and improvised notices.",
        "Together they form a record of ordinary gathering places where the city pauses, exhales, and keeps going.",
      ],
    },
  };

  const restartAnimations = () => {
    document.querySelectorAll(".stage *").forEach((node) => {
      node.style.animation = "none";
      node.offsetHeight;
      node.style.animation = "";
    });
  };

  const setTimer = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const resetTypedText = () => {
    typeNodes.forEach((node) => {
      node.textContent = "";
    });
  };

  const updateMapTransform = () => {
    bookMap.style.transform = `translate(${mapX}px, ${mapY}px) scale(${mapScale})`;
  };

  const setBookCopy = (bookKey) => {
    const book = books[bookKey] || books.vending;
    bookTitle.innerHTML = book.title;
    bookIndex.textContent = book.index;
    bookDescription.innerHTML = book.paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
    bookSelectedImage.src = book.image;
    mapX = book.x;
    mapY = book.y;
    mapScale = book.scale;
    updateMapTransform();
  };

  const typeDetailText = () => {
    typeNodes.forEach((node) => {
      const text = node.dataset.text || "";

      Array.from(text).forEach((char, index) => {
        setTimer(() => {
          node.textContent += char;
        }, index * 18);
      });
    });
  };

  resetTypedText();
  setBookCopy("vending");

  stage.addEventListener("click", () => {
    if (document.body.classList.contains("intro-started")) return;

    document.body.classList.add("intro-started");
    setTimer(() => {
      document.body.classList.add("detail-started");
      setTimer(typeDetailText, 620);
    }, 13750);
  });

  archiveImages.forEach((image) => {
    image.addEventListener("click", (event) => {
      if (!document.body.classList.contains("detail-started")) return;

      event.stopPropagation();
      clearTimers();
      setBookCopy(image.dataset.book || "vending");
      document.body.classList.add("book-open");
    });
  });

  bookCanvas.addEventListener("wheel", (event) => {
    if (!document.body.classList.contains("book-open")) return;

    event.preventDefault();
    const rect = bookCanvas.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;
    const previousScale = mapScale;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    mapScale = Math.min(2.2, Math.max(0.32, mapScale * zoomFactor));

    const mapPointX = (localX - mapX) / previousScale;
    const mapPointY = (localY - mapY) / previousScale;
    mapX = localX - mapPointX * mapScale;
    mapY = localY - mapPointY * mapScale;
    updateMapTransform();
  });

  bookCanvas.addEventListener("pointerdown", (event) => {
    if (!document.body.classList.contains("book-open")) return;

    dragStart = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      mapX,
      mapY,
    };
    bookCanvas.classList.add("is-dragging");
    bookCanvas.setPointerCapture(event.pointerId);
  });

  bookCanvas.addEventListener("pointermove", (event) => {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;

    mapX = dragStart.mapX + event.clientX - dragStart.clientX;
    mapY = dragStart.mapY + event.clientY - dragStart.clientY;
    updateMapTransform();
  });

  bookCanvas.addEventListener("pointerup", (event) => {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;

    dragStart = null;
    bookCanvas.classList.remove("is-dragging");
  });

  bookCanvas.addEventListener("pointercancel", () => {
    dragStart = null;
    bookCanvas.classList.remove("is-dragging");
  });

  backButton.addEventListener("click", (event) => {
    event.stopPropagation();
    document.body.classList.remove("book-open");
    dragStart = null;
    bookCanvas.classList.remove("is-dragging");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() !== "r") return;

    clearTimers();
    document.body.classList.remove("intro-started", "detail-started", "book-open");
    resetTypedText();
    setBookCopy("vending");
    restartAnimations();
  });
});