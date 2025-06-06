class MovieSchedule {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = "https://api.themoviedb.org/3";
        this.daysOfWeek = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ];
        this.moviesPerPage = 4; 
        this.currentPages = {};
        this.weeklyMoviesData = {};
        this.currentBannerIndex = 0;
    }

    async fetchMoviesByDate(startDate, endDate) {
        try {
            const response = await fetch(
                `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&primary_release_date.gte=${startDate}&primary_release_date.lte=${endDate}&language=vi-VN`
            );
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu phim:", error);
            return [];
        }
    }

    async fetchOlderMovies(targetDate) {
        const oneMonthAgo = new Date(targetDate);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const formatDate = (d) => d.toISOString().split("T")[0];
        try {
            const response = await fetch(
                `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&primary_release_date.lte=${formatDate(oneMonthAgo)}&sort_by=release_date.asc&language=vi-VN`
            );
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error("Lỗi khi lấy phim cũ:", error);
            return [];
        }
    }

    async getMovieDetails(movieId) {
        try {
            // Lấy thông tin cơ bản của phim
            const movieResponse = await fetch(
                `${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=vi-VN`
            );
            if (!movieResponse.ok) throw new Error(`HTTP error! Status: ${movieResponse.status}`);
            const movieData = await movieResponse.json();

            // Lấy thông tin credits (đạo diễn và diễn viên)
            const creditsResponse = await fetch(
                `${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}&language=vi-VN`
            );
            if (!creditsResponse.ok) throw new Error(`HTTP error! Status: ${creditsResponse.status}`);
            const creditsData = await creditsResponse.json();

            return {
                genre: movieData.genres?.map(genre => genre.name).join(', ') || 'Chưa rõ',
                duration: movieData.runtime ? `${movieData.runtime} phút` : 'Chưa rõ',
                director: (creditsData.crew?.find(crew => crew.job === 'Director')?.name) || 'Chưa rõ',
                actors: (creditsData.cast?.slice(0, 5).map(actor => actor.name).join(', ')) || 'Chưa rõ',
                overview: movieData.overview || 'Chưa có mô tả.'
            };
        } catch (error) {
            console.error("Lỗi khi lấy thông tin chi tiết của phim:", error);
            return {
                genre: 'Chưa rõ',
                duration: 'Chưa rõ',
                director: 'Chưa rõ',
                actors: 'Chưa rõ',
                overview: 'Chưa có mô tả.'
            };
        }
    }

    async getWeeklyMovies() {
        const today = new Date();
        const currentDay = today.getDay();

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const formatDate = (date) => date.toISOString().split("T")[0];

        const weeklyMovies = {};
        this.daysOfWeek.forEach((day) => {
            weeklyMovies[day] = [];
        });

        for (let i = 0; i < 7; i++) {
            const targetDate = new Date(startOfWeek);
            targetDate.setDate(startOfWeek.getDate() + i);
            const day = this.daysOfWeek[i];
            const movies = await this.fetchMoviesByDate(formatDate(targetDate), formatDate(targetDate));
            weeklyMovies[day] = movies;

            if (movies.length < 6) {
                const olderMovies = await this.fetchOlderMovies(targetDate);
                const remainingSlots = 6 - movies.length;
                weeklyMovies[day] = weeklyMovies[day].concat(olderMovies.slice(0, remainingSlots));
            }
            weeklyMovies[day] = weeklyMovies[day].slice(0, 6);
        }

        this.weeklyMoviesData = weeklyMovies;
        return weeklyMovies;
    }

    async createMovieCard(movie) {
        const movieCard = document.createElement("div");
        movieCard.className = "movie-card col-md-3";

        // Kiểm tra dữ liệu phim trước khi render
        if (!movie || !movie.id || !movie.title) {
            console.warn("Dữ liệu phim không hợp lệ:", movie);
            movieCard.innerHTML = `
                <div class="movie-card-inner">
                    <img src="https://via.placeholder.com/200x300?text=Error" alt="Phim lỗi" />
                    <div class="movie-card-body">
                        <h5 style="color: white;">Phim không khả dụng</h5>
                        <p>Khởi chiếu: N/A</p>
                        <p>Đánh giá: N/A</p>
                        <button class="btn btn-book-ticket" disabled>Đặt vé xem phim</button>
                    </div>
                </div>
            `;
            return movieCard;
        }

        const posterUrl = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://via.placeholder.com/200x300?text=No+Image";

        // Lấy thông tin chi tiết của phim
        const movieDetails = await this.getMovieDetails(movie.id);
        const movieUrl = `/Dat_ve_xem_phim/datve.html?movie=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(posterUrl)}&genre=${encodeURIComponent(movieDetails.genre)}&duration=${encodeURIComponent(movieDetails.duration)}&director=${encodeURIComponent(movieDetails.director)}&actors=${encodeURIComponent(movieDetails.actors)}&overview=${encodeURIComponent(movieDetails.overview)}`;

        movieCard.innerHTML = `
            <div class="movie-card-inner">
                <img src="${posterUrl}" alt="${movie.title}" />
                <div class="movie-card-body">
                    <h5 style="color: white;">${movie.title}</h5>
                    <p>Khởi chiếu: ${movie.release_date || 'N/A'}</p>
                    <p>Đánh giá: ${movie.vote_average || 'N/A'}</p>
                    <button class="btn btn-book-ticket" onclick="window.location.href='${movieUrl}'">Đặt vé xem phim</button>
                </div>
            </div>
        `;

        return movieCard;
    }

    async updateMovieDisplay(day, movieRow, pagination) {
        const page = this.currentPages[day] || 1;
        const startIdx = (page - 1) * this.moviesPerPage;
        const endIdx = startIdx + this.moviesPerPage;
        const movies = this.weeklyMoviesData[day].slice(startIdx, endIdx);

        movieRow.innerHTML = ""; // Xóa nội dung cũ

        // Đảm bảo tất cả thẻ phim được tạo xong trước khi thêm vào DOM
        const movieCards = await Promise.all(
            movies.map(async (movie) => await this.createMovieCard(movie))
        );

        // Thêm các thẻ phim vào DOM
        movieCards.forEach(card => movieRow.appendChild(card));

        // Cập nhật trạng thái phân trang
        const totalMovies = this.weeklyMoviesData[day].length;
        const totalPages = Math.ceil(totalMovies / this.moviesPerPage);
        const prevButton = pagination.querySelector(".btn-prev");
        const nextButton = pagination.querySelector(".btn-next");
        prevButton.disabled = page === 1;
        nextButton.disabled = page === totalPages || totalMovies <= this.moviesPerPage;
    }

    changePage(day, delta, movieRow, pagination) {
        this.currentPages[day] = (this.currentPages[day] || 1) + delta;
        this.updateMovieDisplay(day, movieRow, pagination);
    }

    async updateBanner() {
        const day = this.daysOfWeek[this.currentBannerIndex];
        const movies = this.weeklyMoviesData[day];
        if (!movies || movies.length === 0) {
            console.warn(`Không có phim cho ngày ${day}. Chuyển sang ngày tiếp theo.`);
            this.currentBannerIndex = (this.currentBannerIndex + 1) % this.daysOfWeek.length;
            return;
        }

        const movie = movies[0]; // Lấy phim đầu tiên của ngày làm banner
        const banner = document.querySelector(".banner");
        if (!banner) {
            console.error("Không tìm thấy phần banner trong DOM.");
            return;
        }

        const bannerText = banner.querySelector(".banner-text");
        const bannerImage = banner.querySelector("img");
        if (!bannerText || !bannerImage) {
            console.error("Không tìm thấy banner-text hoặc img trong banner.");
            return;
        }

        // Lấy chi tiết phim cho banner
        const movieDetails = await this.getMovieDetails(movie.id);
        bannerText.querySelector("h1").textContent = movie.title || "Không có tiêu đề";
        bannerText.querySelector("p").textContent = movieDetails.overview || "Không có mô tả.";
        const bannerImageUrl = movie.backdrop_path
            ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
            : (movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : "https://via.placeholder.com/600x300?text=No+Image");
        bannerImage.src = bannerImageUrl;
        bannerImage.alt = movie.title || "Banner Image";

        const bookButton = bannerText.querySelector(".btn-primary");
        if (bookButton) {
            bookButton.onclick = () => {
                window.location.href = `/Dat_ve_xem_phim/datve.html?movie=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(bannerImageUrl)}&genre=${encodeURIComponent(movieDetails.genre)}&duration=${encodeURIComponent(movieDetails.duration)}&director=${encodeURIComponent(movieDetails.director)}&actors=${encodeURIComponent(movieDetails.actors)}&overview=${encodeURIComponent(movieDetails.overview)}`;
            };
        }

        banner.classList.remove("fade");
        void banner.offsetWidth; // Trigger reflow
        banner.classList.add("fade");
    }

    startBannerRotation() {
        this.updateBanner();
        setInterval(() => {
            this.currentBannerIndex = (this.currentBannerIndex + 1) % this.daysOfWeek.length;
            this.updateBanner();
        }, 3000);
    }

    async displayWeeklyMovies() {
        const weeklyMovies = await this.getWeeklyMovies();
        const container = document.createElement("div");
        container.className = "weekly-schedule";

        for (const day of this.daysOfWeek) {
            const daySection = document.createElement("div");
            daySection.className = "day-section";
            daySection.dataset.day = day;

            const dayTitle = document.createElement("h2");
            dayTitle.textContent = day;
            daySection.appendChild(dayTitle);

            const movieRow = document.createElement("div");
            movieRow.className = "movie-row row";
            daySection.appendChild(movieRow);

            const totalMovies = weeklyMovies[day].length;
            if (totalMovies > this.moviesPerPage) {
                const pagination = document.createElement("div");
                pagination.className = "pagination d-flex justify-content-center align-items-center mt-2";

                const prevButton = document.createElement("button");
                prevButton.className = "btn btn-secondary btn-prev me-2";
                prevButton.textContent = "<";
                prevButton.disabled = true;
                prevButton.addEventListener("click", () => this.changePage(day, -1, movieRow, pagination));

                const nextButton = document.createElement("button");
                nextButton.className = "btn btn-secondary btn-next";
                nextButton.textContent = ">";
                nextButton.addEventListener("click", () => this.changePage(day, 1, movieRow, pagination));

                pagination.appendChild(prevButton);
                pagination.appendChild(nextButton);
                daySection.appendChild(pagination);

                await this.updateMovieDisplay(day, movieRow, pagination);
            } else {
                const movies = weeklyMovies[day].slice(0, this.moviesPerPage);
                const movieCards = await Promise.all(
                    movies.map(async (movie) => await this.createMovieCard(movie))
                );
                movieCards.forEach(card => movieRow.appendChild(card));
            }

            container.appendChild(daySection);
        }

        const trendingSection = document.querySelector(".trending-section");
        if (trendingSection) {
            trendingSection.innerHTML = "";
            trendingSection.appendChild(container);
        } else {
            console.error("Không tìm thấy phần trending-section trong DOM.");
        }

        this.startBannerRotation();
    }
}

const apiKey = "846ccae96330e381cc9f623a780912d9";
document.addEventListener("DOMContentLoaded", () => {
    const movieSchedule = new MovieSchedule(apiKey);
    movieSchedule.displayWeeklyMovies();
});
