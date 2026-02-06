const DEFAULT_PERIOD = 'weekly';

/* Data fetching & Populating the DOM */

const cards = [];

fetch('./data.json').then((response) => {
  if (!response.ok) return;
  return response.json();
}).then((data) => {
  populateDOM(data);
});

function populateDOM(data) {
  data.forEach(appendItem);
  setDefaultPeriod();
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

function titleToCardCssClass(title) {
  return ['card', 'card--' + slugify(title)];
}

// TODO: consider extracting card creation logic into smaller functions
function appendItem(item) {
  const card = document.createElement('article');
  card.classList.add(...titleToCardCssClass(item.title));

  const icon = document.createElement('div');
  icon.className = 'card__icon';
  icon.setAttribute('aria-hidden', 'true');
  card.append(icon);

  const cardContent = document.createElement('section');
  cardContent.className = 'card__content';
  card.append(cardContent);

  const title = document.createElement('h2');
  title.className = 'card__title';
  title.textContent = item.title;
  cardContent.append(title);

  const actions = document.createElement('button');
  actions.className = 'card__actions';
  actions.setAttribute('aria-label', 'More actions');
  actions.setAttribute('aria-haspopup', 'menu');
  actions.setAttribute('aria-expanded', 'false');
  cardContent.append(actions);

  const ellipsis = document.getElementById('icon-ellipsis');
  if (ellipsis) {
    actions.append(ellipsis.content.cloneNode(true));
  }

  const appendTimeFrame = (period, { current, previous }) => {
    const hrs = document.createElement('p');
    hrs.className = 'card__hrs'
    hrs.dataset.period = period;
    hrs.textContent = `${current}hrs`
    cardContent.append(hrs);

    const hrsPrevText = () => {
      switch (period) {
        case 'daily': return `Yesterday - ${previous}hrs`;
        case 'weekly': return `Last Week - ${previous}hrs`;
        case 'monthly': return `Last Month - ${previous}hrs`;
        default: return `${current}hrs`;
      }
    }

    const hrsPrev = document.createElement('p');
    hrsPrev.className = 'card__hrs-prev'
    hrsPrev.dataset.period = period;
    hrsPrev.textContent = hrsPrevText();
    cardContent.append(hrsPrev);
  };

  for (const [period, timeFrame] of Object.entries(item.timeframes)) {
    appendTimeFrame(period, timeFrame);
  }

  const dashboardMain = document.querySelector('.dashboard__main');
  dashboardMain.append(card);
  cards.push(card);
};


function setCardPeriod(card, period) {
  card
    .querySelectorAll('.card__hrs, .card__hrs-prev')
    .forEach(el => {
      if (el.dataset.period === period) {
        el.dataset.active = '';
      } else {
        delete el.dataset.active;
      }
    });
}

/* Filter selecting */

const filter = document.querySelector('.dashboard__filter');

function setDefaultPeriod() {
  const btns = Array.from(filter.querySelectorAll('[data-period]'));
  const btn = btns.find(el => el.dataset.period === DEFAULT_PERIOD);
  selectPeriod(btn);
}

function selectPeriod(btn) {
  filter.querySelectorAll('[aria-current]')
    .forEach(el => el.removeAttribute('aria-current'));

  cards.forEach(card => setCardPeriod(card, btn.dataset.period));

  btn.setAttribute('aria-current', 'true');
}

filter.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-period]');
  if (!btn) return;
  selectPeriod(btn);
});
