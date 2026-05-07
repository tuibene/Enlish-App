<div align="center">

# 🎓 English Learning Platform

### Nền tảng học tiếng Anh trực tuyến tích hợp AI & Thanh toán điện tử

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![VNPay](https://img.shields.io/badge/VNPay-Payment_Gateway-FF0000?style=for-the-badge&logo=vnpay&logoColor=white)](https://vnpay.vn/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

**English Learning Platform** là một ứng dụng web full-stack giúp người dùng học tiếng Anh hiệu quả thông qua các bài luyện tập tương tác, thi thử IELTS chuẩn format, trợ lý AI thông minh tích hợp cân bằng tải, và hệ thống thanh toán khóa học Premium.

---

[Tính năng](#-tính-năng-chính) •
[Công nghệ](#-công-nghệ-sử-dụng) •
[Cài đặt](#-cài-đặt-và-chạy-dự-án) •
[API](#-api-endpoints) •
[Cấu trúc](#-cấu-trúc-dự-án)

</div>

---

## ✨ Tính năng chính

### 🤖 Hạ tầng Trợ lý AI (AI Tutor) Tiên tiến
- Chat trực tiếp với AI để hỏi đáp về ngữ pháp, từ vựng.
- **AI Key Rotation & Load Balancing**: Hệ thống tự động xoay vòng nhiều API Keys của Gemini (Round-robin) và tự động thử lại (Exponential backoff) để chống nghẽn mạng và vượt giới hạn Quota (Lỗi 429).
- **AI Caching & Rate Limiting**: Tối ưu hóa truy vấn AI bằng bộ nhớ đệm (LRU Cache) và chống spam.

### 💳 Tích hợp Thanh toán VNPay
- Mua khóa học Premium trực tuyến qua cổng thanh toán VNPay (Sandbox).
- Hệ thống bảo mật mã hóa **HMAC-SHA512** bảo vệ giao dịch.
- Xử lý **IPN (Server-to-Server)** và Fallback bảo mật khi chạy Localhost để mở khóa tự động.
- Trang hiển thị kết quả thanh toán đẹp mắt và cập nhật thời gian thực.

### 📝 Thi thử IELTS (Official Mock Test & Practice)
- Bài thi mô phỏng **CBT (Computer-Based Test)** đầy đủ 4 kỹ năng (Nghe, Nói, Đọc, Viết) với giao diện chuẩn thi thật.
- Tính thời gian chính xác, cảnh báo nộp bài tự động.
- Tự động lưu tiến trình làm bài.

### 🗣️ Luyện nói (Speaking Practice & Speaking Room)
- Ghi âm trực tiếp bằng **MediaRecorder API** và hiển thị sóng âm (waveform) thời gian thực.
- **Phòng luyện nói (Speaking Room)**: Gọi video/âm thanh nhóm và kết nối **P2P (Peer-to-Peer) qua WebRTC** (sử dụng Socket.io làm Signaling Server).
- Phân tích phát âm, từ vựng và ngữ pháp bằng **Gemini 2.5 Flash**.
- Chấm điểm nghiêm ngặt theo từng tiêu chí **IELTS Band Score (0-9)**.

### ✍️ Luyện viết (Writing Practice)
- Chấm bài viết (Task 1 & Task 2) theo 4 tiêu chí chuẩn IELTS: *Task Achievement, Coherence, Lexical Resource, Grammar*.
- Gợi ý từ vựng band cao và sửa lỗi ngữ pháp tự động.

### 👂 Luyện nghe (Listening) & 📖 Luyện đọc (Reading)
- Audio/Media được lưu trữ và tối ưu hóa qua **Cloudinary CDN**.
- Bài đọc đa dạng, đồng bộ transcript thời gian thực.
- Hỗ trợ tải và đọc tài liệu PDF trực tiếp trên trình duyệt.

### 🎯 Đánh giá năng lực đầu vào (Placement Test)
- Hệ thống bài kiểm tra xếp lớp toàn diện để phân loại trình độ học viên ngay khi đăng ký.
- Admin có thể cấu hình linh hoạt bộ câu hỏi từ trang Quản trị (Placement Config).

### 📊 Theo dõi tiến độ & Đa ngôn ngữ (Dashboard & i18n)
- Giao diện Dashboard/Profile trực quan giúp học viên theo dõi tiến trình làm bài, lịch sử thanh toán và điểm số các kỹ năng.
- Hỗ trợ Đa ngôn ngữ (Internationalization - i18n) giúp nền tảng dễ dàng mở rộng cho nhiều đối tượng người dùng.

### 🏫 Quản trị hệ thống (Admin Dashboard)
- Quản lý **Người dùng** (Phân quyền ROOT, ADMIN, USER).
- Quản lý **Doanh thu & Giao dịch (Orders)** từ VNPay.
- Tạo và upload đề thi tự động bằng cách dán JSON tạo từ ChatGPT/Claude.
- Quản lý tài liệu, khóa học và cài đặt bài thi xếp lớp (Placement Test).

---

## 🛠 Công nghệ sử dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Next.js** | 16.1.6 | React Framework (App Router) |
| **React** | 19.2.3 | UI Library |
| **TypeScript** | 5.x | Type-safe development |
| **TailwindCSS** | 4.x | Utility-first CSS |
| **Lucide React** | 0.575.0 | Icon library |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.21.0 | Web framework |
| **MongoDB / Mongoose** | 8.7.0 | Database & ODM |
| **Socket.io** | 4.8.3 | WebSocket server |
| **Passport.js** | 0.7.0 | Authentication (Google OAuth) |
| **qs & crypto** | Built-in | Tạo signature cho VNPay |

### Dịch vụ bên thứ ba
| Dịch vụ | Mục đích |
|---------|----------|
| **Google Gemini 2.5 Flash** | AI Tutor, chấm bài, phân tích (Sử dụng SDK mới `@google/genai`) |
| **VNPay Sandbox** | Cổng thanh toán nội địa |
| **Cloudinary** | Lưu trữ Audio, PDF, Image |
| **MongoDB Atlas** | Cloud database |

---

## 🚀 Cài đặt và chạy dự án

### 1. Clone dự án
```bash
git clone https://github.com/tuibene/Enlish-App.git
cd Enlish-App
```

### 2. Cài đặt Backend & Frontend
```bash
# Cài backend
cd backend
npm install

# Cài frontend
cd ../frontend
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `backend/.env` dựa trên `.env.example`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_string
JWT_SECRET=your_jwt_secret

# Cấu hình Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:3000

# Cấu hình Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cấu hình AI Gemini (Hỗ trợ nhiều key để xoay vòng)
GEMINI_API_KEY=key_chinh
GEMINI_API_KEY_1=key_phu_1
GEMINI_API_KEY_2=key_phu_2
GEMINI_API_KEY_3=key_phu_3

# Cấu hình VNPay Sandbox
VNP_TMN_CODE=CGXZLS0Z
VNP_HASH_SECRET=XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:5000/api/payment/vnpay_return
```

### 4. Seed dữ liệu tự động
Dự án cung cấp nhiều script tự động tạo dữ liệu mẫu phong phú:
```bash
cd backend
node seedCourses.js
node seedOfficialMocks.js
node seed4SkillsExams.js
node seedPremiumContent.js
```

### 5. Chạy dự án
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 📡 API Endpoints (Nổi bật & Đầy đủ)

### Authentication (`/api/users`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/users/register` | Đăng ký tài khoản |
| `POST` | `/api/users/login` | Đăng nhập |
| `GET` | `/api/users/profile` | Lấy thông tin người dùng |
| `PUT` | `/api/users/profile` | Cập nhật hồ sơ |

### Payment & Orders (`/api/payment` & `/api/orders`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/payment/create_payment_url` | Khởi tạo giao dịch VNPay |
| `GET` | `/api/payment/vnpay_ipn` | VNPay Webhook cập nhật DB |
| `GET` | `/api/payment/vnpay_return` | Xử lý kết quả trả về từ VNPay |
| `GET` | `/api/orders` | (Admin) Lấy danh sách doanh thu |

### Courses (`/api/courses`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/courses` | Danh sách khóa học |
| `GET` | `/api/courses/:id` | Chi tiết khóa học |
| `POST` | `/api/courses` | Tạo khóa học (Admin) |

### AI Tutor (`/api/ai-tutor`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/ai-tutor/chat` | Chat với AI Tutor |
| `POST` | `/api/ai-tutor/analyze-speaking` | Phân tích bài nói |
| `POST` | `/api/ai-tutor/grade-essay` | Chấm bài viết |
| `POST` | `/api/ai-tutor/analyze-listening` | Phân tích listening |

### Exams (`/api/exams`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/exams` | Danh sách bài thi |
| `POST` | `/api/exams` | Tạo bài thi (Admin) |
| `POST` | `/api/exams/:id/submit` | Nộp bài thi |

### Official Mock IELTS (`/api/official-mocks`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/official-mocks` | Danh sách đề thi CBT chính thức |
| `POST` | `/api/official-mocks/submit`| Nộp toàn bộ 4 kỹ năng |

### Placement Test (`/api/placement`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/placement/test` | Lấy bài test xếp lớp |
| `POST` | `/api/placement/submit` | Nộp bài test |

### Materials (`/api/materials`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/materials` | Danh sách tài liệu |
| `POST` | `/api/materials` | Upload tài liệu (Admin) |

---

## 📁 Cấu trúc dự án

```
english-learning-platform/
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Database & Passport configuration
│   │   ├── controllers/       # Route handlers
│   │   │   ├── aiTutorController.js      # Tính năng AI
│   │   │   ├── paymentController.js      # Tích hợp VNPay
│   │   │   ├── orderController.js        # Thống kê giao dịch
│   │   │   ├── officialMockExamController.js
│   │   │   ├── authController.js         # Authentication logic
│   │   │   ├── courseController.js        # Course management
│   │   │   ├── examController.js         # Exam & quiz logic
│   │   │   ├── exerciseController.js     # Exercise management
│   │   │   ├── materialController.js     # Learning materials
│   │   │   ├── placementController.js    # Placement test
│   │   │   └── placementConfigController.js
│   │   ├── middleware/        # Auth, Role & Rate Limiting
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js, Course.js, Exam.js
│   │   │   ├── Order.js                  # Lịch sử mua hàng
│   │   │   └── OfficialMockExam.js       # Đề thi 4 kỹ năng
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic services
│   │   │   └── vnpayService.js           # Xử lý chữ ký HMAC VNPay
│   │   ├── sockets/           # Socket.io real-time handlers
│   │   └── utils/             # Utility functions
│   │       ├── geminiClient.js           # Wrapper gọi AI chống lỗi
│   │       ├── geminiKeyPool.js          # Load Balancer API Keys
│   │       └── aiCache.js                # Bộ nhớ đệm LRU cho AI
│   ├── .env.example           # Environment variables template
│   ├── server.js              # Application entry point
│   └── seed*.js               # Các script tạo dữ liệu mẫu
│
├── frontend/                   # Frontend (Next.js 16 + TypeScript)
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   │   ├── orders/                   # Giao diện Admin quản lý thanh toán
│   │   │   └── official-mocks/           # Quản lý đề thi CBT
│   │   ├── auth/              # Authentication pages
│   │   ├── courses/           # Khóa học & Mua Premium
│   │   ├── payment/result/    # Trang báo kết quả VNPay
│   │   ├── practice/          # Các module Luyện tập
│   │   │   ├── ai-tutor/     # AI Tutor chat interface
│   │   │   ├── exercises/    # Interactive exercises
│   │   │   ├── listening/    # Listening practice
│   │   │   ├── speaking/     # Speaking practice
│   │   │   ├── speaking-room/# Live speaking room
│   │   │   └── writing/      # Writing practice (Essay Grader)
│   │   └── exams/ielts-mock/  # Môi trường thi thử CBT
│   ├── components/            # Reusable React components
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   └── services/              # API service functions
│
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

---

## 🔐 Bảo mật

- **JWT Authentication**: Xác thực bằng JSON Web Token.
- **Helmet.js**: Bảo vệ HTTP headers.
- **CORS**: Kiểm soát cross-origin requests.
- **Bcrypt**: Mã hóa mật khẩu an toàn.
- **Environment Variables**: Tất cả secrets được lưu trong `.env` (không đẩy lên git).
- **HMAC-SHA512**: Mã hóa chữ ký điện tử cho giao dịch VNPay.
- **Input Validation**: Ngăn chặn XSS và SQL Injection.
- **Passport.js**: OAuth 2.0 authentication strategy (Google Login).

> ⚠️ **Lưu ý**: File `.env` chứa thông tin nhạy cảm (API keys, database credentials) và **KHÔNG** được đẩy lên Git. Hãy sử dụng file `.env.example` làm template.

---

## 🌐 Real-time Features

Dự án sử dụng **Socket.io** cho các tính năng thời gian thực (real-time):
- 💬 Chat với AI Tutor mượt mà như người thật.
- 🎙️ Phòng luyện nói trực tiếp (Speaking Room).
- 📊 Cập nhật tiến độ học tập và đồng bộ trạng thái thanh toán.

---

## 💳 Tài khoản Test Thanh Toán (VNPay Sandbox)

Để thử nghiệm tính năng mua khóa học Premium trong môi trường phát triển, vui lòng sử dụng tài khoản ngân hàng ảo (Sandbox) do VNPay cung cấp:

- **Ngân hàng**: `NCB`
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mật khẩu OTP**: `123456`

---

## 📜 Scripts hữu ích

### Backend
```bash
npm start          # Chạy production
npm run dev        # Chạy development (hot reload)
node seedCourses.js        # Seed dữ liệu khóa học
node seedOfficialMocks.js  # Seed đề thi IELTS CBT
node seedExercises.js      # Seed bài tập
node seedMaterials.js      # Seed tài liệu
node seedPremiumContent.js # Seed nội dung premium
```

### Frontend
```bash
npm run dev        # Chạy development
npm run build      # Build production
npm start          # Chạy production build
npm run lint       # Kiểm tra code style
```

---

## 👥 Đóng góp

1. Fork dự án
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

---

## 📄 License

Dự án được phát hành dưới giấy phép [ISC License](https://opensource.org/licenses/ISC).

---

<div align="center">

**Được phát triển với ❤️ bởi nhóm DACNTT**

</div>
