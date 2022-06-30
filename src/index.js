import axios from 'axios';
import refs from './js/refs';
import Notiflix from 'notiflix';

let page = 0;
let searchInp;
let markup;
refs.searchForm.addEventListener('submit', handleSubmit);

const options = {
  root: null,
  rootMargin: '400px',
  threshold: 0.5,
};
const observer = new IntersectionObserver(UpdatePage, options);

function handleSubmit(event) {
  event.preventDefault();
  refs.imageList.innerHTML = '';
  page = 1;
  observer.unobserve(refs.guard);
  searchInp = event.target.elements.searchQuery.value;
  fetchImg(searchInp).then(dataImg => {
    if (dataImg.data.totalHits === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(
        `Hooray we found ${dataImg.data.totalHits} images`
      );
      render(dataImg);
    }
    observer.observe(refs.guard);
  });
}

async function fetchImg(searchInp) {
  const dataImg = await axios({
    url: ' https://pixabay.com/api/',
    params: {
      key: '28345018-0c1af10fb3ec556a31002db0e',
      q: searchInp,
      orientation: 'horizontal',
      image_type: 'photo',
      safesearch: true,
      page: page,
      per_page: 40,
    },
  });
  return dataImg;
}

function UpdatePage(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      fetchImg(searchInp, page).then(dataImg => {
        if (dataImg.data.hits.length === 0) {
          Notiflix.Notify.failure('Were sorry you reached end of page');
        }

        render(dataImg);
      });
    }
  });
}

function render({ data }) {
  markup = data.hits
    .map(element => {
      const markupEl = `<div class="photo-card">
  <div class='gallery-thumb'>
  <img class="gallery-image"
  src='${element.webformatURL}'
  alt='${element.tags}'
  loading='lazy'
  width='${element.webformatWidth}'
  height='${element.webformatHeight}'
  />
  </div>
  <div class="info">
  <p class="info-item">
  <b>Likes: ${element.likes}</b>
  </p>
  <p class="info-item">
  <b>Views: ${element.views}</b>
  </p>
  <p class="info-item">
  <b>Comments: ${element.comments}</b>
  </p>
  <p class="info-item">
  <b>Downloads: ${element.downloads}</b>
  </p>
  </div>
  </div>`;
      return markupEl;
    })
    .join('');
  refs.imageList.insertAdjacentHTML('beforeend', markup);
}
