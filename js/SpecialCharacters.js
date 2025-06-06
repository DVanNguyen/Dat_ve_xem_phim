// Kiểm tra Họ và tên không chứa số hoặc ký tự đặc biệt
const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/u; // hỗ trợ cả tiếng Việt
if (!nameRegex.test(name)) {
    alert("Họ và tên không được chứa số hoặc ký tự đặc biệt.");
    return;
}
