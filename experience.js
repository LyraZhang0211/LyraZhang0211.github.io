const filterButtons = [...document.querySelectorAll('[data-filter]')];
const posts = [...document.querySelectorAll('.timeline-post[data-category]')];
const timelineFeed = document.querySelector('.timeline-feed');
const timelineEnd = timelineFeed?.querySelector('.timeline-end');
const yearDefinitions = ['2026', '2025', '2024', '2023', '2022'];

document.querySelectorAll('img:not([data-keep-original])').forEach(image => {
  const source = image.getAttribute('src');
  if (source) image.setAttribute('src', source.replace(/\.(?:jpe?g|png)(?=\?|$)/i, '.webp'));
  image.decoding = 'async';
});

document.querySelectorAll('.post-kicker, .post-tags, .giant-year, .featured-mark').forEach(item => item.remove());

posts.forEach(post => {
  const main = post.querySelector('.post-main');
  const title = main?.querySelector('h3');
  if (!main || !title) return;

  const media = main.querySelector(':scope > .post-media, :scope > .featured-photo-strip');
  let copy = main.querySelector(':scope > .post-copy');

  if (!copy) {
    copy = document.createElement('div');
    copy.className = 'post-copy';
    [...main.children].forEach(child => {
      if (child !== title && child !== media) copy.appendChild(child);
    });
  }

  main.prepend(title);
  main.appendChild(copy);
  if (media) {
    main.appendChild(media);
    if (media.querySelectorAll(':scope > img').length > 1) media.classList.add('media-pair');
  }

  const work = copy.querySelector(':scope > .core-work');
  const links = copy.querySelector(':scope > .related-links');
  const numbers = copy.querySelector(':scope > .project-numbers');
  const details = copy.querySelector(':scope > .project-details');

  if (work) {
    const count = work.querySelectorAll(':scope > li').length;
    work.classList.add(`work-count-${count}`);
    main.appendChild(work);
  }
  if (links) main.appendChild(links);
  if (numbers) main.appendChild(numbers);
  if (details) main.appendChild(details);

  if (post.id === 'experience-dream') {
    const dreamLeft = document.createElement('div');
    dreamLeft.className = 'dream-left';
    [title, copy, work, links, numbers].forEach(item => {
      if (item?.parentElement === main) dreamLeft.appendChild(item);
    });
    main.prepend(dreamLeft);
  }

  main.classList.add('editorial-entry');
  main.classList.toggle('has-no-media', !media);
  post.classList.toggle('is-standard', !post.classList.contains('post-featured'));
});

let mediaPostIndex = 0;
posts.forEach(post => {
  const hasMedia = Boolean(post.querySelector(':scope > .post-main > .post-media, :scope > .post-main > .featured-photo-strip'));
  if (!hasMedia) return;
  post.classList.toggle('layout-reversed', mediaPostIndex % 2 === 1);
  mediaPostIndex += 1;
});

if (timelineFeed && timelineEnd) {
  timelineFeed.querySelectorAll('.timeline-year').forEach(section => section.remove());
  yearDefinitions.forEach(year => {
    const section = document.createElement('section');
    section.className = 'timeline-year';
    section.id = `year-${year}`;
    section.dataset.year = year;
    section.setAttribute('aria-label', `${year} 年经历`);
    section.innerHTML = `<header class="year-heading"><h2 class="sr-only">${year} 年</h2></header>`;
    posts
      .filter(post => post.dataset.yearGroup === year)
      .sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order))
      .forEach(post => section.appendChild(post));
    timelineFeed.insertBefore(section, timelineEnd);
  });
}

const yearSections = [...document.querySelectorAll('.timeline-year[data-year]')];
const yearLinks = [...document.querySelectorAll('[data-year-link]')];

function setActiveYear(year) {
  yearLinks.forEach(link => link.setAttribute('aria-current', String(link.dataset.yearLink === year)));
}

function syncActiveYear() {
  const visibleSections = yearSections.filter(section => !section.hidden);
  if (!visibleSections.length) return;
  const marker = window.innerWidth <= 760 ? 154 : 188;
  let activeSection = visibleSections[0];
  visibleSections.forEach(section => {
    if (section.getBoundingClientRect().top <= marker) activeSection = section;
  });
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
    activeSection = visibleSections[visibleSections.length - 1];
  }
  setActiveYear(activeSection.dataset.year);
}

let yearSyncFrame = 0;
function scheduleYearSync() {
  if (yearSyncFrame) return;
  yearSyncFrame = requestAnimationFrame(() => {
    yearSyncFrame = 0;
    syncActiveYear();
  });
}

function applyFilter(category) {
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  posts.forEach(post => {
    post.hidden = category !== 'all' && post.dataset.category !== category;
  });
  yearSections.forEach(section => {
    const hasVisible = [...section.querySelectorAll('.timeline-post')].some(post => !post.hidden);
    section.hidden = !hasVisible;
    const link = document.querySelector(`[data-year-link="${section.dataset.year}"]`);
    if (link) link.hidden = !hasVisible;
  });
  scheduleYearSync();
}

filterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
yearLinks.forEach(link => link.addEventListener('click', () => setActiveYear(link.dataset.yearLink)));
window.addEventListener('scroll', scheduleYearSync, { passive: true });
window.addEventListener('resize', scheduleYearSync);
scheduleYearSync();
