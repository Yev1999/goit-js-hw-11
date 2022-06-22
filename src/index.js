import './css/styles.css';
import CardsApiService from './fetchCards';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

const $refs = {
  form: document.querySelector('#search-form'),
  container: document.querySelector('.gallery'),
  loadButton: document.querySelector('.load-more'),
};

$refs.form.addEventListener('submit', onSubmitForm);
$refs.loadButton.addEventListener('click', onLoadMore);

const cardsApiService = new CardsApiService();
showLoadMoreButton(false);

async function onSubmitForm(event) {
  event.preventDefault();

  cardsApiService.searchBar = $refs.form.searchQuery.value;
  cardsApiService.isSearch = true;

  if (cardsApiService.searchBar === '') {
    Notify.failure('Enter the search value!');
    return;
  }

  cardsApiService.resetPage();

  try {
    const fetchCards = await cardsApiService.fetchCards();
    const res = await Promise.all([
      clearCardsContainer(),
      handleListOfCards(fetchCards),
    ]);
    return fetchCards;
  } catch (error) {
    console.log(error.message);
  }
}

async function onLoadMore() {
  cardsApiService.isSearch = false;

  try {
    const fetchCards = await cardsApiService.fetchCards();
    await handleListOfCards(fetchCards);
    return fetchCards;
  } catch (error) {
    console.log(error.message);
  }
}

function showLoadMoreButton(enabled) {
  $refs.loadButton.style.display = enabled ? 'block' : 'none';
}

function renderCards(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
<div class="photo-card">
<a class="photo-card__link" href="${largeImageURL}">
  <img class="photo-card__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
</a>
<div class="info">
  <p class="info-item">
    <b>Likes</b>
    ${likes}
  </p>
  <p class="info-item">
    <b>Views</b>
    ${views}
  </p>
  <p class="info-item">
    <b>Comments</b>
    ${comments}
  </p>
  <p class="info-item">
    <b>Downloads</b>
    ${downloads}
  </p>
</div>
</div>`;
      }
    )
    .join('');

  $refs.container.insertAdjacentHTML('beforeend', markup);
}

function scrollCards() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

function handleListOfCards(images) {
  if (images.totalHits === 0) {
    showLoadMoreButton(false);
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    showLoadMoreButton(true);
    renderCards(images.hits);

    if (cardsApiService.isSearch) {
      Notify.success(`Hooray! We found ${images.totalHits} images.`);
    } else {
      scrollCards();
    }

    if (images.hits.length < cardsApiService.perPage) {
      if (images.total > cardsApiService.perPage) {
        Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
      showLoadMoreButton(false);
    }
  }

  simpleLightboxLibrary();
}

function simpleLightboxLibrary() {
  const card = new SimpleLightbox('.gallery a');
  card.refresh();
}

function clearCardsContainer() {
  $refs.container.innerHTML = '';
}
