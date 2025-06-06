class BookController {
    constructor() {
        // Lấy thông tin từ URL
        const urlParams = new URLSearchParams(window.location.search);
        this.movieTitle = urlParams.get('movie') || 'Tiêu đề phim';
        this.poster = urlParams.get('poster') || 'https://via.placeholder.com/200x300';
        this.genre = urlParams.get('genre') || 'Chưa rõ';
        this.duration = urlParams.get('duration') || 'Chưa rõ';
        this.director = urlParams.get('director') || 'Chưa rõ';
        this.actors = urlParams.get('actors') || 'Chưa rõ';
        this.overview = urlParams.get('overview') || 'Chưa có mô tả.';
    }

    // Hiển thị thông tin phim
    displayMovieInfo() {
        document.getElementById('movie-poster').src = this.poster;
        document.getElementById('movie-title').textContent = this.movieTitle;
        document.getElementById('movie-genre').textContent = this.genre;
        document.getElementById('movie-duration').textContent = this.duration;
        document.getElementById('movie-director').textContent = this.director;
        document.getElementById('movie-actors').textContent = this.actors;
        document.getElementById('movie-overview').textContent = this.overview;
    }

    // Kiểm tra trạng thái suất chiếu và hiển thị nút "Đặt vé" hoặc thông báo "Hết vé"
    checkShowtime(selectElement) {
        const row = selectElement.closest('tr');
        const cinema = row.getAttribute('data-cinema');
        const showtimes = JSON.parse(row.getAttribute('data-showtimes'));
        const selectedShowtime = selectElement.value;
        const statusElement = row.querySelector('.status');
        const actionMessage = row.querySelector('.action-message');

        if (selectedShowtime) {
            const status = showtimes[selectedShowtime];
            statusElement.textContent = status;
            statusElement.className = `btn btn-sm ${status === 'Còn vé' ? 'btn-success' : 'btn-danger'}`;
            actionMessage.innerHTML = '';

            if (status === 'Còn vé') {
                const bookButton = document.createElement('button');
                bookButton.className = 'btn btn-primary';
                bookButton.textContent = 'Đặt vé';
                const address = row.querySelector('td:nth-child(2)').textContent; // Lấy địa chỉ từ cột thứ 2
                bookButton.onclick = () => {
                    window.location.href = `/doancso1.1/seat.html?movie=${encodeURIComponent(this.movieTitle)}&cinema=${encodeURIComponent(cinema)}&showtime=${encodeURIComponent(selectedShowtime)}&address=${encodeURIComponent(address)}&poster=${encodeURIComponent(this.poster)}`;
                };
                actionMessage.appendChild(bookButton);
            } else {
                const soldOutMessage = document.createElement('span');
                soldOutMessage.className = 'sold-out-message';
                soldOutMessage.textContent = 'Vé đã hết';
                actionMessage.appendChild(soldOutMessage);
            }
        } else {
            statusElement.textContent = 'Chưa chọn';
            statusElement.className = 'btn btn-sm btn-secondary';
            actionMessage.innerHTML = '';
        }
    }

    // Khởi động lớp
    init() {
        this.displayMovieInfo();
        const selectElements = document.querySelectorAll('select[onchange="checkShowtime(this)"]');
        selectElements.forEach(select => {
            select.onchange = () => this.checkShowtime(select);
        });
    }
}

// Khởi tạo lớp BookController khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    const bookController = new BookController();
    bookController.init();
});