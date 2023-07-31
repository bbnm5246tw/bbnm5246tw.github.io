const BASE_URL = "https://webdev.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const movies = [];
const dataPanel = document.querySelector("#data-panel");
const MOVIE_PER_PAGE = 12;
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const modeButtons = document.querySelector("#buttons-container");
const SHOW_MODE = {
  cardMode: "cardMode",
  listMode: "listMode",
};

const modal = {
  filterMovies: [],
  // modeState: true,
  getMoviesByPage(page) {
    // 如果 filterMovies 有資料，代入 filterMovies 反之代入 movies
    const data = this.filterMovies.length ? this.filterMovies : movies;
    const startIndex = (page - 1) * MOVIE_PER_PAGE;

    return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
  },
};

const view = {
  renderMovieList(data) {
    let rawHTML = "";
    // 將筆資料依序排出
    data.forEach((item) => {
      switch (this.currentState) {
        case SHOW_MODE.cardMode:
          rawHTML += `
                    <div class="col-sm-3">
                      <div class="mb-2">
                        <div class="card">
                          <img src="${
                            POSTER_URL + item.image
                          }" class="card-img-top" alt="Movie Poster">
                          <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                          </div>
                          <div class="card-footer">
                            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${
                              item.id
                            }">More</button>
                            <button class="btn btn-info btn-add-favorite" data-id="${
                              item.id
                            }">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    `;
          break;
        case SHOW_MODE.listMode:
          rawHTML += `
                    <ul class="list-group">
                      <li class="list-group-item" data-id="${item.id}">
                        <div class="row align-items-center">
                          <div class="col"><h5>${item.title}</h5></div> <!-- 電影標題 -->
                          <div class="col-auto">
                            <button
                              class="btn btn-primary btn-show-movie"
                              data-bs-toggle="modal"
                              data-bs-target="#movie-modal"
                              data-id="${item.id}"
                            >
                              More
                            </button>
                            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                          </div>
                        </div>
                      </li>
                    </ul>
                    `;
          break;
        default:
          break;
      }
    });
    dataPanel.innerHTML = rawHTML;
  },
  showMovieModal(id) {
    const modalTitle = document.querySelector("#movie-modal-title");
    const modalImage = document.querySelector("#movie-modal-image");
    const modalDate = document.querySelector("#movie-modal-date");
    const modalDescription = document.querySelector("#movie-modal-description");
    const moviesData = movies.find(movie => movie.id === id);
    modalTitle.innerText = moviesData.title;
    modalDate.innerText = "Release date: " + moviesData.release_date;
    modalDescription.innerText = moviesData.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + moviesData.image}" alt="movie-poster" class="img-fluid">`;
    // axios.get(INDEX_URL + id).then((response) => {
    //   const data = response.data.results;
    //   modalTitle.innerText = data.title;
    //   modalDate.innerText = "Release date: " + data.release_date;
    //   modalDescription.innerHTML = data.description;
    //   modalImage.innerHTML = `<img src="${
    //     POSTER_URL + data.image
    //   }" alt="movie-poster" class="img-fluid">`;
    // });
  },
  renderPaginator(amount) {
    // 計算總頁數
    const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
    // 製作template
    let rawHTML = "";

    for (let page = 1; page <= numberOfPages; page++) {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
    }
    paginator.innerHTML = rawHTML;
  },
  // 預設模式設定：card
};

const controller = {
  // 判斷 More 和 + 按鈕
  onPanelClicked(event) {
    if (event.target.matches(".btn-show-movie")) {
      view.showMovieModal(Number(event.target.dataset.id));
    } else if (event.target.matches(".btn-add-favorite")) {
      controller.addToFavorite(Number(event.target.dataset.id));
    }
  },
  // 搜尋欄
  onSearchFormSubmitted(event) {
    event.preventDefault();
    const keyword = searchInput.value.trim().toLowerCase();

    modal.filterMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(keyword)
    );
    if (modal.filterMovies.length === 0) {
      return alert(`你輸入的關鍵字: ${keyword} 沒有符合條件`);
    }
    // 分頁器
    view.renderPaginator(modal.filterMovies.length);
    // 預設顯示第一頁的結果
    view.renderMovieList(modal.filterMovies);
  },
  //' + '鍵設定
  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem("favoriteMovies1")) || [];
    const movie = movies.find((movie) => movie.id === id);
    if (list.some((movie) => movie.id === id)) {
      return alert("此電影已經收藏!");
    }
    list.push(movie);
    localStorage.setItem("favoriteMovies1", JSON.stringify(list));
  },
  onPaginatorClicked(event) {
    // 如果不是點擊 a 標籤，結束
    if (event.target.tagName !== "A") return;

    // 透過 dataset 取得被點擊的頁數
    const page = Number(event.target.dataset.page);

    view.renderMovieList(modal.getMoviesByPage(page));
  },
  changeMode(event) {
    if (event.target.classList.contains("fa-bars")) {
      view.currentState = SHOW_MODE.listMode;
      view.renderMovieList(modal.getMoviesByPage(1));
    } else if (event.target.classList.contains("fa-table-cells")) {
      view.currentState = SHOW_MODE.cardMode;
      view.renderMovieList(modal.getMoviesByPage(1));
    }
  },
  setDefaultMode() {
    view.currentState = SHOW_MODE.cardMode;
    view.renderMovieList(modal.getMoviesByPage(1));
  },

  showMainPage() {
    axios
      .get(INDEX_URL)
      .then((response) => {
        movies.push(...response.data.results);
        view.renderPaginator(movies.length);
        this.setDefaultMode();
      })
      .catch((err) => console.log(err));
  },
};

// 事件監聽器
dataPanel.addEventListener("click", controller.onPanelClicked);
searchForm.addEventListener("submit", controller.onSearchFormSubmitted);
paginator.addEventListener("click", controller.onPaginatorClicked);
modeButtons.addEventListener("click", controller.changeMode);

controller.showMainPage();
