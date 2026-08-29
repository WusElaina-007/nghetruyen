const chapters = [
  { id: 1, title: "Chapter 01", file: "audio/chapter-01-NamMinh.mp3", duration: "11:08", fresh: true, available: true },
  { id: 2, title: "Chapter 02", file: "audio/chapter-02-NamMinh.mp3", duration: "12:55", fresh: true, available: true },
  { id: 3, title: "Chapter 03", file: "audio/chapter-03-NamMinh.mp3", duration: "13:48", fresh: false, available: true },
  { id: 4, title: "Chapter 04", file: "audio/chapter-04-NamMinh.mp3", duration: "12:35", fresh: false, available: true },
  { id: 5, title: "Chapter 05", file: "audio/chapter-05-NamMinh.mp3", duration: "13:53", fresh: false, available: true },
  { id: 6, title: "Chapter 06", file: "audio/chapter-06-NamMinh.mp3", duration: "Sắp cập nhật", fresh: false, available: false },
  { id: 7, title: "Chapter 07", file: "audio/chapter-07-NamMinh.mp3", duration: "Sắp cập nhật", fresh: false, available: false },
  { id: 8, title: "Chapter 08", file: "audio/chapter-08-NamMinh.mp3", duration: "Sắp cập nhật", fresh: false, available: false },
  { id: 9, title: "Chapter 09", file: "audio/chapter-09-NamMinh.mp3", duration: "Sắp cập nhật", fresh: false, available: false },
  { id: 10, title: "Chapter 10", file: "audio/chapter-10-NamMinh.mp3", duration: "Sắp cập nhật", fresh: false, available: false },
  { id: 11, title: "Chapter 11", file: "audio/chapter-11-NamMinh.mp3", duration: "Sắp cập nhật", fresh: false, available: false }
];

for (let id = 12; id <= 100; id += 1) {
  chapters.push({
    id,
    title: `Chapter ${String(id).padStart(2, "0")}`,
    file: `audio/chapter-${String(id).padStart(2, "0")}-NamMinh.mp3`,
    duration: "Sắp cập nhật",
    fresh: false,
    available: false
  });
}

const audio = document.querySelector("#audio");
const grid = document.querySelector("#chapterGrid");
const emptyState = document.querySelector("#emptyState");
const playerDock = document.querySelector("#playerDock");
const nowTitle = document.querySelector("#nowTitle");
const nowCover = document.querySelector(".cover-mini span");
const playPause = document.querySelector("#playPause");
const seekBar = document.querySelector("#seekBar");
const volumeBar = document.querySelector("#volumeBar");
const speedSelect = document.querySelector("#speedSelect");
const currentTime = document.querySelector("#currentTime");
const duration = document.querySelector("#duration");
const searchInput = document.querySelector("#searchInput");
const themeToggle = document.querySelector("#themeToggle");

