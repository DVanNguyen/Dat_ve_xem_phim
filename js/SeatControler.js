 SeatController {
    constructor() {
        // Lấy thông tin từ URL
        const urlParams = new URLSearchParams(window.location.search);
        this.movieTitle = urlParams.get('movie') || 'Loetoeng Kasarung';
        this.cinema = urlParams.get('cinema') || 'Cinema Galaxy';
        this.showtime = urlParams.get('showtime') || '18:00, Hôm nay';
        this.address = urlParams.get('address') || '123 Đường Láng, Hà Nội';
        this.poster = urlParams.get('poster') || 'https://via.placeholder.com/200x300';

        // Khởi tạo các thuộc tính
        this.rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        this.seatTypes = [
            { type: 'normal', price: 80000, count: 4 },
            { type: 'premium', price: 120000, count: 1 },
            { type: 'vip', price: 150000, count: 1 }
        ];
        this.comboPrices = [50000, 90000, 70000];
        this.comboNames = ['Combo 1', 'Combo 2', 'Combo 3'];
        this.selectedSeats = [];
        this.selectedCombos = [];
        this.totalPrice = 0;
    }

    // Hiển thị thông tin phim và rạp
    displayMovieInfo() {
        document.getElementById('movie-title').textContent = this.movieTitle;
        document.getElementById('cinema').textContent = this.cinema;
        document.getElementById('showtime').textContent = this.showtime;
        document.getElementById('address').textContent = this.address;
        document.getElementById('movie-poster').src = this.poster;
    }

    // Tạo bản đồ ghế
    createSeatMap() {
        const seatContainer = document.getElementById('seat-container');
        this.rows.forEach((row, rowIndex) => {
            const seatRow = document.createElement('div');
            seatRow.className = 'seat-row';

            for (let i = 1; i <= 10; i++) {
                const seat = document.createElement('span');
                seat.className = 'seat';
                seat.textContent = `${row}${i}`;
                seat.setAttribute('data-type', 'normal');
                seat.setAttribute('data-price', 80000);

                // Gán loại ghế cho các hàng từ E và F
                if (rowIndex >= 4) {
                    const randomType = this.seatTypes[Math.floor(Math.random() * this.seatTypes.length)];
                    seat.setAttribute('data-type', randomType.type);
                    seat.setAttribute('data-price', randomType.price);

                    if (randomType.count > 0) {
                        seat.classList.add(randomType.type);
                        randomType.count--;
                    }
                }

                // Ghế đã được đặt (20% xác suất)
                if (Math.random() < 0.2) {
                    seat.classList.add('booked');
                }

                seatRow.appendChild(seat);
            }

            seatContainer.appendChild(seatRow);
        });
    }

    // Xử lý chọn ghế
    handleSeatSelection() {
        const seats = document.querySelectorAll('.seat:not(.booked)');
        seats.forEach(seat => {
            seat.addEventListener('click', () => {
                const seatId = seat.textContent;
                const price = parseInt(seat.getAttribute('data-price'));

                if (this.selectedSeats.includes(seatId)) {
                    this.selectedSeats = this.selectedSeats.filter(id => id !== seatId);
                    this.totalPrice -= price;
                    seat.classList.remove('selected');
                } else {
                    this.selectedSeats.push(seatId);
                    this.totalPrice += price;
                    seat.classList.add('selected');
                }

                this.updateSummary();
            });
        });
    }

    // Xử lý chọn combo
    handleComboSelection() {
        const comboItems = document.querySelectorAll('.combo-item');
        comboItems.forEach((item, index) => {
            const quantityDisplay = item.querySelector('.quantity');
            const btnIncrease = item.querySelector('.btn-increase');
            const btnDecrease = item.querySelector('.btn-decrease');
            let quantity = 0;

            btnIncrease.addEventListener('click', () => {
                quantity++;
                quantityDisplay.textContent = quantity;
                this.updateComboSelection(index, quantity);
                this.updateSummary();
            });

            btnDecrease.addEventListener('click', () => {
                if (quantity > 0) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                    this.updateComboSelection(index, quantity);
                    this.updateSummary();
                }
            });
        });
    }

    // Cập nhật thông tin combo đã chọn
    updateComboSelection(index, quantity) {
        if (quantity > 0) {
            this.selectedCombos[index] = { 
                name: this.comboNames[index], 
                quantity: quantity, 
                price: this.comboPrices[index] 
            };
        } else {
            this.selectedCombos[index] = null;
        }
    }

    // Cập nhật tóm tắt đơn hàng
    updateSummary() {
        const seats = document.querySelectorAll('.seat:not(.booked)');
        const selectedSeatsDisplay = document.getElementById('selected-seats');
        const selectedCombosDisplay = document.getElementById('selected-combos');
        const totalPriceDisplay = document.getElementById('total-price');

        // Tính tổng giá từ ghế
        this.totalPrice = this.selectedSeats.reduce((sum, seatId) => {
            const seat = Array.from(seats).find(s => s.textContent === seatId);
            return sum + parseInt(seat.getAttribute('data-price'));
        }, 0);

        // Tính tổng giá từ combo
        const comboTotal = this.selectedCombos.reduce((sum, combo) => {
            return combo ? sum + combo.price * combo.quantity : sum;
        }, 0);
        this.totalPrice += comboTotal;

        // Hiển thị thông tin
        selectedSeatsDisplay.textContent = this.selectedSeats.length > 0 ? this.selectedSeats.join(', ') : 'Chưa chọn ghế';
        const comboText = this.selectedCombos.filter(c => c).map(c => `${c.name} (x${c.quantity})`).join(', ');
        selectedCombosDisplay.textContent = comboText || 'Chưa chọn combo';
        totalPriceDisplay.textContent = this.totalPrice.toLocaleString('vi-VN') + ' VNĐ';
    }

    // Xử lý nút "Tiếp tục thanh toán"
    handleProceedToPayment() {
        const proceedButton = document.getElementById('proceed-to-payment');
        proceedButton.addEventListener('click', () => {
            if (this.selectedSeats.length === 0) {
                alert('Vui lòng chọn ít nhất một ghế trước khi thanh toán!');
                return;
            }
            const seatsQuery = encodeURIComponent(this.selectedSeats.join(','));
            const combosQuery = encodeURIComponent(JSON.stringify(this.selectedCombos.filter(c => c)));
            window.location.href = `/Dat_ve_xem_phim/pay.html?movie=${encodeURIComponent(this.movieTitle)}&cinema=${encodeURIComponent(this.cinema)}&showtime=${encodeURIComponent(this.showtime)}&address=${encodeURIComponent(this.address)}&seats=${seatsQuery}&combos=${combosQuery}&total=${this.totalPrice} &poster=${encodeURIComponent(this.poster)}`;
        });
    }

    // Khởi động lớp
    init() {
        this.displayMovieInfo();
        this.createSeatMap();
        this.handleSeatSelection();
        this.handleComboSelection(); 
        this.handleProceedToPayment();
        this.updateSummary();
    }
}

// Khởi tạo lớp SeatSelection khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    const seatController = new SeatController();
    seatController.init();
});
