import Axios from 'axios';

const API_KEY = '28090612-053d38b519fb99dbfe43ba7b5';
const BASE_URL = 'https://pixabay.com/api/';

export default class CardsApiService {
  constructor() {
    this.searchBar = '';
    this.page = 1;
    this.perPage = 40;
    this.m_isSearch = false;
  }

  async fetchCards() {
    try {
      const response = await Axios.get(
        `${BASE_URL}?key=${API_KEY}&q=${this.searchBar}&image_type=photo&orientation=horizontal&safesearch=true&page=${this.page}&per_page=${this.perPage}`
      );
      this.incrementPage();
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get isSearch() {
    return this.m_isSearch;
  }

  set isSearch(search) {
    this.m_isSearch = search;
  }
}