let currentIndex = -1;
let currentFilter = "all";
let introDone = false;
let lastScrollY = window.scrollY;
let scrollDirection = 1;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");

  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${mins}:${secs}`;
};

function renderChapters(filter = "") {
  const query = filter.trim().toLowerCase();

  const visible = chapters.filter((chapter) => {
    const matchesQuery = chapter.title.toLowerCase().includes(query);
    const matchesFilter =
      currentFilter === "new" ? chapter.fresh : true;

    return matchesQuery && matchesFilter;
  });

  grid.innerHTML = visible.map((chapter) => `
    <article
      class="chapter-card${chapter.available ? "" : " is-locked"}${chapter.id - 1 === currentIndex ? " is-active" : ""}"
      data-id="${chapter.id}"
      tabindex="0"
      aria-label="${
        chapter.available
          ? `Nghe ${chapter.title}`
          : `${chapter.title}, sắp cập nhật`
      }"
    >
      <span class="chapter-no">
        ${String(chapter.id).padStart(2, "0")}${chapter.fresh ? " · MỚI" : ""}
      </span>

      <span class="chapter-play">
        ${chapter.available ? "▶" : "•••"}
      </span>

      <div class="chapter-meta">
        <h3 class="chapter-title">${chapter.title}</h3>
        <span class="chapter-duration">${chapter.duration}</span>
      </div>
    </article>
  `).join("");

  emptyState.hidden = visible.length > 0;

  grid.querySelectorAll(".chapter-card").forEach((card, index) => {
    const chapter = chapters[Number(card.dataset.id) - 1];

    const open = () => {
      if (chapter.available) {
        selectChapter(chapter.id - 1);
      }
    };

    card.addEventListener("click", open);

    card.addEventListener("keydown", (event) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        chapter.available
      ) {
        open();
      }
    });

    gsap.fromTo(
      card,
      { autoAlpha: 0, y: 25 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        delay: introDone
          ? index * 0.04
          : 0.38 + index * 0.08,
        ease: "power3.out"
      }
    );
  });
}

function selectChapter(index, shouldPlay = true) {
  if (!chapters[index] || !chapters[index].available) return;

  currentIndex = index;

  const chapter = chapters[index];

  audio.src = chapter.file;
  audio.load();

  // Giữ tốc độ phát hiện tại khi đổi chapter
  audio.playbackRate = Number(speedSelect.value);

  nowTitle.textContent = chapter.title;
  nowCover.textContent = String(chapter.id).padStart(2, "0");

  playerDock.classList.add("visible");

  gsap.to(playerDock, {
    y: 0,
    duration: 0.7,
    ease: "power3.out"
  });

  gsap.fromTo(
    ".cover-mini",
    { rotation: -12, scale: 0.8 },
    {
      rotation: 0,
      scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    }
  );

  document
    .querySelectorAll(".chapter-card")
    .forEach((card) => {
      card.classList.toggle(
        "is-active",
        Number(card.dataset.id) - 1 === index
      );
    });

  if (shouldPlay) {
    audio.play().catch(() => {});
  }
}

function togglePlayback() {
  if (currentIndex < 0) {
    selectChapter(0, true);
  } else if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
}

function nextChapter() {
  let index = currentIndex + 1;

  while (
    index < chapters.length &&
    !chapters[index].available
  ) {
    index += 1;
  }

  selectChapter(
    index < chapters.length ? index : 0
  );
}

function previousChapter() {
  let index = currentIndex - 1;

  while (
    index >= 0 &&
    !chapters[index].available
  ) {
    index -= 1;
  }

  selectChapter(
    index >= 0
      ? index
      : chapters.findIndex((chapter) => chapter.available)
  );
}

function setupScrollAnimations() {
  const reduced = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  const targets = [
    ".hero-copy",
    ".hero-art",
    ".stats",
    ".section-heading",
    ".chapter-card",
    ".about-line",
    ".about > .eyebrow",
    ".about-content"
  ];

  const elements = document.querySelectorAll(
    targets.join(",")
  );

  if (
    reduced ||
    !("IntersectionObserver" in window)
  ) {
    elements.forEach((el) => {
      el.classList.add("revealed");
    });

    return;
  }

  elements.forEach((el) => {
    el.classList.add("reveal-on-scroll");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        // Cuộn xuống: nội dung đi từ dưới lên
        // Cuộn lên: nội dung đi từ trên xuống
        const fromY =
          scrollDirection > 0 ? 42 : -42;

        gsap.fromTo(
          entry.target,
          {
            autoAlpha: 0,
            y: fromY
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: "power3.out",
            overwrite: true,
            onStart: () => {
              entry.target.classList.add("revealed");
            }
          }
        );

        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  elements.forEach((el) => observer.observe(el));
}

function animateIntro() {
  const reduced = window
    .matchMedia("(prefers-reduced-motion: reduce)")
    .matches;

  if (reduced) {
    introDone = true;
    renderChapters();
    return;
  }

  const intro = gsap.timeline({
    defaults: {
      ease: "power3.out"
    },
    onComplete: () => {
      introDone = true;
    }
  });

  intro
    .from(".site-header", {
      y: -24,
      autoAlpha: 0,
      duration: 0.7
    })
    .from(
      ".eyebrow",
      {
        x: -18,
        autoAlpha: 0,
        duration: 0.45
      },
      "-=.2"
    )
    .from(
      "h1",
      {
        y: 35,
        autoAlpha: 0,
        duration: 0.75
      },
      "-=.2"
    )
    .from(
      ".hero-description, .hero-actions",
      {
        y: 20,
        autoAlpha: 0,
        duration: 0.55,
        stagger: 0.1
      },
      "-=.3"
    )
    .from(
      ".hero-svg",
      {
        scale: 0.82,
        autoAlpha: 0,
        duration: 1,
        ease: "back.out(1.2)"
      },
      "-=.8"
    )
    .from(
      ".hero-caption",
      {
        autoAlpha: 0,
        y: 10,
        duration: 0.5
      },
      "-=.5"
    )
    .from(
      ".stats",
      {
        y: 20,
        autoAlpha: 0,
        duration: 0.55
      },
      "-=.25"
    );
}

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;

    scrollDirection =
      y >= lastScrollY ? 1 : -1;

    lastScrollY = y;
  },
  { passive: true }
);

audio.addEventListener(
  "loadedmetadata",
  () => {
    duration.textContent =
      formatTime(audio.duration);

    seekBar.max =
      audio.duration || 100;
  }
);

audio.addEventListener(
  "timeupdate",
  () => {
    currentTime.textContent =
      formatTime(audio.currentTime);

    seekBar.value =
      audio.currentTime;
  }
);

audio.addEventListener(
  "play",
  () => {
    playPause.textContent = "Ⅱ";

    gsap.to(".cover-mini", {
      scale: 1.05,
      duration: 0.8,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
  }
);

audio.addEventListener(
  "pause",
  () => {
    playPause.textContent = "▶";

    gsap.killTweensOf(".cover-mini");

    gsap.to(".cover-mini", {
      scale: 1,
      duration: 0.25
    });
  }
);

audio.addEventListener(
  "ended",
  nextChapter
);

seekBar.addEventListener(
  "input",
  () => {
    audio.currentTime =
      Number(seekBar.value);
  }
);

volumeBar.addEventListener(
  "input",
  () => {
    audio.volume =
      Number(volumeBar.value);
  }
);

speedSelect.addEventListener(
  "change",
  () => {
    audio.playbackRate =
      Number(speedSelect.value);
  }
);

document
  .querySelector("#playAll")
  .addEventListener(
    "click",
    () => selectChapter(0)
  );

playPause.addEventListener(
  "click",
  togglePlayback
);

document
  .querySelector("#nextBtn")
  .addEventListener(
    "click",
    nextChapter
  );

document
  .querySelector("#prevBtn")
  .addEventListener(
    "click",
    previousChapter
  );

searchInput.addEventListener(
  "input",
  (event) => {
    renderChapters(
      event.target.value
    );
  }
);

document
  .querySelectorAll(".filter-chip")
  .forEach((chip) => {
    chip.addEventListener(
      "click",
      () => {
        document
          .querySelectorAll(".filter-chip")
          .forEach((item) => {
            item.classList.remove("active");
          });

        chip.classList.add("active");

        currentFilter =
          chip.dataset.filter;

        renderChapters(
          searchInput.value
        );
      }
    );
  });

themeToggle.addEventListener(
  "click",
  () => {
    document.body.classList.toggle("dark");

    themeToggle.textContent =
      document.body.classList.contains("dark")
        ? "☾"
        : "☼";
  }
);

document.body.classList.add("dark");

themeToggle.textContent = "☾";

document.querySelector(
  "#chapterCount"
).textContent =
  String(chapters.length).padStart(3, "0");

renderChapters();
animateIntro();
setupScrollAnimations();
