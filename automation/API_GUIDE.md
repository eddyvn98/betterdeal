# Tài liệu Hướng dẫn sử dụng AI Quote API

Cổng API này cho phép các hệ thống bên ngoài gửi yêu cầu thô của khách hàng để nhận về báo giá và phân tích yêu cầu từ AI Emdash của PixelPro.

## 1. Thông tin chung

- **Endpoint**: `POST /api/v1/external/quote`
- **Định dạng dữ liệu**: `application/json`
- **Xác thực (Auth)**: Header `x-api-key`

## 2. Xác thực (Authentication)

Bạn phải gửi mã bí mật trong header của mỗi yêu cầu.
Mã bí mật của bạn (có trong file `.env`): **`px-secret-78c4efe8`**

```http
x-api-key: px-secret-78c4efe8
```

## 3. Cấu trúc yêu cầu (Request Body)

| Trường | Kiểu | Bắt buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| `customerRequest` | string | Có | Nội dung yêu cầu thô từ khách hàng |
| `lang` | string | Không | Ngôn ngữ phản hồi (`vi` hoặc `en`). Mặc định là `vi`. |

**Ví dụ Body:**
```json
{
  "customerRequest": "Tôi muốn làm một trang landing page bán mỹ phẩm chuẩn SEO, ngân sách tầm 5-7 triệu.",
  "lang": "vi"
}
```

## 4. Cấu trúc phản hồi (Response)

Dữ liệu trả về là một đối tượng JSON chứa kết quả phân tích và nội dung trả lời.

| Trường | Mô tả |
| :--- | :--- |
| `success` | Trạng thái thành công (`true/false`) |
| `data.reply` | Nội dung phản hồi bằng Markdown để hiển thị cho khách hàng |
| `data.lead` | Dữ liệu khách hàng đã được bóc tách (projectType, goals, estimatedQuote, v.v.) |

## 5. Ví dụ mã nguồn (Code Examples)

### cURL
```bash
curl -X POST http://localhost:8787/api/v1/external/quote \
  -H "Content-Type: application/json" \
  -H "x-api-key: px-secret-78c4efe8" \
  -d '{
    "customerRequest": "Tôi muốn làm 1 landing page chuẩn SEO.",
    "lang": "vi"
  }'
```

### JavaScript (Fetch)
```javascript
const response = await fetch('http://localhost:8787/api/v1/external/quote', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'px-secret-78c4efe8'
  },
  body: JSON.stringify({
    customerRequest: "Tôi muốn làm 1 landing page chuẩn SEO.",
    lang: "vi"
  })
});

const result = await response.json();
console.log(result.data.reply); // Nội dung phản hồi AI
console.log(result.data.lead.estimatedQuote); // Giá dự kiến
```

### Python (Requests)
```python
import requests

url = "http://localhost:8787/api/v1/external/quote"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "px-secret-78c4efe8"
}
data = {
    "customerRequest": "Tôi muốn làm 1 landing page chuẩn SEO.",
    "lang": "vi"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---
> [!TIP]
> **Tự động hóa**: Bạn có thể xem ví dụ thực tế cách triển khai vòng lặp gọi API này trong file [test-runner.js](file:///d:/porfolio/automation/test-runner.js).
