const catalog = window.WORKS_CATALOG;
const content = document.querySelector('#works-content');
const filters = document.querySelector('#works-filters');
filters.setAttribute('aria-label', '作品分类，可横向滚动查看更多');

const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const optimizedImage = path => String(path ?? '').replace(/\.(?:jpe?g|png)(?=\?|$)/i, '.webp');
const optimizedMedia = path => {
  const value = String(path ?? '');
  if (/^https?:/i.test(value) || /\.web\.mp4(?=\?|$)/i.test(value)) return value;
  return value.replace(/\.mp4(?=\?|$)/i, '.web.mp4');
};

function linkMarkup(item, body, className = '') {
  if (!item.href) return `<div class="${className} is-static">${body}</div>`;
  const label = item.linkType === 'pdf' ? '查看 PDF' : item.linkType === 'media' ? '播放作品' : '查看作品';
  const opensNewTab = item.linkType === 'external' || /^(?:https?:)?\/\//i.test(item.href);
  const attributes = opensNewTab
    ? 'target="_blank" rel="noopener noreferrer"'
    : `data-work-viewer data-work-title="${escapeHTML(item.title)}" data-work-type="${escapeHTML(item.linkType || 'external')}"`;
  return `<a class="${className} is-linked" href="${escapeHTML(optimizedMedia(item.href))}" ${attributes} aria-label="${label}：${escapeHTML(item.title)}${opensNewTab ? '（在新标签页打开）' : ''}">${body}<span class="view-cue">${label} <i aria-hidden="true">↗</i></span></a>`;
}

function coverMarkup(work, categoryLabel) {
  let body;
  if (work.cover) {
    body = `<img src="${escapeHTML(optimizedImage(work.cover))}" alt="${escapeHTML(work.title)}封面" loading="lazy" decoding="async">`;
  } else if (work.preview) {
    body = `<object data="${escapeHTML(work.preview)}#page=1&toolbar=0&navpanes=0" type="application/pdf" tabindex="-1" aria-hidden="true"><span>${escapeHTML(work.title)}</span></object>`;
  } else {
    body = `<span class="placeholder-category">${escapeHTML(categoryLabel)}</span><strong>${escapeHTML(work.title)}</strong><span class="placeholder-mark" aria-hidden="true">↗</span>`;
  }
  return linkMarkup(work, body, `work-visual tone-${escapeHTML(work.tone || 'blue')} ${work.cover ? 'has-image' : work.preview ? 'has-preview' : 'has-placeholder'} ${work.coverStyle === 'logo' ? 'is-logo' : ''}`);
}

function itemMarkup(item) {
  const meta = item.role ? `<small>${escapeHTML(item.role)}</small>` : '';
  const body = `<div class="series-item-title"><h4>${escapeHTML(item.title)}</h4>${meta}</div>${item.note ? `<p class="item-note">${escapeHTML(item.note)}</p>` : ''}`;
  return linkMarkup(item, body, 'series-item');
}

function galleryItemMarkup(item) {
  const image = `<img src="${escapeHTML(optimizedImage(item.cover))}" alt="${escapeHTML(item.title)}作品预览" loading="lazy" decoding="async">`;
  return `<article class="gallery-item">${linkMarkup(item, image, 'gallery-visual')}<div class="gallery-caption"><h4>${escapeHTML(item.title)}</h4></div></article>`;
}

function broadcastProgramMarkup(work) {
  const programTitle = work.title.replace(/^北京广电《|》$/g, '');
  const summary = work.summary ? `<p class="audio-program-summary">${escapeHTML(work.summary)}</p>` : '';
  const role = work.role ? `<p class="audio-program-role">${escapeHTML(work.role)}</p>` : '';
  const logo = work.id === 'audio-health' ? '<img class="audio-program-logo" src="我的作品/音频作品/康养E站-cutout.webp" alt="FM100.6 京津冀之声 康养E站" loading="lazy" decoding="async">' : '';
  return `<section class="audio-program" id="${escapeHTML(work.id)}" aria-labelledby="${escapeHTML(work.id)}-title">
    <header class="audio-program-heading"><div class="audio-program-title-line"><h3 id="${escapeHTML(work.id)}-title">${escapeHTML(programTitle)}</h3>${logo}</div><div class="audio-program-meta">${summary}${role}</div></header>
    <div class="series-list">${work.items.map(itemMarkup).join('')}</div>
  </section>`;
}

