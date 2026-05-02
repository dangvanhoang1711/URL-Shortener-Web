  ---
  title: Executive Summary

  ---

  # Executive Summary  
  Báo cáo này trình bày thiết kế chi tiết của hệ thống **URL Shortener (Bitly-like)** theo ngôn ngữ và công nghệ đề xuất: **Frontend: React (Vite); Backend: Node.js + Express; CSDL: MySQL; ORM: Prisma; Auth (tùy chọn): JWT; Cache: Redis; Biểu đồ: Chart.js; Docker; Triển khai: Render/Railway; Kiểm thử: Postman, k6/JMeter**. Hệ thống đáp ứng 3 chức năng chính: **rút gọn link**, **redirect** và **thống kê click**. Kiến trúc bao gồm Frontend (React) giao tiếp qua API, Backend (Express/Node) xử lý logic, Database (MySQL qua Prisma) lưu trữ dữ liệu, và Redis để caching. Thiết kế bao gồm chi tiết schema Prisma/SQL, chiến lược indexing, đặc tả API (endpoint, request/response, mã trạng thái), thuật toán tạo ID (Base62 so với hash), kế hoạch kiểm tra collision, lưu log analytics (bảng clicks), tích hợp Redis (cache key, TTL, invalidation), luồng JWT (đăng ký/đăng nhập/middleware), cấu trúc component React với Vite, tích hợp Chart.js cho dashboard, Dockerfile và docker-compose, quy trình Git/CI (branch, commit), triển khai lên Render/Railway, kế hoạch kiểm thử (unit, integration, load), bảo mật (rate-limit, validate input, tránh open-redirect), đo hiệu năng (latency, throughput), giám sát (monitoring), và phân công nhiệm vụ cho từng thành viên cùng timeline 7–10 ngày.  

  ## 1. Kiến trúc Hệ thống  
  Sơ đồ kiến trúc đề xuất: khách (browser, mobile) gọi UI (React/Vite) → Backend API (Express trên Node.js) → Database MySQL (qua Prisma ORM) và optional Redis cache.  
  ```mermaid
  flowchart LR
      User[User] -->|Gửi request| Frontend["React Frontend (Vite)"]
      Frontend -->|HTTP API| Backend["Express.js Backend (Node.js)"]
      Backend --> Database[(MySQL / Prisma ORM)]
      Backend --> Cache[(Redis Cache)]

      Note["Cung cấp dữ liệu và tăng tốc<br/>(lưu redirect URLs, thống kê clicks)"]

      Database --- Note
      Cache --- Note
  ```
  Mô tả: 
  - **Frontend (React/Vite)** chịu trách nhiệm UI/UX, gửi HTTP requests tới Backend, hiển thị kết quả (short link, biểu đồ). React là thư viện xây dựng giao diện hiện đại (component-based)【7†L109-L117】.  
  - **Backend (Node.js + Express)**: xử lý API RESTful. Node.js là môi trường chạy JavaScript trên server【10†L158-L166】, Express giúp định nghĩa routes/middleware nhanh gọn (ví dụ `app.get('/path', handler)` để tạo API【5†L85-L94】).  
  - **CSDL (MySQL + Prisma)**: lưu trữ thông tin URL, người dùng, click. Prisma ORM giúp thao tác DB thuận tiện, với schema mô tả model và quan hệ【1†L154-L161】.  
  - **Cache (Redis)**: dùng để cache mapping `short_code -> original_url` nhằm tăng tốc redirect. Giải pháp caching-aside với Redis (như minh họa bên dưới) giúp giảm tải DB và tăng hiệu năng【18†L74-L82】【20†L219-L227】.  
  - **Triển khai**: ứng dụng được đóng gói bằng Docker để dễ deploy, có thể chạy trên Render hoặc Railway. Cấu hình CI/CD để mỗi lần push code sẽ tự động build và deploy.  

  ### 1.1. Mô hình triển khai  
  - **Load Balancer (Nginx/ALB)**: (phụ) phân phối tải.  
  - **Web Frontend (React/Vite)**: có thể host trên CDN hoặc static site (Netlify, Vercel).  
  - **Web API (Express)**: triển khai trên Node.js container/server.  
  - **Database (MySQL)**: dịch vụ RDS/Cloud DB. Sử dụng replication/cluster để scale.  
  - **Cache (Redis)**: một hoặc cụm Redis, dùng module Redis cho Node.  
  - **Monitoring**: sử dụng Prometheus/Grafana hoặc APM (AppSignal, NewRelic) để theo dõi latency, throughput, error rate, CPU, memory【36†L168-L177】.  

  ## 2. Data Flow Sơ đồ luồng  
  Mô tả luồng dữ liệu chính qua các use-case:

  ### 2.1. Flow **Tạo short link** (`POST /api/shorten`)  
  ```mermaid
  sequenceDiagram
      participant U as User
      participant F as Frontend
      participant B as Backend
      participant DB as MySQL (Prisma)

      U->>F: Nhập URL dài & nhấn "Shorten"
      F->>B: POST /api/shorten { url: "https://..." }
      B->>DB: INSERT original_url, createdAt -> IDs
      B->>B: Encode Base62 từ ID => short_code
      B->>DB: UPDATE record với short_code
      B-->>F: HTTP 200 {"short_url": ".../abc123"}
  ```
  - **Frontend**: Gửi POST body `{ url: "<original>" }`.  
  - **Backend**: Nhận vào, lưu vào `urls` để lấy `id` tự động tăng. Sau đó, encode `id` thành `short_code` (ví dụ Base62) và cập nhật bản ghi【1†L154-L161】. Trả về kết quả.  

  ### 2.2. Flow **Redirect** (`GET /:short_code`)  
  ```mermaid
  sequenceDiagram
      participant U as User
      participant B as Backend
      participant R as Redis
      participant DB as MySQL (Prisma)
      
      U->>B: GET /abc123
      B->>R: GET "abc123" => cache check
      alt Cache hit
          R-->>B: "https://original.com..."
      else Cache miss
          B->>DB: SELECT original_url FROM urls WHERE short_code="abc123"
          DB-->>B: original_url
          B->>R: SETEX "abc123" -> original_url (TTL)
      end
      B->>DB: UPDATE click_count, INSERT log vào clicks
      B-->>U: HTTP 302 Redirect to original_url
  ```
  - Đầu tiên kiểm tra **Redis** (cache-aside): nếu có trong cache, dùng luôn; nếu không, truy vấn DB, rồi lưu vào Redis cho những lần sau【20†L219-L227】【20†L233-L240】.  
  - Tăng `click_count++` (MySQL) và ghi thêm vào bảng `clicks` (logging thông tin click).  
  - Trả redirect 302 về `original_url`.  

  ### 2.3. Flow **Analytics (thống kê)** (`GET /api/stats/:short_code`)  
  ```mermaid
  sequenceDiagram
      participant F as Frontend
      participant B as Backend
      participant DB as MySQL (Prisma)
      
      F->>B: GET /api/stats/abc123
      B->>DB: SELECT click_count, (SELECT array of click logs) ...
      DB-->>B: Tổng click, danh sách {time, ip, agent}
      B-->>F: HTTP 200 {"total_clicks": X, "history": [...]}
  ```
  - Backend lấy tổng số click từ `urls.click_count` và (nếu cần) chi tiết từ bảng `clicks` (có thể phân tích thêm). Trả JSON.  

  ## 3. Cơ sở dữ liệu & Prisma Schema  

  ### 3.1. Prisma Schema (schema.prisma)  
  ```prisma
  datasource db {
    provider = "mysql"
    url      = env("DATABASE_URL")
  }
  generator client {
    provider = "prisma-client-js"
  }

  model User {
    id        Int     @id @default(autoincrement())
    username  String  @unique
    password  String
    createdAt DateTime @default(now())
    urls      Url[]
  }

  model Url {
    id           Int      @id @default(autoincrement())
    original_url String
    short_code   String   @unique
    created_at   DateTime @default(now())
    click_count  Int      @default(0)
    user         User?    @relation(fields: [userId], references: [id])
    userId       Int?
    clicks       Click[]
  }

  model Click {
    id         Int      @id @default(autoincrement())
    url        Url      @relation(fields: [urlId], references: [id])
    urlId      Int
    clicked_at DateTime @default(now())
    ip         String?
    userAgent  String?
    // Thêm trường location nếu muốn (từ IP → geo)
  }
  ```
  Giải thích:
  - `@id @default(autoincrement())` cho **ID tự tăng** (Prisma example: `id Int @id @default(autoincrement())`【1†L154-L161】).  
  - `@unique` đánh dấu cột phải unique, e.g. `short_code`, `username`【1†L154-L161】 (sẽ tự động tạo index).  
  - Mối quan hệ: một `Url` có thể thuộc về một `User` (nếu có auth), một `Click` tham chiếu tới `Url` gốc.  

  ### 3.2. SQL tương đương (MySQL)  
  ```sql
  CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE urls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    original_url TEXT NOT NULL,
    short_code VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    click_count INT DEFAULT 0,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE INDEX idx_short_code ON urls(short_code);

  CREATE TABLE clicks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    url_id INT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (url_id) REFERENCES urls(id)
  );
  ```
  - **Chỉ mục**: Tạo index trên `short_code` để truy vấn redirect nhanh (MySQL khuyến nghị index các cột trong WHERE để tối ưu SELECT【3†L477-L484】).  
  - Bảng `clicks` lưu log mỗi lần click (thời gian, IP, user-agent).  

  ### 3.3. Indexing Strategy  
  Theo MySQL: “Để cải thiện hiệu năng SELECT, tạo index trên các cột được search trong WHERE”【3†L477-L484】. Ở đây, truy vấn redirect chỉ định `WHERE short_code = ?`, nên `short_code` cần index. Bảng `clicks` có thể index `url_id` để tra cứu nhanh theo URL. Ta tránh index quá nhiều cột không cần thiết để không làm chậm INSERT/UPDATE.

  ## 4. Đặc tả API  

  Dưới đây là các endpoint chính:

  - **POST /api/register** (nếu có auth)  
    - Body JSON: `{ "username": "...", "password": "..." }`  
    - Trả về: 201 Created hoặc lỗi 400.  
    - Tạo user mới với mật khẩu đã hash (bcrypt).

  - **POST /api/login**  
    - Body JSON: `{ "username": "...", "password": "..." }`  
    - Trả về: 200 OK và `{ token: "JWT..." }` nếu thành công, hoặc 401 nếu sai.

  - **POST /api/shorten**  
    - Body JSON: `{ "url": "https://..." }`  
    - Headers (Auth): `Authorization: Bearer <token>` (nếu yêu cầu auth).  
    - 200 OK: `{ "short_url": "http://<domain>/<short_code>" }`  
    - 400 Bad Request: nếu URL không hợp lệ.  
    - Ví dụ:  
      ```json
      // Request
      { "url": "https://example.com/long-path" }
      // Response
      { "short_url": "http://localhost:3000/abc123" }
      ```

  - **GET /:short_code**  
    - Mô tả: redirect đến URL gốc.  
    - Trả: HTTP 302 Redirect (status 302 và header `Location: original_url`).  
    - 404 Not Found: nếu không tồn tại `short_code`.  
    - (Không trả JSON, chỉ chuyển hướng).

  - **GET /api/stats/:short_code**  
    - Mô tả: trả thống kê click.  
    - Trả JSON 200 với nội dung ví dụ:
      ```json
      {
        "total_clicks": 123,
        "clicks": [
          { "time": "2026-04-09T10:01:00Z", "ip": "1.2.3.4", "user_agent": "Chrome..." },
          { "time": "2026-04-09T10:05:00Z", "ip": "5.6.7.8", "user_agent": "Safari..." }
        ]
      }
      ```
    - 404: nếu `short_code` không tồn tại.

  - (Nếu có auth) **GET /api/links**  
    - Mô tả: danh sách link của user đang đăng nhập.  
    - Trả JSON 200: `[{ original_url, short_url, click_count, created_at }, ...]`.  

  ## 5. Tạo Unique ID & Collision  

  ### 5.1. Base62 Encoding  
  Cách tiếp cận chính là **auto-increment ID** và encode sang Base62 (ký tự [0-9a-zA-Z]). Ví dụ:
  ```js
  const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function encodeBase62(num) {
    let str = "";
    while (num > 0) {
      str = chars[num % 62] + str;
      num = Math.floor(num / 62);
    }
    return str || "0";
  }
  ```
  - Ưu điểm: không bao giờ collision (ID tăng dần đảm bảo unique), kích thước ngắn gọn. VD: ID 125 → `"cb"`.  
  - Nhược điểm: lộ thứ tự tạo (có thể thêm salt hoặc reverse để che) nhưng không nguy cấp.

  ### 5.2. Hash (alternative)  
  Có thể dùng hash (MD5/SHA) cắt một đoạn (6-8 ký tự). VD:
  ```js
  const crypto = require('crypto');
  function hashCode(url) {
    return crypto.createHash('sha256').update(url).digest('hex').slice(0, 6);
  }
  ```
  - Ưu điểm: không cần auto-increment, cho phép generate mọi lúc.  
  - Nhược điểm: khả năng **collision** (2 URL khác hash trùng). Phải kiểm tra trùng và xử lý (thêm random tail, retry). 

  ### 5.3. So sánh phương án  
  | Phương án | Ưu điểm                             | Nhược điểm                        |
  |-----------|-------------------------------------|-----------------------------------|
  | **Base62** (ID + encode) | - Đảm bảo unique (không trùng)【41†L211-L214】<br>- Code ngắn, gọn (tối ưu độ dài) | - Lộ trình tự (có thể obfuscate)<br>- Cần truy vấn DB để biết ID |
  | **Hash** (SHA/Murmur3)   | - Không cần ID (có thể offline)  | - Có khả năng collision cần kiểm tra<br>- Dài hơn (phải cắt bớt, càng nhiều ký tự càng ít collision) |

  Kết luận: Đề xuất dùng Base62 (ID tự tăng + encode). 

  ### 5.4. Kế hoạch kiểm tra Collision Rate  
  - **Mô phỏng**: Generate 100,000 mã (Base62 và Hash) để kiểm tra trùng.  
  - **Pseudo-code** (JavaScript):
    ```js
    const codes = new Set();
    let collisions = 0;
    for (let i = 1; i <= 100000; i++) {
      const code = encodeBase62(i); // hoặc hashCode(...)
      if (codes.has(code)) collisions++;
      codes.add(code);
    }
    console.log("Collisions:", collisions);
    ```
  - **Kết quả mong đợi**: Base62 sẽ có 0 collision (do ID tăng duy nhất). Hash có thể có vài collision tuỳ độ dài cắt.
  - **Metrics**: Số collision, tổng kết quả.  

  ## 6. Logging & Analytics Schema  
  - **urls**: có cột `click_count` (tổng số click).  
  - **clicks**: lưu từng lần click với thời gian (`clicked_at`), `ip_address`, `user_agent`, có thể thêm `location` (dựa IP → geo).  
  - Ví dụ entry của `clicks`: `{ id, url_id, clicked_at, ip, user_agent }`.  
  - Bảng `clicks` để phục vụ các báo cáo chi tiết.  
  - Có thể thêm bảng `ip_locations` nếu muốn map IP → vị trí để phân tích theo khu vực.  

  ## 7. Caching với Redis (Redirect)  
  Sử dụng **cache-aside pattern**【20†L219-L227】【20†L233-L240】: Trước khi truy vấn DB, kiểm tra Redis.  
  - Key: `short_code` (hoặc `url:short_code`). Value: `original_url`.  
  - TTL: e.g. 1 ngày (tùy tần suất cập nhật link). Mã rút gọn hiếm khi thay đổi, nhưng TTL giúp dọn các link ít dùng.  
  - Mã ví dụ (Node.js với `redis`):  
    ```js
    const cached = await redis.get(code);
    if (cached) {
      url = cached; // cache hit
    } else {
      const urlRec = await prisma.url.findUnique({ where: { short_code: code } });
      if (!urlRec) throw Error("Not found");
      url = urlRec.original_url;
      await redis.set(code, url, 'EX', 86400); // TTL = 86400s
    }
    ```
  - **Vận dụng Redis**: Giảm truy vấn DB cho redirect, tăng throughput【18†L74-L82】. Theo hướng dẫn, Redis phù hợp để cache dữ liệu “thường xuyên đọc” như URL gốc【18†L74-L82】.  
  - **Invalidation**: URL gốc hiếm khi thay đổi. Nếu có tính năng edit link, ta cần xoá cache khi cập nhật. Nếu không, TTL đủ.  
  - Nếu dùng Redis cluster, có thể gắn consistent hashing để chia shards (như tutorial FreeCodeCamp【18†L74-L82】). Nhưng đồ án đơn giản có thể 1 instance.  

  ## 8. Authentication (JWT Flow) *(tùy chọn)*  
  Không bắt buộc, nhưng nếu thêm sẽ tăng điểm: cho phép mỗi user có link riêng, phân quyền quản lý link. Sử dụng **JWT** cho xác thực phi trạng thái. 

  ### 8.1. Luồng cơ bản  
  1. **Đăng ký (/api/register)**:  
    - Nhận `{username, password}`. Kiểm tra tồn tại, băm mật khẩu (bcrypt), lưu vào bảng `users`.  
    - Trả 201 Created hoặc lỗi (400) nếu thiếu thông tin.  
  2. **Đăng nhập (/api/login)**:  
    - Nhận `{username, password}`. So sánh password (bcrypt). Nếu đúng, phát JWT (payload có userId, username).  
    - JWT thường gồm header, payload, signature. Token có thể hết hạn (exp).  
    - Trả 200 với `token`. Khuyến nghị không lưu JWT ở localStorage (dễ XSS); có thể dùng HttpOnly cookie.  
    - Lưu ý: JWT “cho phép server xác thực request mà không cần lưu session”【41†L211-L214】, phù hợp với hệ thống phân tán.  
  3. **Middleware bảo vệ route**:  
    - Mỗi request cần auth sẽ mang header `Authorization: Bearer <JWT>`.  
    - Middleware kiểm tra: giải mã JWT, kiểm tra ký (HS256/RS256), đảm bảo chưa hết hạn, gán `req.user` từ payload.  
  4. **Các API bảo vệ**:  
    - Ví dụ: `POST /api/shorten` có thể yêu cầu auth: chỉ user đăng nhập mới rút gọn.  
    - `GET /api/links` trả list link của user (WHERE urls.user_id = userId).  
    - `GET /api/stats/:code` nếu để riêng chỉ admin hoặc chính user.

  ### 8.2. Schema & Thao tác  
  - Bảng `users` trong Prisma như trên.  
  - Sử dụng thư viện `jsonwebtoken` để tạo/verify token, `bcrypt` để hash password.  
  - Ví dụ tạo JWT khi login:  
    ```js
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    ```
  - Middleware ví dụ (Express):  
    ```js
    function auth(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).send('Chưa đăng nhập');
      const token = authHeader.split(' ')[1];
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload; // ví dụ payload: {userId, iat, exp}
        next();
      } catch (err) {
        res.status(401).send('Token không hợp lệ');
      }
    }
    ```

  ## 9. Frontend React (Vite)  

  ### 9.1. Cấu trúc Component  
  Ví dụ cấu trúc thư mục (Vite):  
  ```
  /frontend
    /src
      /components
        ShortenForm.jsx     # Form nhập URL
        StatsChart.jsx      # Chart.js component
        LoginForm.jsx       # Login / Register (nếu auth)
        Navbar.jsx          # Điều hướng trang
      /pages
        HomePage.jsx        # Trang chủ (ShortenForm + hiển thị link)
        Dashboard.jsx       # Trang thống kê (StatsChart)
      App.jsx               # Cấu hình Routes
      main.jsx             # Mount React vào DOM
  ```
  - `ShortenForm.jsx`: form nhập URL dài, gọi API `/api/shorten`, hiện short link.  
  - `StatsChart.jsx`: hiển thị chart (với Chart.js) cho dữ liệu click.  
  - Sử dụng **Axios/Fetch** để gọi API.  
  - Sử dụng **React Router** để định tuyến (Home, Login, Dashboard).  

  ### 9.2. Ví dụ tạo project với Vite  
  Dùng Vite CLI:  
  ```bash
  npm create vite@latest my-url-shortener -- --template react
  cd my-url-shortener
  npm install
  npm run dev
  ```  
  Vite nhanh gọn, hỗ trợ HMR, sẵn cấu hình React【24†L236-L245】.

  ### 9.3. Tương tác API  
  Ví dụ sử dụng `fetch` trong React:  
  ```jsx
  // ShortenForm.jsx
  function ShortenForm() {
    const [url, setUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");

    async function handleSubmit(e) {
      e.preventDefault();
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (res.ok) setShortUrl(data.short_url);
      else alert("Error: " + data.error);
    }

    return (
      <form onSubmit={handleSubmit}>
        <input value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste URL..." />
        <button type="submit">Shorten</button>
        {shortUrl && <p>Short URL: <a href={shortUrl}>{shortUrl}</a></p>}
      </form>
    );
  }
  ```

  ## 10. Biểu đồ Analytics (Chart.js)  
  Dùng Chart.js hiển thị thống kê (ví dụ biểu đồ cột show lượt click theo ngày). Chart.js dễ tích hợp trong React, tương thích với Canvas HTML5【15†L56-L64】【12†L4-L10】.  

  Ví dụ code React với Chart.js:
  ```jsx
  // StatsChart.jsx
  import { Bar } from 'react-chartjs-2';
  function StatsChart({ clickData }) {
    const labels = clickData.map(item => item.date);
    const counts = clickData.map(item => item.count);
    const data = {
      labels,
      datasets: [
        {
          label: 'Clicks',
          data: counts,
          backgroundColor: '#36A2EB'
        }
      ]
    };
    return <Bar data={data} />;
  }
  ```
  Ví dụ dữ liệu (`clickData`): `[{date:'2026-04-01',count:10}, ...]`.  
  Chart.js đơn giản nhưng mạnh mẽ cho các biểu đồ cơ bản【15†L64-L73】. 

  Nếu cần hình ảnh ví dụ, Chart.js có hàng loạt demo code (như Bar Chart example【15†L62-L70】). Ta có thể cấu hình Chart theo nhu cầu (bar, line, pie...).  

  ## 11. Docker & Docker-Compose  
  Tạo **Dockerfile multi-stage** để build & đóng gói backend (Node) và frontend (React) riêng hoặc chung. Ví dụ Dockerfile chung:
  ```dockerfile
  # Frontend stage
  FROM node:20-alpine AS frontend
  WORKDIR /app/frontend
  COPY frontend/package*.json ./
  RUN npm install
  COPY frontend/ .
  RUN npm run build

  # Backend stage
  FROM node:20-alpine AS backend
  WORKDIR /app/backend
  COPY backend/package*.json ./
  RUN npm install
  COPY backend/ .
  # Copy build của frontend vào server (nếu phục vụ cùng)
  COPY --from=frontend /app/frontend/dist ./public
  EXPOSE 3000
  CMD ["node", "app.js"]
  ```
  Chú ý: Dùng multi-stage giúp tối ưu kích thước image【26†L427-L436】. Sử dụng **node:XX-alpine** để nhẹ.  
  Docker-Compose (nếu có Redis, DB):  
  ```yaml
  version: '3'
  services:
    app:
      build: .
      ports:
        - "3000:3000"
      environment:
        - DATABASE_URL=mysql://user:pass@db:3306/mydb
        - REDIS_URL=redis://redis:6379
      depends_on:
        - db
        - redis
    db:
      image: mysql:8
      environment:
        MYSQL_ROOT_PASSWORD: example
        MYSQL_DATABASE: mydb
      volumes:
        - db-data:/var/lib/mysql
      ports:
        - "3306:3306"
    redis:
      image: redis:alpine
      ports:
        - "6379:6379"
  volumes:
    db-data:
  ```
  Docker giúp deploy dễ dàng và nhất quán môi trường. Theo Docker docs, nên dùng images chính thức và multi-stage build【26†L427-L436】 để bảo mật và nhẹ.  

  ## 12. CI/Git Workflow & Branch Strategy  
  Áp dụng Git flow đơn giản: `main` (hoặc `master`) chứa code stable; `develop` chứa tích hợp mới; các branch feature riêng cho từng module. Ví dụ:  
  - `feature/shorten-hmhieu`, `feature/redirect-nmhieu`, `feature/db-nhuhoang`, `feature/frontend-vanhoang`.  
  Mỗi thành viên chỉ làm trên branch riêng để tránh conflict. Sau khi hoàn thành, merge vào `develop`, test xong rồi merge vào `main`.  
  Commit message chuẩn: `feat:`, `fix:`, `doc:`, v.v. (theo Conventional Commits). Ví dụ: `feat: add shorten API endpoint`.  
  Mỗi ngày push code lên branch của mình, review với team nhỏ, rồi merge.

  ## 13. Deployment (Render / Railway)  
  - **Render**: Tạo Web Service mới, link GitHub repo. Thiết lập Build Command (vd: `npm install && npm run build`), Start Command (`node app.js`). Render tự động deploy mỗi lần có push【28†L216-L223】.  
  - **Railway**: Cũng tự động detect Node.js (nhìn `package.json`), run `npm install`, start process, và scale theo yêu cầu【30†L79-L88】. Railway quản lý biến môi trường và khởi động lại khi lỗi.  
  Các bước chung: 
    1. Push code lên repo GitHub.  
    2. Trên Render/Railway, tạo project mới, chọn Node/Express template, kết nối repo.  
    3. Cấu hình env variables (DB URL, JWT_SECRET, PORT…).  
    4. Deploy. Hệ thống hosting thường cung cấp HTTPS sẵn.  
  Cited: Render Docs nhấn mạnh “mỗi lần push vào branch liên kết sẽ tự động build và deploy”【28†L216-L223】; Railway “tự động detect Node, chạy npm install, handle process management”【30†L79-L88】.  

  ## 14. Kế hoạch Kiểm thử  

  - **Unit Test** (Backend): Sử dụng Jest hoặc Mocha để test từng hàm logic (ví dụ base62, validation).  
  - **Integration Test**: Dùng Postman collection để test các API. Ví dụ test POST/shorten, GET/redirect trả đúng (Status, header).  
  - **Load Test**: Sử dụng **k6** hoặc Apache JMeter. Kịch bản: simula:
    - **Redirect**: 1000 concurrent requests/s GET `/abc123`.  
    - **Shorten**: 200 concurrent POST `/api/shorten`.  
    - Đo throughput (req/s), latency trung bình và phân vị (p95, p99). Theo k6 example, có thể dùng kịch bản JS giống như sau【32†L61-L69】:  
      ```js
      import http from 'k6/http';
      import { check } from 'k6';
      export let options = { vus: 100, duration: '30s' };
      export default function() {
        let res = http.get('https://your-app.onrender.com/abc123');
        check(res, { 'status 302': (r) => r.status === 302 });
      }
      ```
    - Sử dụng Load Impact (k6) để đo metrics (tại terminal ra console giống ví dụ【32†L108-L116】).  
  - **Security Test**: Test rate limit (nhiều request trong giây), test input validation (URL không hợp lệ, XSS injection), test tránh open redirect (nếu có param URL).
  - **Manual QA**: Chạy thử UI toàn bộ, ghi video demo: tạo link, click redirect, xem stats.

  ## 15. Bảo mật (Security)  

  - **Input Validation**: Luôn validate URL đầu vào (kiểm tra định dạng hợp lệ).  
  - **Prevent Open Redirect**: Không redirect tới URL không kiểm soát. Express docs khuyên “validate domain trước khi dùng `res.redirect`”【34†L141-L150】. Ví dụ, nếu có dùng query param redirect, phải whitelist domain. Trong trường hợp này, redirect đến `original_url` do người dùng cung cấp; có thể check ràng buộc (chỉ redirect khi URL hợp lệ).  
  - **CSRF/CORS**: Nếu deploy, cấu hình CORS chỉ cho phép domain frontend (hoặc dùng same-origin).  
  - **Helmet**: Dùng `helmet()` middleware để thiết lập các header bảo mật (CSP, XSS protection, HSTS, v.v.)【34†L169-L177】.  
  - **Rate Limiting**: Giới hạn số lượt gọi API (ví dụ /shorten) để chống spam. Có thể dùng `express-rate-limit` hoặc Redis rate-limit.  
  - **HTTPS/TLS**: Bảo đảm chạy qua HTTPS (hầu hết dịch vụ hosting cung cấp SSL miễn phí như Let’s Encrypt).  
  - **Dependency Check**: Luôn cập nhật phiên bản mới, audit thư viện để tránh lỗ hổng.

  ## 16. Hiệu năng và Giám sát  

  - **Metrics quan trọng**: Theo AppSignal, cần theo dõi *response time (latency)*, *throughput (requests/s)*, *error rate*, *CPU & memory usage*【36†L168-L177】.  
    - *Latency*: thời gian xử lý trung bình và percentiles (p95, p99).  
    - *Throughput*: req/s đang xử lý.  
    - *Error rate*: % request lỗi (5xx).  
    - *CPU/Memory*: nếu CPU full hoặc memory leak thì hệ thống có thể chậm/hỏng.  
  - **Benchmark**: Sử dụng các công cụ (k6, JMeter) để ghi nhận trước và sau tối ưu. Ghi lại thời gian trung bình cho request shorten & redirect với tải giả lập.  
  - **Monitoring**: Có thể tích hợp APM (AppSignal, New Relic) hoặc Prometheus/Grafana: đếm request/s, độ trễ, logs lỗi, và cảnh báo (alert) khi vượt ngưỡng.  
  - **Logging**: Ghi log server (morgan hoặc winston) để theo dõi errors, request logs.  
  - **Scale**: Nếu traffic tăng, có thể thêm instances backend (horizontal scaling) và cho Redis/DB replica.  

   ## 19. Authentication (Login/Register) 🔐 [NEW FEATURE]

   ### 19.1. Mục đích & Lợi ích
   - **Mục đích**: Cho phép người dùng tạo tài khoản cá nhân, quản lý nhiều URLs, lưu lịch sử, cung cấp cơ sở cho tính năng premium.
   - **Lợi ích**:
     - Mỗi user có dashboard riêng xem tất cả URLs của mình.
     - Phân quyền: chỉ user đó mới được xem/sửa/xoá URLs của mình.
     - Nền tảng cho tính năng nâng cao (custom domains, URL expiration, v.v.).

   ### 19.2. Luồng Authentication (JWT)
   ```mermaid
   sequenceDiagram
       participant U as User
       participant F as Frontend
       participant B as Backend
       participant DB as MySQL (Prisma)

       U->>F: 1. Nhập email & password, nhấn "Register"
       F->>B: POST /api/auth/register { email, password }
       B->>B: Mã hóa password (bcrypt)
       B->>DB: INSERT INTO users (email, hashed_password)
       B-->>F: HTTP 201 { message: "Registered successfully" }

       U->>F: 2. Nhập email & password, nhấn "Login"
       F->>B: POST /api/auth/login { email, password }
       B->>DB: SELECT * FROM users WHERE email = ?
       B->>B: So sánh password (bcrypt.compare)
       alt Password đúng
           B->>B: Tạo JWT token (payload: userId, email)
           B-->>F: HTTP 200 { token: "JWT...", user: {...} }
       else Password sai
           B-->>F: HTTP 401 { error: "Invalid credentials" }
       end

       F->>F: Lưu token vào localStorage (hoặc HttpOnly cookie)
       F->>B: Gửi kèm header: Authorization: Bearer JWT...

       U->>F: 3. User muốn tạo link mới
       F->>B: POST /api/urls/shorten { url: "..." } + Authorization header
       B->>B: Middleware verify token → lấy userId từ JWT
       B->>DB: INSERT INTO urls (original_url, user_id, ...) 
       B-->>F: HTTP 200 { short_url: "...", id: "..." }

       U->>F: 4. User đăng xuất
       F->>F: Xoá token từ localStorage
       F->>F: Redirect về trang login
   ```

   ### 19.3. Backend Implementation

   **Prisma Schema Update** (thêm password vào User):
   ```prisma
   model User {
     id        Int      @id @default(autoincrement())
     email     String   @unique @db.VarChar(191)
     password  String   @db.VarChar(255)    // Thêm dòng này
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     urls      Url[]
     
     @@map("users")
   }

   // Cập nhật Url model
   model Url {
     id            Int       @id @default(autoincrement())
     originalUrl   String    @db.Text
     shortCode     String?   @unique
     clickCount    Int       @default(0)
     userId        Int?      // Cho phép anonymous URLs
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt
     user          User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
     clicks        Click[]
   }
   ```

   **API Endpoints**:
   - `POST /api/auth/register` → Tạo user mới
   - `POST /api/auth/login` → Phát JWT token
   - `POST /api/auth/logout` → Logout (client-side clear token)
   - `GET /api/auth/me` → Lấy thông tin user (protected)
   - `POST /api/auth/refresh` → Refresh JWT token (nếu cần)

   **Middleware & Utils**:
   - `utils/passwordHash.js`: Hàm hash password (bcryptjs)
   - `utils/jwtToken.js`: Hàm generate/verify JWT
   - `middlewares/authMiddleware.js`: Middleware verifyToken

   **Controller** (`controllers/authController.js`):
   ```javascript
   exports.register = async (req, res) => {
     // 1. Validate input (email format, password strength)
     // 2. Check if email already exists
     // 3. Hash password
     // 4. Create user in DB
     // 5. Return 201 Created
   };

   exports.login = async (req, res) => {
     // 1. Validate input
     // 2. Find user by email
     // 3. Compare password (bcrypt)
     // 4. Generate JWT token
     // 5. Return 200 with token
   };

   exports.getCurrentUser = async (req, res) => {
     // Protected route - middleware verifies token
     // Return user info (excluding password)
   };
   ```

   **Environment Variables**:
   ```env
   JWT_SECRET=your-super-secret-key-min-32-chars
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=10
   ```

   ### 19.4. Frontend Implementation

   **Auth Context** (`context/AuthContext.jsx`):
   - Quản lý global auth state (current user, token, loading, error).
   - Provide login, logout, register functions.

   **Components**:
   - `pages/RegisterPage.jsx`: Form đăng ký (email, password, confirm password).
   - `pages/LoginPage.jsx`: Form đăng nhập (email, password).
   - `components/ProtectedRoute.jsx`: Wrapper cho routes cần auth.
   - `pages/Dashboard.jsx`: Danh sách URLs của user, option delete/copy.

   **Custom Hook** (`hooks/useAuth.js`):
   ```javascript
   const { user, token, loading, login, logout, register } = useAuth();
   ```

   **Services** (`services/authService.js`):
   - `register(email, password)` → POST /api/auth/register
   - `login(email, password)` → POST /api/auth/login
   - `logout()` → Clear token
   - `getCurrentUser()` → GET /api/auth/me

   **Token Storage**:
   - Lưu JWT vào `localStorage` với key `authToken`.
   - Tự động gửi token trong header `Authorization: Bearer ...` với mỗi API request.

   ### 19.5. Testing Checklist
   - [ ] Register: Email mới → create user thành công
   - [ ] Register: Email duplicate → error 400
   - [ ] Register: Password yếu → error validation
   - [ ] Login: Credentials đúng → nhận token
   - [ ] Login: Credentials sai → error 401
   - [ ] Login: Email không tồn tại → error 401
   - [ ] Protected route: Không có token → redirect login
   - [ ] Protected route: Token valid → truy cập được
   - [ ] Protected route: Token expired → error 401
   - [ ] POST /api/urls/shorten (authenticated) → create URL với user_id
   - [ ] GET /api/user/urls (authenticated) → lấy danh sách URLs của user

   ### 19.6. Dependencies
   ```bash
   npm install bcryptjs jsonwebtoken express-validator
   ```

   ---

   ## 20. QR Code Generation 📱 [NEW FEATURE]

   ### 20.1. Mục đích & Lợi ích
   - **Mục đích**: Mỗi shortened URL có QR code tương ứng, cho phép quét QR thay vì copy-paste.
   - **Lợi ích**:
     - Dễ chia sẻ link qua điện thoại (quét QR từ banner, poster, v.v.).
     - Tăng engagement: người dùng quét thay vì gõ URL dài.
     - Analytics bổ sung: có thể track "QR scans" riêng (nếu thêm parameter).

   ### 20.2. Luồng QR Code Generation & Display
   ```mermaid
   sequenceDiagram
       participant U as User
       participant F as Frontend
       participant B as Backend
       participant DB as MySQL (Prisma)
       participant Cache as Redis

       U->>F: Nhập URL dài, nhấn "Shorten"
       F->>B: POST /api/urls/shorten { url: "..." }
       B->>DB: INSERT url, generate short_code
       B->>B: Generate QR code từ short URL
       B->>DB: INSERT INTO qr_codes { url_id, qr_data, ... }
       alt Cache enabled
           B->>Cache: SET qr:{short_code} → QR data (TTL)
       end
       B-->>F: HTTP 200 { short_url: "...", qr_code: "data:image/png;..." }

       F->>F: Hiển thị short URL + QR code image

       U->>F: Click "Download QR"
       F->>B: GET /api/urls/{short_code}/qr-code?format=png
       B->>DB: SELECT qr_code FROM qr_codes WHERE url_id = ?
       B-->>F: Binary image data (PNG/SVG)
       F->>F: Download file
   ```

   ### 20.3. Backend Implementation

   **Prisma Schema Update** (thêm QRCode model):
   ```prisma
   model QRCode {
     id        Int      @id @default(autoincrement())
     urlId     Int      @unique   // 1:1 relationship
     qrData    String   @db.LongText  // Base64 encoded image
     format    String   @default("png")  // "png" hoặc "svg"
     size      Int      @default(300)  // QR code size (px)
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
     url       Url      @relation(fields: [urlId], references: [id], onDelete: Cascade)
     
     @@map("qr_codes")
   }
   ```

   **API Endpoints**:
   - `POST /api/urls/{short_code}/qr-code` → Generate (hoặc regenerate) QR
   - `GET /api/urls/{short_code}/qr-code` → Lấy QR code (trả image hoặc base64)
   - `GET /api/urls/{short_code}/qr-code?format=png` → Download QR as PNG
   - `GET /api/urls/{short_code}/qr-code?format=svg` → Download QR as SVG

   **Utility** (`utils/qrCode.js`):
   ```javascript
   const QRCode = require('qrcode');

   async function generateQR(url, options = {}) {
     const defaultOptions = {
       errorCorrectionLevel: 'H',
       type: options.format || 'image/png',
       width: options.size || 300,
       margin: 1,
       color: {
         dark: '#000',
         light: '#FFF'
       }
     };
     
     if (options.format === 'svg') {
       return QRCode.toString(url, { ...defaultOptions, type: 'svg' });
     } else {
       return QRCode.toDataURL(url, defaultOptions);  // Base64
     }
   }

   async function saveQRToFile(url, filepath) {
     return QRCode.toFile(filepath, url, { width: 300 });
   }
   ```

   **Service** (`services/qrCodeService.js`):
   ```javascript
   exports.generateQRForURL = async (urlId, originalShortURL, format = 'png') => {
     // 1. Generate QR code từ short URL
     // 2. Save vào DB (qr_codes table)
     // 3. Cache vào Redis (optional)
     // 4. Return QR data
   };

   exports.getQRCode = async (urlId, format = 'png') => {
     // 1. Check Redis cache
     // 2. If not found, get từ DB
     // 3. Return QR data
   };
   ```

   **Controller** (`controllers/qrCodeController.js`):
   ```javascript
   exports.generateQRCode = async (req, res) => {
     const { short_code } = req.params;
     const { format = 'png', size = 300 } = req.query;
     
     // 1. Find URL by short_code
     // 2. Generate QR code
     // 3. Save to DB
     // 4. Return 200 with QR data
   };

   exports.getQRCode = async (req, res) => {
     const { short_code } = req.params;
     const { format = 'png' } = req.query;
     
     // 1. Get QR from DB/cache
     // 2. Set content-type accordingly (image/png, image/svg+xml)
     // 3. Send image data
   };

   exports.downloadQRCode = async (req, res) => {
     // Similar to getQRCode, but set Content-Disposition: attachment
   };
   ```

   **Environment Variables**:
   ```env
   QR_CODE_SIZE=300
   QR_CODE_STORAGE=./public/qr-codes    # Nếu save file locally
   QR_CACHE_TTL=86400                   # 1 ngày
   ```

   ### 20.4. Frontend Implementation

   **Components**:
   - `components/QRCodeDisplay.jsx`: Hiển thị QR code image.
   - `components/QRCodeModal.jsx`: Modal với option download QR.
   - Update `components/ShortenForm.jsx`: Hiển thị QR sau khi tạo link.

   **Example Component** (`components/QRCodeDisplay.jsx`):
   ```jsx
   export default function QRCodeDisplay({ shortCode, shortURL }) {
     const [qrData, setQrData] = useState(null);
     const [loading, setLoading] = useState(false);

     useEffect(() => {
       fetchQRCode();
     }, [shortCode]);

     const fetchQRCode = async () => {
       setLoading(true);
       const data = await qrCodeService.getQRCode(shortCode, 'png');
       setQrData(data);
       setLoading(false);
     };

     const downloadQR = async (format) => {
       const blob = await qrCodeService.downloadQRCode(shortCode, format);
       // Trigger download
     };

     return (
       <div>
         {loading ? <p>Generating...</p> : <img src={qrData} alt="QR Code" />}
         <button onClick={() => downloadQR('png')}>Download PNG</button>
         <button onClick={() => downloadQR('svg')}>Download SVG</button>
       </div>
     );
   }
   ```

   **Services** (`services/qrCodeService.js`):
   - `generateQRCode(shortCode, url)` → POST /api/urls/:short_code/qr-code
   - `getQRCode(shortCode, format)` → GET /api/urls/:short_code/qr-code
   - `downloadQRCode(shortCode, format)` → GET with attachment header

   ### 20.5. Caching Strategy (Redis)
   - Key: `qr:{short_code}:{format}` → QR data (base64 hoặc SVG string)
   - TTL: 1 ngày (hoặc configurable)
   - Invalidation: Khi URL bị xoá hoặc update.

   ### 20.6. Testing Checklist
   - [ ] Generate QR: POST /api/urls/:short_code/qr-code → success
   - [ ] Get QR (PNG): GET /api/urls/:short_code/qr-code?format=png
   - [ ] Get QR (SVG): GET /api/urls/:short_code/qr-code?format=svg
   - [ ] Download QR: GET with Content-Disposition: attachment
   - [ ] QR caching: Subsequent request return from cache (verify TTL)
   - [ ] QR invalidation: Delete URL → QR cache cleared
   - [ ] Frontend display: QR image shows correctly
   - [ ] Download functionality: PNG/SVG files download properly
   - [ ] Mobile compatibility: QR code readable on mobile phones

   ### 20.7. Dependencies
   ```bash
   npm install qrcode       # QR code generation
   ```

   ### 20.8. Future Enhancements (Optional)
   - Custom QR code: Logo trong QR, colors, v.v.
   - QR tracking: Track "QR scans" vs "direct clicks" (thêm utm_source parameter).
   - Bulk QR download: Generate ZIP file chứa nhiều QR codes.
   - QR customization UI: Cho phép user chọn size, format, colors.

   ---

   ## 21. Phân công Nhiệm vụ Nhóm  

   Chia thành 6 module chính, mỗi thành viên "ownership" riêng để tránh conflict:

   - **HMHieu** (Lead, Backend Core + Authentication):  
     - API tạo link: `POST /api/shorten` (controller, dịch vụ encode Base62).  
     - Base62 encoding & unique ID logic.  
     - **[NEW]** Authentication module:
       - `POST /api/auth/register` - đăng ký user mới.
       - `POST /api/auth/login` - đăng nhập, phát JWT token.
       - Utility: `utils/passwordHash.js` (bcryptjs wrapper).
       - Utility: `utils/jwtToken.js` (JWT generation & verification).
       - Middleware: `middlewares/authMiddleware.js` (verifyToken).
     - Quản lý branch: `feature/auth-hmhieu`.  
     - Files: `/backend/controllers/urlController.js`, `/backend/services/shortenerService.js`, `/backend/controllers/authController.js`, `/backend/services/authService.js`, `/backend/utils/passwordHash.js`, `/backend/utils/jwtToken.js`, `/backend/middlewares/authMiddleware.js`.  

   - **NMHieu** (Redirect & Analytics & QR Code):  
     - Route `GET /:short_code` redirect, xử lý increment click.  
     - Ghi log click (insert vào `clicks`).  
     - API analytics: `GET /api/stats/:code`.  
     - **[NEW]** QR Code generation module:
       - `POST /api/urls/:short_code/qr-code` - generate QR code.
       - `GET /api/urls/:short_code/qr-code` - retrieve QR code.
       - Utility: `utils/qrCode.js` (QR generation logic sử dụng package `qrcode`).
       - Service: `services/qrCodeService.js` (QR storage & management).
     - Branch: `feature/redirect-analytics-qr-nmhieu`.  
     - Files: `/backend/controllers/redirectController.js`, `/backend/services/analyticsService.js`, `/backend/controllers/qrCodeController.js`, `/backend/services/qrCodeService.js`, `/backend/utils/qrCode.js`.  

   - **Như Hoàng** (DB, Performance & Migrations):  
     - Thiết kế schema & Prisma models.  
     - Viết migrations cho:
       - Bảng `users` (email, password hash).
       - Bảng `qr_codes` (liên kết với URLs).
     - Cập nhật seed DB (nếu cần).  
     - Tối ưu query (index, xem EXPLAIN).  
     - Test collision script.  
     - Benchmark sơ bộ.  
     - Branch: `feature/db-auth-qr-nhuhoang`.  
     - Files: `/prisma/schema.prisma`, `/prisma/migrations/*`, SQL scripts, model definitions.  

   - **Văn Hoàng** (Frontend UI, Auth UI & QR Display):  
     - React components (ShortenForm, StatsChart, Navbar).  
     - Routing (React Router).  
     - Giao diện đẹp, responsive.  
     - **[NEW]** Authentication UI:
       - `pages/RegisterPage.jsx` - form đăng ký.
       - `pages/LoginPage.jsx` - form đăng nhập.
       - `pages/Dashboard.jsx` - danh sách URLs của user.
       - `context/AuthContext.jsx` - quản lý auth state toàn app.
       - `hooks/useAuth.js` - custom hook sử dụng auth context.
       - `services/authService.js` - API calls cho register/login.
     - **[NEW]** QR Code display:
       - `components/QRCodeDisplay.jsx` - hiển thị QR code.
       - `components/QRCodeModal.jsx` - modal QR download.
       - `services/qrCodeService.js` - API calls cho QR endpoints.
     - Protected routes: Chỉ login user mới được tạo link.
     - Tạo slides, ghi video demo (ghi màn hình tạo link, login/register, xem QR code, redirect, xem biểu đồ).  
     - Branch: `feature/frontend-auth-qr-vanhoang`.  
     - Files: `/frontend/src/components/*`, `/frontend/src/pages/*`, `/frontend/src/context/*`, `/frontend/src/hooks/*`, `/frontend/src/services/authService.js`, `/frontend/src/services/qrCodeService.js`, `/docs/*` (slides, báo cáo LaTeX templates).  

   **Quy trình làm việc chung**:  
   - Mỗi người commit/ngày (sau khi dev xong phần nhỏ).  
   - Họp daily stand-up ~15 phút để sync.  
   - Merge từng module vào `develop`, test, rồi vào `main`.  
   - Commit messages theo chuẩn (ví dụ: `feat: ...`, `fix: ...`).  

   ### Branch/Commit Conventions  
   - Branch: `feature/<chucnang>-<ten>` (ví dụ `feature/auth-hmhieu`, `feature/qr-nmhieu`).  
   - Commit mẫu:  
     - `feat: add authentication (register/login) API`  
     - `feat: add QR code generation endpoint`
     - `fix: correct redirect logic`  
     - `docs: update API spec`  

   ### Các điểm dễ conflict (tránh):  
   - **DB schema**: chỉ Như Hoàng sửa (auth user + QR models).  
   - **Routes chính**: HMHieu đảm nhiệm auth routes, NMHieu đảm nhiệm redirect/analytics/QR routes.  
   - **config files** (app.js, .env): nên tách biến, tránh xung đột.
   - **Frontend context/hooks**: Văn Hoàng đảm nhiệm auth context riêng.

   ## 22. Timeline & Deliverables  

   - **Ngày 1–2**: 
     - HMHieu: Cài đặt project, thiết kế API `POST /shorten`, Base62 (core - DONE), bắt đầu authentication module (`POST /register`, `POST /login`, JWT setup).
     - NMHieu: Tạo skeleton route redirect (core - DONE), bắt đầu QR code generation endpoint.  
     - Như Hoàng: Tạo database (Prisma & MySQL) (core - DONE), cập nhật schema với User password field, bắt đầu QR code model.  
     - Văn Hoàng: Scaffold React (Vite) (core - DONE), bắt đầu auth UI (RegisterForm, LoginForm), setup auth context.  

   - **Ngày 3**: 
     - HMHieu: Hoàn thiện authentication endpoints, password hashing (bcryptjs), JWT token generation.  
     - NMHieu: Hoàn thiện QR code endpoint, tích hợp qrcode library.  
     - Như Hoàng: Hoàn thành DB migrations (User + QRCode models), kiểm thử schema.  
     - Văn Hoàng: Hoàn thiện auth forms logic, auth context setup, login/register flow.  

   - **Ngày 4**: 
     - Kết nối Frontend-Backend (AJAX, fetch).  
     - HMHieu: Test auth endpoints, tạo middleware verifyToken.  
     - NMHieu: Test QR endpoints, hoàn thiện redirect + analytics.  
     - Như Hoàng: Hoàn thành indexing, kiểm thử truy vấn nhanh.  
     - Văn Hoàng: Giao diện hiển thị short link, test UI tương tác, bắt đầu dashboard component.  

   - **Ngày 5–6**: 
     - Tích hợp Redis cache (HMH/NMH có thể cùng làm).  
     - Hoàn thiện QR code display (Văn Hoàng thêm QRCodeDisplay component, download QR).
     - Hoàn thiện biểu đồ analytics (Văn Hoàng thêm Chart.js).  
     - Bảo vệ routes: chỉ authenticated users mới được tạo link, xem stats.  
     - Chạy thử end-to-end, sửa lỗi.  

   - **Ngày 7**: 
     - Kiểm thử toàn bộ: unit tests, Postman tests (auth + QR + shorten + redirect).  
     - Load test (k6/JMeter). Ghi chép số liệu (throughput, p95 latency).  
     - Đánh giá hiệu năng, tối ưu nếu cần.  

   - **Ngày 8**: 
     - Hoàn thiện báo cáo (Kiến trúc, API, authentication flow, QR code flow, so sánh thuật toán, kết quả benchmark).  
     - Chuẩn bị slide (từ báo cáo, có sơ đồ, screenshot, auth flow diagram, QR code demo).  
     - Quay video demo (đăng ký, đăng nhập, tạo link, xem QR code, click redirect, xem stats).  

   - (Tùy thêm 9–10): 
     - Dự phòng cho debug, thêm tính năng nâng cao (custom URL, URL expiration, analytics export, v.v.).  

   **Checklist Nộp**:  
   - `report.pdf` (báo cáo LaTeX đầy đủ - bao gồm auth flow, QR code architecture).  
   - `slides.pdf` (10–15 trang - bao gồm authentication, QR code).  
   - `demo.mp4` (hoặc link YouTube) quay thử 5 chức năng: register, login, shorten, QR code, redirect/stats.  
   - **GitHub repo**: code hoàn chỉnh, có README hướng dẫn cài đặt (tech stack, env vars, auth setup, QR code setup).  

   **Bảng Tổng hợp Deliverables**:

   | Deliverable      | Nội dung                                          | Format           |
   |------------------|---------------------------------------------------|------------------|
   | Báo cáo          | Kiến trúc, DB schema, API spec (auth + QR), authentication flow, QR code flow, benchmark, v.v.   | PDF (LaTeX)      |
   | Slide            | Tóm tắt dự án, diagram, flow, demo flow (auth, QR code, shorten, redirect, stats)            | PDF/PPT          |
   | Video demo       | Quay màn hình demo (đăng ký, đăng nhập, tạo link, QR code, redirect, stats)    | MP4 (min 5–10p)   |
   | Code (GitHub)    | Tất cả source (auth, QR code, shorten, redirect), README, commit rõ ràng             | GitHub repo      |

   **Lưu ý các nguồn tham khảo chính**: React docs, Node.js docs, Express docs, Prisma docs, Redis docs, Chart.js docs, Docker docs, bcryptjs docs, jsonwebtoken docs, qrcode docs.

   ## 23. Feature Status & Progress Summary

   Bảng tóm tắt trạng thái của tất cả các tính năng trong dự án:

   | Module | Tính Năng | Backend | Frontend | Status | Priority | Người Phụ Trách |
   |--------|----------|---------|----------|--------|----------|-----------------|
    | **Core** | URL Shortening (POST /api/shorten) | ✅ Hoàn thành | ⚠️ UI only, chưa API | 90% | P0 | HMHieu |
    | **Core** | URL Redirect (GET /:short_code) | ✅ Hoàn thành | ✅ Hoàn thành | 95% | P0 | NMHieu |
    | **Core** | Click Analytics (GET /api/stats/:code) | ✅ Hoàn thành | ⚠️ Chưa hiển thị | 70% | P1 | NMHieu + VănHoàng |
    | **Core** | Redis Caching | ✅ Setup sẵn | ❌ Chưa dùng | 50% | P2 | HMHieu/NMHieu |
    | **NEW** | **Authentication (Register/Login)** | ✅ **Hoàn thành** | ❌ Chưa làm | **45%** | **P1** | **HMHieu** |
    | **NEW** | **QR Code Generation** | ❌ Chưa làm | ❌ Chưa làm | 0% | **P1** | **NMHieu** |
    | **Extra** | User Dashboard | ❌ Chưa làm | ❌ Chưa làm | 0% | P2 | VănHoàng |
    | **Extra** | Input Validation | ✅ **Làm trong auth** | ❌ Chưa làm | **40%** | P1 | HMHieu |
    | **Extra** | Error Handling Middleware | ⚠️ Cơ bản | ⚠️ Cơ bản | 40% | P1 | HMHieu |
    | **Extra** | Rate Limiting | ❌ Chưa làm | ❌ Chưa làm | 0% | P2 | HMHieu |
    | **Testing** | Unit Tests | ❌ Chưa làm | ❌ Chưa làm | 0% | P1 | NhuHoàng |
    | **Testing** | Postman/API Tests | ✅ **Auth endpoints** | ❌ Chưa làm | **30%** | P1 | HMHieu/NMHieu |
    | **Testing** | Load Test (k6) | ❌ Chưa làm | - | 0% | P2 | NhuHoàng |
    | **Deployment** | Docker Setup | ✅ Hoàn thành | ✅ Hoàn thành | 90% | P1 | Cả nhóm |
    | **Documentation** | README.md | ⚠️ Cơ bản | ⚠️ Cơ bản | 50% | P2 | Cả nhóm |
    | **Documentation** | API Specification | ✅ **+ Auth endpoints** | - | **90%** | P1 | HMHieu |
    | **Documentation** | Architecture Diagram | ✅ Hoàn thành | - | 90% | P1 | Cả nhóm |

   **Chú thích**:
   - ✅ **Hoàn thành**: Feature đã implement và test thành công
   - ⚠️ **Partial**: Feature đang tiến hành hoặc có phần cơ bản
   - ❌ **Chưa làm**: Feature chưa được bắt đầu
   - **P0**: Priority 0 - Critical (core functionality)
   - **P1**: Priority 1 - High (important features)
   - **P2**: Priority 2 - Medium (nice to have)

    ### Tiến độ Tổng Thể:
    - **Backend Core**: ~90% (Auth module hoàn thành ✅, còn QR code)
    - **Frontend Core**: ~60% (UI tạo xong, chưa kết nối API)
    - **New Features (Auth + QR)**: **45%** (Auth backend ✅ hoàn thành, QR chưa làm)
    - **Testing & Deployment**: ~50% (Docker sẵn, cần test kỹ)
    - **Tổng Overall**: **~55%** - Đã hoàn thành 55% work, còn 45% phía trước

    ### Công Việc Ưu Tiên (Tuần Tiếp Theo):
    1. **[P1 - HIGH]** ✅ **Authentication (Register/Login/JWT) - HMHieu DONE**
    2. **[P1 - HIGH]** Implement QR Code Generation (NMHieu)
    3. **[P1 - MEDIUM]** Connect Frontend to Backend APIs (shorten, redirect, stats, auth)
    4. **[P1 - MEDIUM]** Add Input Validation & Error Handling Middleware
    5. **[P2 - MEDIUM]** End-to-end Testing (Postman, manual QA)
    6. **[P2 - LOW]** Load Testing & Performance Optimization

   ## 24. Quick Reference & Daily Implementation

    ### Current Status Summary (02/05/2026)
    - **Overall**: 55% hoàn thành | **Backend**: 90% | **Frontend**: 60% | **New Features (Auth+QR)**: 45%
    - **Phần làm xong**: Shorten API ✅, Redirect ✅, Analytics ✅, Database ✅, Docker ✅, **Authentication Backend ✅ (HMHieu)**
    - **Phần cần làm**: QR Code, Frontend-Backend integration, Frontend Auth UI, Testing

   ### Week 1-2 Roadmap (7-10 ngày)
   ```
   Days 1-2: Auth Backend + DB Migration (HMHieu + NhuHoang)
   Days 2-3: QR Code Backend (NMHieu)
   Days 2-4: Frontend Auth UI (VanHoang)
   Day 4:    Testing & Integration (All)
   Days 5-6: Frontend-Backend Connection (All)
   Day 6:    Polish & QA (All)
   Day 7:    Documentation & Demo (All)
   Days 8-10: Final touches & deployment
   ```

   ### Quick Setup (Install These Today)
   ```bash
   # Backend
   cd backend && npm install bcryptjs jsonwebtoken express-validator cors qrcode

   # Database Migrations
   npx prisma migrate dev --name add_user_password
   npx prisma migrate dev --name add_qr_code_table

   # Then start servers
   npm run dev              # Backend
   cd ../frontend && npm run dev  # Frontend
   ```

   ### Environment Variables to Add (.env)
   ```env
   JWT_SECRET=your-secret-key-min-32-chars-change-this
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=10
   QR_CODE_SIZE=300
   QR_CACHE_TTL=86400
   ```

   ### Files to Create (Prioritized)
   **PRIORITY 1 - Auth (Days 1-2)**:
   ```
   backend/src/
   ├── utils/passwordHash.js          [Hashing logic]
   ├── utils/jwtToken.js              [JWT generation]
   ├── controllers/authController.js   [API handlers]
   ├── middlewares/authMiddleware.js   [Token verification]
   └── routes/authRoutes.js            [Mount endpoints]
   ```

   **PRIORITY 2 - QR Code (Days 2-3)**:
   ```
   backend/src/
   ├── utils/qrCode.js
   ├── controllers/qrCodeController.js
   ├── services/qrCodeService.js
   └── routes/qrRoutes.js
   ```

   **PRIORITY 3 - Frontend Auth (Days 2-4)**:
   ```
   frontend/src/
   ├── context/AuthContext.jsx         [Global auth state]
   ├── hooks/useAuth.js                [Custom hook]
   ├── pages/RegisterPage.jsx
   ├── pages/LoginPage.jsx
   ├── pages/Dashboard.jsx
   └── services/authService.js         [API calls]
   ```

   **PRIORITY 4 - Frontend QR (Days 5-6)**:
   ```
   frontend/src/
   ├── components/QRCodeDisplay.jsx
   ├── components/QRCodeModal.jsx
   └── services/qrCodeService.js
   ```

   **PRIORITY 5 - API Integration (Days 5-6)**:
   ```
   frontend/src/
   ├── services/api.js                 [Axios with token]
   └── (Modify existing components to use APIs)
   ```

   ### Team Task Breakdown
   | Person | Days | Task | Dependencies |
   |--------|------|------|--------------|
   | **HMHieu** | 1-3 | Auth backend (register, login, JWT) | bcryptjs, jsonwebtoken |
   | **NhuHoang** | 1-2 | DB migrations (User password, QRCode) | None (Prisma) |
   | **NMHieu** | 2-4 | QR backend (generate, get, cache) | qrcode, Redis |
   | **VanHoang** | 2-7 | Frontend auth UI + QR display + API integration | axios, React Router |

   ### Daily Testing Checklist (Day 4)
   ```
   [ ] POST /api/auth/register → 201 Created
   [ ] POST /api/auth/login → 200 with JWT token
   [ ] GET /api/auth/me (with token) → 200 user info
   [ ] POST /api/urls/:short_code/qr-code → 200
   [ ] GET /api/urls/:short_code/qr-code → 200 with image
   [ ] Frontend: Register → Success
   [ ] Frontend: Login → Redirect dashboard
   [ ] Frontend: Create URL → Display QR
   [ ] Frontend: Redirect works → 302 to original URL
   ```

   ### Common Pitfalls to Avoid
   - ❌ Forgetting to set JWT_SECRET in .env (will cause 401 errors)
   - ❌ Not running Prisma migrations before coding
   - ❌ Frontend token not sent in API headers (use Authorization: Bearer)
   - ❌ QR cache conflicts (implement proper invalidation)
   - ❌ Mixing camelCase & snake_case in database (use consistent naming)

   ### Success Criteria by Day
   ```
   Day 2: Auth endpoints working (test with Postman)
   Day 3: QR endpoints working (test with Postman)
   Day 4: Frontend auth UI working (manual test)
   Day 5: Frontend-Backend connected (end-to-end test)
   Day 7: All features working + documented
   Day 10: Ready for submission
   ```

    ## 24. Project Structure
  Dự án được tổ chức theo mô hình **monorepo**, tách biệt rõ ràng giữa **Frontend** và **Backend**, giúp dễ phát triển, bảo trì và mở rộng.

  ```bash
  url-shortener/
  │
  ├── backend/                 # Node.js + Express + Prisma
  │   ├── src/
  │   │   ├── controllers/     # Xử lý request/response
  │   │   ├── services/        # Business logic
  │   │   ├── routes/          # Định nghĩa API endpoints
  │   │   ├── middlewares/     # Auth, validate, error handler
  │   │   ├── utils/           # Helper functions
  │   │   ├── config/          # Cấu hình (DB, Redis, ENV)
  │   │   ├── app.js           # Khởi tạo Express app
  │   │   └── server.js        # Start server
  │   │
  │   ├── prisma/              # Prisma ORM schema & migrations
  │   │   ├── schema.prisma
  │   │   └── migrations/
  │   │
  │   ├── package.json
  │   └── .env
  │
  ├── frontend/                # React + Vite
  │   ├── src/
  │   │   ├── components/      # UI components (Form, Chart, Navbar)
  │   │   ├── pages/           # Các trang chính (Home, Dashboard)
  │   │   ├── services/        # Gọi API (fetch/axios)
  │   │   ├── hooks/           # Custom hooks
  │   │   ├── utils/           # Helper phía client
  │   │   ├── App.jsx          # Routing
  │   │   └── main.jsx         # Entry point
  │   │
  │   ├── index.html
  │   ├── package.json
  │   └── vite.config.js
  │
  ├── docker/                  # Docker & Docker Compose
  │   ├── Dockerfile
  │   └── docker-compose.yml
  │
  ├── docs/                    # Tài liệu (report, slides, API spec)
  │
  ├── tests/                   # Kiểm thử (unit, integration, load test)
  │
  ├── .gitignore
  ├── README.md
  └── package.json             # (optional - monorepo scripts)

