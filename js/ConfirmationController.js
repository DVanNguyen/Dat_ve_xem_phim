class ConfirmationController {
    constructor() {
        const urlParams = new URLSearchParams(window.location.search);
        this.movieTitle = decodeURIComponent(urlParams.get('movie') || 'Loetoeng Kasarung');
        this.cinema = decodeURIComponent(urlParams.get('cinema') || 'Cinema Galaxy');
        this.showtime = decodeURIComponent(urlParams.get('showtime') || '18:00, Hôm nay');
        this.address = decodeURIComponent(urlParams.get('address') || '123 Đường Láng, Hà Nội');
        this.seats = decodeURIComponent(urlParams.get('seats') || 'A1, B2');
        try {
            this.combos = urlParams.get('combos') ? JSON.parse(decodeURIComponent(urlParams.get('combos'))) : [];
        } catch (error) {
            console.error('Error parsing combos:', error);
            this.combos = [];
        }
        this.totalPrice = parseInt(urlParams.get('total') || '200000');
        this.poster = decodeURIComponent(urlParams.get('poster') || 'https://via.placeholder.com/150x225');
        console.log('Constructor Data:', {
            movieTitle: this.movieTitle,
            cinema: this.cinema,
            showtime: this.showtime,
            address: this.address,
            seats: this.seats,
            combos: this.combos,
            totalPrice: this.totalPrice,
            poster: this.poster
        });
    }

    // Hiển thị thông tin chi tiết vé
    displayTicketDetails() {
        document.getElementById('movie-title').textContent = this.movieTitle;
        document.getElementById('cinema').textContent = this.cinema;
        document.getElementById('address').textContent = this.address;
        document.getElementById('showtime').textContent = this.showtime;
        document.getElementById('selected-seats').textContent = this.seats;
        document.getElementById('selected-combos').textContent = this.combos.length > 0 ? this.combos.map(c => `${c.name} (x${c.quantity})`).join(', ') : 'Chưa chọn combo';
        document.getElementById('total-price').textContent = this.totalPrice.toLocaleString('vi-VN') + ' VNĐ';
        document.querySelector('.confirmation-details img').src = this.poster;
    }

    // Tạo mã QR từ thông tin vé
    generateQRCode() {
        try {
            const qrElement = document.getElementById("qrCode");
            if (!qrElement) {
                console.error('Element #qrCode not found in DOM');
                return;
            }

            // Xóa nội dung cũ để tránh chồng lấp
            qrElement.innerHTML = '';

            // Hàm làm sạch chuỗi: loại bỏ ký tự đặc biệt, xuống dòng, tab, và các ký tự không in được
            const cleanString = (str) => {
                if (!str) return '';
                // Loại bỏ ký tự xuống dòng, tab, và các ký tự điều khiển không mong muốn
                return str.replace(/[\r\n\t]+/g, ' ') // Thay xuống dòng/tab bằng khoảng trắng
                         .replace(/[^\x20-\x7E]+/g, '') // Chỉ giữ lại các ký tự ASCII in được
                         .trim(); // Xóa khoảng trắng thừa
            };

            // Format combo
            const formatCombos = (combos) => {
                if (!Array.isArray(combos) || combos.length === 0) return 'Chưa chọn combo';
                return combos.map(c => `${cleanString(c.name)} (x${c.quantity})`).join(', ');
            };

            // Chuẩn bị nội dung QR với các chuỗi đã được làm sạch
            const qrText = [
                'DreamBook Ticket',
                `Movie: ${cleanString(this.movieTitle) || 'Unknown Movie'}`,
                `Cinema: ${cleanString(this.cinema) || 'Unknown Cinema'}`,
                `Address: ${cleanString(this.address) || 'Unknown Address'}`,
                `Showtime: ${cleanString(this.showtime) || 'Unknown Showtime'}`,
                `Seats: ${cleanString(this.seats) || 'Chưa chọn ghế'}`,
                `Combos: ${formatCombos(this.combos)}`,
                `Total Price: ${cleanString(this.totalPrice.toLocaleString('vi-VN'))} VND`
            ].join('\n');

            console.log('QR Code Content:', qrText); // Log nội dung để kiểm tra

            // Tạo mã QR
            new QRCode(qrElement, {
                text: qrText,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H // Tăng độ chính xác
            });

        } catch (error) {
            console.error('Error generating QR Code:', error);
            // Hiển thị thông báo lỗi cho người dùng nếu cần
            qrElement.innerHTML = '<p style="color: red;">Lỗi tạo mã QR. Vui lòng thử lại.</p>';
        }
    }

    // Xử lý nút "Tiếp tục đặt vé"
    handleContinueBooking() {
        const continueButton = document.querySelector('.action-buttons .btn-secondary');
        if (continueButton) {
            continueButton.addEventListener('click', () => {
                window.location.href = '/doancso1.1/index.html';
            });
        } else {
            console.error('Button .btn-secondary not found');
        }
    }

    // Khởi động lớp
    init() {
        this.displayTicketDetails();
        this.generateQRCode();
        this.handleContinueBooking();
    }
}

// Khởi tạo lớp ConfirmationController khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
    const confirmationController = new ConfirmationController();
    confirmationController.init();
});