function broadcastFeatureMarkup(works) {
  const health = works.find(work => work.id === 'audio-health');
  const intern = works.find(work => work.id === 'audio-intern');
  if (!health || !intern) return works.map(work => workMarkup(work, '音频作品')).join('');
  return `<article class="work-entry audio-broadcast-feature">
    <header class="audio-broadcast-title"><h3>北京广电</h3><img src="我的作品/音频作品/BRTV-cutout.webp" alt="BRTV" loading="lazy" decoding="async"></header>
    <p class="audio-broadcast-summary">实习期间，主要参与《京津冀康养E站》和《我是实习生》两档广播节目的策划。</p>
    <div class="audio-program-columns">${broadcastProgramMarkup(health)}${broadcastProgramMarkup(intern)}</div>
  </article>`;
}

function workMarkup(work, categoryLabel) {
  const details = [
    work.summary ? `<p class="work-summary">${escapeHTML(work.summary)}</p>` : '',
    work.role ? `<p class="work-role"><span>我的角色</span>${escapeHTML(work.role)}</p>` : '',
    work.note ? `<p class="work-note">${escapeHTML(work.note)}</p>` : ''
  ].join('');
  const series = work.items ? `<div class="series-list">${work.items.map(itemMarkup).join('')}</div>` : '';
  if (work.layout === 'visual-row') {
    return `<article class="work-entry is-visual-row ${work.category === 'video' ? 'is-video-gallery' : ''}" id="${escapeHTML(work.id)}"><div class="visual-row-heading"><h3>${escapeHTML(work.title)}</h3>${work.summary ? `<p>${escapeHTML(work.summary)}</p>` : ''}</div><div class="series-gallery">${work.items.map(galleryItemMarkup).join('')}</div></article>`;
  }
  if (work.layout === 'media-series') {
    const mainImage = work.cover
      ? `<div class="media-series-visual is-static ${work.coverStyle === 'logo' ? 'is-logo' : ''}"><img src="${escapeHTML(optimizedImage(work.cover))}" alt="${escapeHTML(work.title)}台标" loading="lazy" decoding="async"></div>`
      : '';
    const additionalImages = (work.additionalCovers || [])
      .map(item => `<div class="media-series-visual is-static ${item.style ? `is-${escapeHTML(item.style)}` : ''}"><img src="${escapeHTML(optimizedImage(item.src))}" alt="${escapeHTML(item.alt || work.title)}" loading="lazy" decoding="async"></div>`)
      .join('');
    const itemImages = work.items
      .filter(item => item.cover)
      .map(item => {
        const image = `<img src="${escapeHTML(optimizedImage(item.cover))}" alt="${escapeHTML(item.title)}作品封面" loading="lazy" decoding="async">`;
        return linkMarkup(item, image, 'media-series-visual');
      })
      .join('');
    return `<article class="work-entry is-media-series" id="${escapeHTML(work.id)}">
      <div class="media-series-heading"><h3>${escapeHTML(work.title)}</h3>${work.summary ? `<p>${escapeHTML(work.summary)}</p>` : ''}</div>
      <div class="media-series-body"><div class="media-series-images">${mainImage}${additionalImages}${itemImages}</div>${series}</div>
    </article>`;
  }
  return `<article class="work-entry ${work.featured ? 'is-featured' : ''} ${work.items ? 'is-series' : ''} ${work.layout === 'side-by-side' ? 'is-side-by-side' : ''} ${work.layout === 'video-side' ? 'is-video-side' : ''} ${work.layout === 'video-pair' ? 'is-video-pair' : ''} ${work.layout === 'writing-side' ? 'is-writing-side' : ''}" id="${escapeHTML(work.id)}">
    ${coverMarkup(work, categoryLabel)}
    <div class="work-copy"><h3>${escapeHTML(work.title)}</h3>${details}${series}</div>
  </article>`;
}

