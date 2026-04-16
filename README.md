<div align="center">

# 🎓 English Learning Platform

### Nền tảng học tiếng Anh trực tuyến tích hợp AI

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)

**English Learning Platform** là một ứng dụng web full-stack giúp người dùng học tiếng Anh hiệu quả thông qua các bài luyện tập tương tác, thi thử IELTS, và trợ lý AI thông minh.

---

[Tính năng](#-tính-năng-chính) •
[Công nghệ](#-công-nghệ-sử-dụng) •
[Cài đặt](#-cài-đặt-và-chạy-dự-án) •
[API](#-api-endpoints) •
[Cấu trúc](#-cấu-trúc-dự-án)

</div>

---

## ✨ Tính năng chính

### 🗣️ Luyện nói (Speaking Practice)
- Ghi âm giọng nói trực tiếp bằng **MediaRecorder API**
- Phân tích phát âm, ngữ điệu và ngữ pháp bằng **Gemini AI Multimodal**
- Hiển thị sóng âm (waveform) real-time khi ghi âm
- Chấm điểm chi tiết theo từng tiêu chí IELTS Speaking

### 👂 Luyện nghe (Listening Practice)
- Phát audio với điều khiển tốc độ (0.5x - 2.0x)
- Đồng bộ transcript theo thời gian thực
- Phân tích transcript bằng AI
- Audio được lưu trữ trên **Cloudinary CDN**

### ✍️ Luyện viết (Writing Practice)
- Chấm bài viết theo chuẩn **IELTS Writing Band Score**
- Đánh giá chi tiết: Task Achievement, Coherence, Lexical Resource, Grammar
- Gợi ý cải thiện từ vựng và cấu trúc câu
- Hỗ trợ cả Task 1 và Task 2

### 📖 Luyện đọc (Reading Practice)
- Bài đọc đa dạng theo cấp độ
- Câu hỏi tương tác nhiều dạng
- Giải thích đáp án chi tiết

### 🤖 Trợ lý AI (AI Tutor)
- Chat trực tiếp với AI để hỏi đáp về ngữ pháp, từ vựng
- Hỗ trợ giải thích bài tập
- Gợi ý lộ trình học cá nhân hóa

### 📝 Thi thử IELTS Mock Test
- Bài thi mô phỏng đầy đủ 4 kỹ năng
- Tính thời gian như thi thật
- Chấm điểm và phân tích kết quả

### 🎯 Bài kiểm tra xếp lớp (Placement Test)
- Đánh giá trình độ ban đầu của người học
- Tự động gợi ý cấp độ phù hợp
- Cấu hình linh hoạt cho admin

### 👤 Quản lý người dùng
- Đăng ký / Đăng nhập bằng email & mật khẩu
- Đăng nhập bằng **Google OAuth 2.0**
- Quản lý hồ sơ cá nhân và tiến độ học tập
- Phân quyền Admin / User

### 🏫 Quản lý khóa học & tài liệu
- Hệ thống khóa học có cấu trúc
- Tài liệu học tập đa dạng (PDF, Audio, Video)
- Nội dung Premium cho người dùng trả phí

---

## 🛠 Công nghệ sử dụng

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Next.js** | 16.1.6 | React Framework (App Router) |
| **React** | 19.2.3 | UI Library |
| **TypeScript** | 5.x | Type-safe development |
| **TailwindCSS** | 4.x | Utility-first CSS |
| **Socket.io Client** | 4.8.3 | Real-time communication |
| **Lucide React** | 0.575.0 | Icon library |
| **React Markdown** | 10.1.0 | Markdown rendering |

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.21.0 | Web framework |
| **MongoDB / Mongoose** | 8.7.0 | Database & ODM |
| **Socket.io** | 4.8.3 | WebSocket server |
| **Passport.js** | 0.7.0 | Authentication |
| **JWT** | 9.0.2 | Token-based auth |
| **Helmet** | 8.0.0 | Security headers |
| **Multer** | 2.1.1 | File uploads |

### Dịch vụ bên thứ ba
| Dịch vụ | Mục đích |
|---------|----------|
| **Google Gemini AI** | AI Tutor, chấm bài, phân tích phát âm |
| **Google OAuth 2.0** | Đăng nhập bằng Google |
| **Cloudinary** | Lưu trữ & phân phối audio/media |
| **MongoDB Atlas** | Cloud database |

---

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MongoDB** (local hoặc Atlas)
- **Git**

### 1. Clone dự án

```bash
git clone https://github.com/tuibene/Enlish-App.git
cd Enlish-App
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
```

### 3. Cấu hình biến môi trường

Tạo file `.env` trong thư mục `backend/` dựa trên `.env.example`:

```bash
cp .env.example .env
```

Sau đó cập nhật các giá trị trong file `.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4. Cài đặt Frontend

```bash
cd ../frontend
npm install
```

### 5. Seed dữ liệu (tùy chọn)

```bash
cd ../backend
node seedCourses.js
node seedExercises.js
node seedMaterials.js
node seedPremiumContent.js
```

### 6. Chạy dự án

**Chạy Backend:**
```bash
cd backend
npm run dev
```
> Backend sẽ chạy tại `http://localhost:5000`

**Chạy Frontend (terminal mới):**
```bash
cd frontend
npm run dev
```
> Frontend sẽ chạy tại `http://localhost:3000`

---

## 📡 API Endpoints

### Authentication (`/api/users`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `POST` | `/api/users/register` | Đăng ký tài khoản |
| `POST` | `/api/users/login` | Đăng nhập |
| `GET` | `/api/users/profile` | Lấy thông tin người dùng |
| `PUT` | `/api/users/profile` | Cập nhật hồ sơ |

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

### Mock IELTS (`/api/mock-exams`)
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/mock-exams` | Danh sách đề thi thử |
| `GET` | `/api/mock-exams/:id` | Chi tiết đề thi thử |

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

### Health Check
| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/health` | Kiểm tra trạng thái API |

---

## 📁 Cấu trúc dự án

```
english-learning-platform/
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/            # Database & Passport configuration
│   │   ├── controllers/       # Route handlers
│   │   │   ├── aiTutorController.js      # AI features (chat, grading, analysis)
│   │   │   ├── authController.js         # Authentication logic
│   │   │   ├── courseController.js        # Course management
│   │   │   ├── examController.js         # Exam & quiz logic
│   │   │   ├── exerciseController.js     # Exercise management
│   │   │   ├── materialController.js     # Learning materials
│   │   │   ├── mockController.js         # IELTS mock test
│   │   │   ├── placementController.js    # Placement test
│   │   │   └── placementConfigController.js
│   │   ├── middleware/        # Auth & error handling middleware
│   │   ├── models/            # Mongoose schemas
│   │   │   ├── User.js                   # User model
│   │   │   ├── Course.js                 # Course model
│   │   │   ├── Exam.js                   # Exam model
│   │   │   ├── ExamResult.js             # Exam results
│   │   │   ├── Exercise.js               # Exercise model
│   │   │   ├── Material.js               # Material model
│   │   │   └── PlacementConfig.js        # Placement test config
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic services
│   │   ├── sockets/           # Socket.io real-time handlers
│   │   └── utils/             # Utility functions
│   ├── uploads/               # Uploaded files storage
│   ├── .env.example           # Environment variables template
│   ├── server.js              # Application entry point
│   ├── seedCourses.js         # Database seeder for courses
│   ├── seedExercises.js       # Database seeder for exercises
│   ├── seedMaterials.js       # Database seeder for materials
│   └── seedPremiumContent.js  # Database seeder for premium content
│
├── frontend/                   # Frontend (Next.js 16 + TypeScript)
│   ├── app/                   # Next.js App Router
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── auth/              # Authentication pages
│   │   ├── courses/           # Course browsing pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── exams/             # Exam pages
│   │   ├── login/             # Login page
│   │   ├── materials/         # Learning materials pages
│   │   ├── placement-test/    # Placement test page
│   │   ├── practice/          # Practice modules
│   │   │   ├── ai-tutor/     # AI Tutor chat interface
│   │   │   ├── exercises/    # Interactive exercises
│   │   │   ├── listening/    # Listening practice
│   │   │   ├── reading/      # Reading practice
│   │   │   ├── speaking/     # Speaking practice
│   │   │   ├── speaking-room/# Live speaking room
│   │   │   └── writing/      # Writing practice (Essay Grader)
│   │   ├── profile/           # User profile page
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   └── Navbar.tsx         # Navigation bar
│   ├── context/               # React Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── locales/               # Internationalization files
│   ├── services/              # API service functions
│   └── utils/                 # Utility functions
│
├── .gitignore                 # Git ignore rules
└── README.md                  # Project documentation
```

---

## 🔐 Bảo mật

- **JWT Authentication**: Xác thực bằng JSON Web Token
- **Helmet.js**: Bảo vệ HTTP headers
- **CORS**: Kiểm soát cross-origin requests
- **Bcrypt**: Mã hóa mật khẩu
- **Environment Variables**: Tất cả secrets được lưu trong `.env` (không push lên git)
- **Input Validation**: Sử dụng Joi schema validation
- **Passport.js**: OAuth 2.0 authentication strategy

> ⚠️ **Lưu ý**: File `.env` chứa thông tin nhạy cảm (API keys, database credentials) và **KHÔNG** được đẩy lên Git. Sử dụng file `.env.example` làm template.

---

## 🌐 Real-time Features

Dự án sử dụng **Socket.io** cho các tính năng real-time:
- 💬 Chat với AI Tutor
- 🎙️ Phòng luyện nói trực tiếp (Speaking Room)
- 📊 Cập nhật tiến độ học tập

---

## 📜 Scripts hữu ích

### Backend
```bash
npm start          # Chạy production
npm run dev        # Chạy development (hot reload)
node seedCourses.js        # Seed dữ liệu khóa học
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
