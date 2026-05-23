# 🎧 Rổ Truyện - Nền Tảng Nghe Truyện Audio Đỉnh Cao

**Rổ Truyện** là một ứng dụng web full-stack hiện đại dành riêng cho việc thưởng thức các tác phẩm truyện chữ kết hợp truyện âm thanh (audio stories) bằng Tiếng Việt. Dự án được thiết kế với giao diện người dùng cao cấp, tông màu cam năng động (`#FF8C00`), tích hợp trình phát nhạc tùy chỉnh mượt mà và hệ thống quản trị (Admin Dashboard) mạnh mẽ hỗ trợ chuyển đổi văn bản thành giọng nói (Text-To-Speech - TTS).

---

## 🚀 Công Nghệ Sử Dụng

Ứng dụng được xây dựng dựa trên những công nghệ hiện đại và tối ưu nhất hiện nay:

*   **Frontend & Backend**: [Next.js 16 (App Router)](https://nextjs.org/) với React 19 đem lại hiệu năng vượt trội và hỗ trợ SEO tối đa.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) tạo nên một thiết kế hiện đại, mượt mà và đáp ứng hoàn hảo trên mọi kích thước màn hình (Responsive).
*   **Database ORM**: [Prisma 6](https://www.prisma.io/) giúp quản lý và truy vấn cơ sở dữ liệu một cách trực quan, an toàn và đồng bộ.
*   **Database & File Storage**: [Supabase](https://supabase.com/) cung cấp cơ sở dữ liệu PostgreSQL mạnh mẽ và hệ thống Storage để lưu trữ các file audio chất lượng cao.
*   **Icons**: [Lucide React](https://lucide.dev/) đem lại hệ thống icon phong phú, đồng bộ.

---

## ✨ Tính Năng Nổi Bật

### 🌐 Giao Diện Công Cộng (Public Site)
*   **Trang Chủ Hiện Đại**: Hiển thị danh sách các tác phẩm truyện mới nhất dưới dạng lưới (Grid) đẹp mắt, có huy hiệu `NEW` nổi bật dành cho truyện mới.
*   **Trình Phát Audio Cao Cấp (Custom Audio Player)**:
    *   Phát, tạm dừng và tua nhanh/chậm 10 giây.
    *   Thanh tiến trình (Progress bar) kéo-thả mượt mà để nhảy đến phân đoạn mong muốn.
    *   Bộ điều chỉnh âm lượng thông minh và nút tắt tiếng nhanh.
    *   Hiển thị thời gian thực tế và tổng thời lượng của câu chuyện.
*   **Đọc Truyện & Nghe Truyện Song Song**: Người dùng có thể vừa nghe giọng đọc audio chất lượng cao vừa theo dõi nội dung chữ được định dạng rõ ràng ở phía dưới.
*   **Tối Ưu SEO**: Tự động tối ưu hóa thẻ tiêu đề, mô tả và cấu trúc HTML5 chuẩn SEO cho từng trang chi tiết câu chuyện.

### 🔐 Hệ Thống Quản Trị (Admin Dashboard)
*   **Đăng Nhập Bảo Mật**: Bảo vệ trang quản trị bằng mật khẩu quản trị viên, xác thực thông qua HttpOnly Cookie an toàn và chống tấn công XSS.
*   **Quản Lý Truyện (CRUD)**:
    *   Xem danh sách toàn bộ truyện hiện có trong hệ thống dưới dạng bảng trực quan.
    *   Thêm truyện mới, chỉnh sửa thông tin truyện cũ, hoặc xóa truyện khỏi hệ thống.
*   **Quy Trình TTS & Tải Lên Tự Động**: Khi tạo truyện mới, hệ thống sẽ gửi văn bản đến API Text-To-Speech (TTS) -> Nhận file âm thanh nhị phân -> Tự động tải lên **Supabase Storage** -> Lưu thông tin truyện và liên kết `audioUrl` vào database. Quy trình có cơ chế xử lý lỗi thông minh (nếu API TTS lỗi, truyện vẫn được lưu an toàn với nội dung chữ và thông báo cảnh báo).

---

## 📁 Cấu Trúc Thư Mục Chính

```text
audio-stories/
├── prisma/
│   └── schema.prisma          # Định nghĩa cấu trúc bảng Story trong PostgreSQL
├── public/
│   ├── logo.png               # Logo chính thức của Rổ Truyện
│   └── ...                    # Các file tĩnh khác
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── dashboard/     # Trang quản lý CRUD truyện (Client Component)
│   │   │   ├── layout.tsx     # Bố cục giao diện trang Admin
│   │   │   └── page.tsx       # Trang đăng nhập Admin
│   │   ├── api/
│   │   │   ├── admin/auth/    # API xác thực Admin (Set HttpOnly Cookie)
│   │   │   ├── stories/       # API lấy danh sách & tạo truyện mới (Tích hợp TTS)
│   │   │   └── stories/[id]/  # API lấy chi tiết, sửa và xóa truyện
│   │   ├── story/[id]/        # Trang chi tiết truyện cho người đọc (Server Component)
│   │   ├── globals.css        # Cấu hình Tailwind v4 & Shadcn CSS, màu cam chủ đạo
│   │   ├── layout.tsx         # Bố cục chung của trang web (Inter Font, SEO)
│   │   └── page.tsx           # Trang chủ hiển thị lưới truyện (Server Component)
│   ├── components/
│   │   ├── ui/                # Các component giao diện dùng chung từ Shadcn UI
│   │   ├── AudioPlayer.tsx    # Trình phát audio tùy chỉnh thuần HTML5 & React
│   │   ├── Header.tsx         # Thanh điều hướng phía trên chứa Logo & Tên thương hiệu
│   │   ├── Footer.tsx         # Chân trang chuyên nghiệp 3 cột
│   │   ├── StoryCard.tsx      # Thẻ hiển thị thông tin rút gọn của truyện
│   │   └── FloatingActionButton.tsx # Nút liên hệ nổi ở góc màn hình với hiệu ứng pulse
│   ├── lib/
│   │   ├── prisma.ts          # Khởi tạo duy nhất đối tượng Prisma Client
│   │   └── supabase.ts        # Cấu hình và hàm tải file lên Supabase Storage
│   └── proxy.ts               # Bộ lọc phân quyền (Middleware) bảo vệ trang admin
├── .env.example               # File cấu hình mẫu các biến môi trường
├── package.json               # Các thư viện và script chạy dự án
└── tsconfig.json              # Cấu hình TypeScript
```

---

## 🛠️ Hướng Dẫn Cài Đặt Dự Án

### 1. Tải Mã Nguồn & Cài Đặt Thư Viện

Mở terminal tại thư mục dự án và chạy lệnh sau để cài đặt tất cả các gói phụ thuộc:

```bash
npm install
```

### 2. Thiết Lập Biến Môi Trường (`.env`)

Sao chép file `.env.example` thành file `.env` thực tế:

```bash
cp .env.example .env
```

Mở file `.env` và điền các thông tin cấu hình từ tài khoản Supabase của bạn:

```env
# URL kết nối Database của Supabase (Sử dụng Transaction Pooler ở cổng 6543)
DATABASE_URL="postgresql://postgres.[MÃ_DỰ_ÁN]:[MẬT_KHẨU]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

# Supabase API Config
SUPABASE_URL="https://[MÃ_DỰ_ÁN].supabase.co"
# LƯU Ý QUAN TRỌNG: Phải dùng SERVICE_ROLE_KEY (Secret) chứ không phải ANON_KEY để có quyền upload file lên Storage
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key-here"
NEXT_PUBLIC_SUPABASE_URL="https://[MÃ_DỰ_ÁN].supabase.co"

# API Text-To-Speech (TTS) của bạn (Nếu chưa có, tạm thời để trống, hệ thống sẽ tự bỏ qua bước tạo audio)
CUSTOM_TTS_API_URL="https://your-tts-api.example.com/synthesize"

# Mật khẩu đăng nhập vào trang quản trị Admin (/admin)
ADMIN_PASSWORD="he2026"
```

### 3. Cấu Hình Trên Supabase Dashboard

#### A. Khởi Tạo Cơ Sở Dữ Liệu
Do các nhà mạng (ISP) tại Việt Nam thường chặn cổng kết nối cơ sở dữ liệu trực tiếp (`5432`) khiến lệnh `npx prisma db push` từ máy local gặp lỗi, bạn nên tạo bảng thủ công bằng cách:
1. Truy cập vào **Supabase Dashboard** -> Chọn dự án của bạn.
2. Chọn mục **SQL Editor** ở thanh công cụ bên trái -> Nhấp vào **New Query**.
3. Dán đoạn mã SQL dưới đây và nhấn **Run**:

```sql
CREATE TABLE IF NOT EXISTS "Story" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "audioUrl" TEXT DEFAULT '',
    "isNew" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);
```

4. Trở lại terminal local, chạy lệnh sau để Prisma cập nhật Client:
```bash
npx prisma generate
```

#### B. Tạo Storage Bucket để Lưu File Audio
1. Trên **Supabase Dashboard**, truy cập vào mục **Storage** -> Nhấp vào **New bucket**.
2. Đặt tên Bucket chính xác là: `audio-stories`.
3. Bật tùy chọn **Public** (để người dùng có thể nghe và tải trực tiếp các file audio).
4. Nhấn **Save** để hoàn tất.

---

## 🏃‍♂️ Khởi Chạy Ứng Dụng

Sau khi hoàn tất việc thiết lập các biến môi trường và cơ sở dữ liệu:

### Chạy Ở Chế Độ Phát Triển (Development)

```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: [http://localhost:3000](http://localhost:3000).
*   **Trang chủ người dùng**: [http://localhost:3000/](http://localhost:3000/)
*   **Trang quản trị viên**: [http://localhost:3000/admin](http://localhost:3000/admin) (Mật khẩu đăng nhập mặc định: `he2026`)

### Biên Dịch Và Chạy Chế Độ Sản Phẩm (Production)

```bash
npm run build
npm run start
```

---

## 📝 Giấy Phép (License)

Dự án này được phát triển phục vụ cho mục đích học tập và làm đồ án tốt nghiệp (DATN). Vui lòng không sao chép hoặc phân phối thương mại khi chưa được sự đồng ý.

---
Chúc bạn có những trải nghiệm tuyệt vời với **Rổ Truyện**! 🎧📖
