# Authentication & Security Backend

Bu loyiha **Access Token** va **Refresh Token** orqali autentifikatsiyani, shuningdek **role-based (user/admin)** huquqlarni cookie'da saqlagan holda ishlashini namoyish etadi.

## Ishga tushirish

1. Bog'liqliklarni o'rnatish qilingan (agar qilinmagan bo'lsa): `npm install`
2. Serverni ishga tushiring:
   ```bash
   npm start
   ```
3. Server quyidagi portda ishlaydi: `http://localhost:5000`

## API URL Manzillari

### 1. Tizimga kirish (Login)
- **URL**: `POST http://localhost:5000/api/login`
- **Body** (JSON):
  ```json
  {
    "username": "user1",
    "password": "password"
  }
  ```
  *(Admin uchun `username`: `"admin1"`, `password`: `"password"`)*
- **Natija**: `accessToken` va `refreshToken` cookie-larga yoziladi.

### 2. Tokenni yangilash (Refresh Token)
- **URL**: `POST http://localhost:5000/api/refresh`
- **Tavsif**: Cookie-dagi `refreshToken` ni tekshirib, yangi `accessToken` beradi va cookie-ga joylaydi. Front-end buni so'rov jo'natib avtomatik olishi mumkin.

### 3. Tizimdan chiqish (Logout)
- **URL**: `POST http://localhost:5000/api/logout`
- **Tavsif**: Cookie-lardagi barcha tokenlarni o'chiradi.

### 4. Profilni ko'rish (Faqat tizimga kirganlar uchun - Protected)
- **URL**: `GET http://localhost:5000/api/profile`
- **Tavsif**: Oddiy `user` ham, `admin` ham kira oladi (cookie orqali tekshiriladi).

### 5. Admin Panel (Faqat Adminlar uchun - Role Based)
- **URL**: `GET http://localhost:5000/api/admin`
- **Tavsif**: Faqat `role: "admin"` bo'lgan foydalanuvchilar kira oladi.
