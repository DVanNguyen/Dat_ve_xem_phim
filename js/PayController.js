class PaymentController {
    constructor() {
        // Lấy thông tin từ URL
        const urlParams = new URLSearchParams(window.location.search);
        this.movieTitle = decodeURIComponent(urlParams.get('movie') || 'Loetoeng Kasarung');
        this.cinema = decodeURIComponent(urlParams.get('cinema') || 'Cinema Galaxy');
        this.showtime = decodeURIComponent(urlParams.get('showtime') || '18:00, Hôm nay');
        this.address = decodeURIComponent(urlParams.get('address') || '123 Đường Láng, Hà Nội');
        this.seats = decodeURIComponent(urlParams.get('seats') || '');
        this.combos = urlParams.get('combos') ? JSON.parse(decodeURIComponent(urlParams.get('combos'))) : [];
        this.totalPrice = parseInt(urlParams.get('total') || '0');
        this.poster = decodeURIComponent(urlParams.get('poster') || 'https://via.placeholder.com/150x225');
    }

    // Hiển thị thông tin phim và suất chiếu
    displayPaymentInfo() {
        document.getElementById('movie-title').textContent = this.movieTitle;
        document.getElementById('cinema').textContent = this.cinema;
        document.getElementById('address').textContent = this.address;
        document.getElementById('showtime').textContent = this.showtime;
        document.querySelector('.movie-info img').src = this.poster;

        document.getElementById('selected-seats').textContent = this.seats || 'Chưa chọn ghế';
        document.getElementById('selected-combos').textContent = this.combos.length > 0 ? this.combos.map(c => `${c.name} (x${c.quantity})`).join(', ') : 'Chưa chọn combo';
    }

    // Hiển thị tóm tắt thanh toán
    displaySummary() {
        const summarySeats = document.getElementById('summary-seats');
        const seatPrices = document.getElementById('seat-prices');
        const summaryCombos = document.getElementById('summary-combos');
        const comboPrices = document.getElementById('combo-prices');
        const totalPrice = document.getElementById('total-price');

        // Hiển thị danh sách ghế và giá vé
        summarySeats.textContent = this.seats || 'Chưa chọn ghế';
        if (this.seats) {
            const seatList = this.seats.split(',');
            const seatPriceDetails = seatList.map(seat => {
                const row = seat.charAt(0).toUpperCase();
                let price;
                if (['A', 'B', 'C', 'D'].includes(row)) {
                    price = 80000; // Ghế thường
                } else if (['E'].includes(row)) {
                    price = 120000; // Ghế premium
                } else {
                    price = 150000; // Ghế VIP
                }
                return `${seat}: ${price.toLocaleString('vi-VN')} VNĐ`;
            });
            seatPrices.textContent = seatPriceDetails.join(', ') || '-';
        } else {
            seatPrices.textContent = '-';
        }

        // Hiển thị danh sách combo và giá combo
        summaryCombos.textContent = this.combos.length > 0 ? this.combos.map(c => `${c.name} (x${c.quantity})`).join(', ') : 'Chưa chọn combo';
        if (this.combos.length > 0) {
            const comboPriceDetails = this.combos.map(combo => `${combo.name} (x${combo.quantity}): ${(combo.price * combo.quantity).toLocaleString('vi-VN')} VNĐ`);
            comboPrices.textContent = comboPriceDetails.join(', ') || '-';
        } else {
            comboPrices.textContent = '-';
        }

        // Hiển thị tổng tiền
        totalPrice.textContent = this.totalPrice.toLocaleString('vi-VN') + ' VNĐ';
    }

    // Xử lý nút "Xác nhận thanh toán"
    handlePaymentConfirmation() {
        const confirmButton = document.querySelector('.payment-options .btn-primary');
        confirmButton.addEventListener('click', () => {
            const activeTab = document.querySelector('#paymentTabsContent .tab-pane.active');
            let isValid = false;

            if (activeTab.id === 'credit') {
                const cardNumber = document.getElementById('cardNumber').value;
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;
                isValid = cardNumber && expiryDate && cvv && cardNumber.length === 16 && expiryDate.match(/^\d{2}\/\d{2}$/) && cvv.length === 3;
            } else if (activeTab.id === 'wallet') {
                const walletType = document.getElementById('walletType').value;
                isValid = walletType !== '';
            } else if (activeTab.id === 'bank') {
                isValid = true; // Giả định chuyển khoản luôn hợp lệ (cần backend để xác nhận)
            }

            if (isValid) {
                const seatsQuery = encodeURIComponent(this.seats);
                const combosQuery = encodeURIComponent(JSON.stringify(this.combos));

                // Chuyển hướng đến finish.html với các tham số cần thiết
                window.location.href = `/doancso1.1/finish.html?movie=${encodeURIComponent(this.movieTitle)}&cinema=${encodeURIComponent(this.cinema)}&showtime=${encodeURIComponent(this.showtime)}&address=${encodeURIComponent(this.address)}&seats=${seatsQuery}&combos=${combosQuery}&total=${this.totalPrice}&poster=${encodeURIComponent(this.poster)}`;            } else {
                alert('Vui lòng điền đầy đủ thông tin thanh toán!');
            }
        });
    }

    // Khởi động lớp
    init() {
        this.displayPaymentInfo();
        this.displaySummary();
        this.handlePaymentConfirmation();
    }
}

// Khởi tạo lớp PaymentController khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    const paymentController = new PaymentController();
    paymentController.init();
});