function render(active = 'all') {
  const categories = active === 'all' ? catalog.categories : catalog.categories.filter(category => category.id === active);
  content.innerHTML = categories.map(category => {
    const works = catalog.works
      .filter(work => work.category === category.id && !work.draft)
      .sort((a, b) => (a.displayOrder ?? Number.MAX_SAFE_INTEGER) - (b.displayOrder ?? Number.MAX_SAFE_INTEGER));
    let broadcastInserted = false;
    const worksMarkup = works.map(work => {
      if (category.id !== 'audio' || !['audio-intern', 'audio-health'].includes(work.id)) return workMarkup(work, category.label);
      if (broadcastInserted) return '';
      broadcastInserted = true;
      return broadcastFeatureMarkup(works.filter(item => ['audio-intern', 'audio-health'].includes(item.id)));
    }).join('');
    return `<section class="work-category" id="category-${escapeHTML(category.id)}" data-category-section="${escapeHTML(category.id)}">
      <header class="category-heading"><span>${escapeHTML(category.index)}</span><h2>${escapeHTML(category.label)}</h2></header>
      <div class="category-grid">${worksMarkup}</div>
    </section>`;
  }).join('');
  filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === active)));
}

[{id: 'all', label: '全部'}, ...catalog.categories].forEach(category => {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.category = category.id;
  button.setAttribute('aria-pressed', 'false');
  button.textContent = category.label;
  button.addEventListener('click', () => render(category.id));
  filters.append(button);
});
render();

const linkedCategory = location.hash ? document.querySelector(location.hash) : null;
if (linkedCategory) requestAnimationFrame(() => linkedCategory.scrollIntoView({block: 'start'}));

const viewer = document.querySelector('#work-viewer');
const viewerStage = document.querySelector('#work-viewer-stage');
const viewerTitle = document.querySelector('#work-viewer-title');
const viewerBack = document.querySelector('#work-viewer-back');
const viewerExternal = document.querySelector('#work-viewer-external');
let viewerTrigger = null;

function setPageInert(isInert) {
  document.querySelectorAll('body > :not(#work-viewer)').forEach(element => {
    element.inert = isInert;
  });
}

function openWorkViewer(link) {
  const href = link.href;
  const title = link.dataset.workTitle || '作品预览';
  const type = link.dataset.workType;
  viewerTrigger = link;
  viewerTitle.textContent = title;
  viewerExternal.href = href;
  viewerStage.replaceChildren();

  if (type === 'media') {
    const video = document.createElement('video');
    video.src = href;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', title);
    viewerStage.append(video);
  } else {
    const frame = document.createElement('iframe');
    frame.src = type === 'pdf' ? `${href.split('#')[0]}#view=Fit` : href;
    frame.title = title;
    frame.loading = 'eager';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.setAttribute('allow', 'autoplay; fullscreen');
    frame.setAttribute('allowfullscreen', '');
    viewerStage.append(frame);
  }

  viewer.hidden = false;
  document.body.classList.add('is-viewing-work');
  setPageInert(true);
  viewerBack.focus();
}

function closeWorkViewer() {
  if (viewer.hidden) return;
  const video = viewerStage.querySelector('video');
  if (video) video.pause();
  viewer.hidden = true;
  viewerStage.replaceChildren();
  document.body.classList.remove('is-viewing-work');
  setPageInert(false);
  if (viewerTrigger) viewerTrigger.focus({preventScroll: true});
  viewerTrigger = null;
}

document.addEventListener('click', event => {
  const link = event.target.closest('a[data-work-viewer]');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  openWorkViewer(link);
});

viewerBack.addEventListener('pointerdown', event => {
  event.preventDefault();
  closeWorkViewer();
});
viewerBack.addEventListener('click', closeWorkViewer);
document.addEventListener('keydown', event => {
  if (viewer.hidden) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    closeWorkViewer();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...viewer.querySelectorAll('button, a[href], video[controls]')].filter(element => !element.hidden && element.tabIndex !== -1);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
