# 💰 Expense Tracker App

A modern expense tracking application with a **React Native** mobile app and **Node.js** backend.

---

## 🔗 Links

- [Screencast](https://drive.google.com/drive/folders/1kpsUVD5m2hSdwlMCwWcQvbMPQyne5-4k?usp=sharing)
- [Repository](https://github.com/khamdannahari/collabreate-finance)
- [API URL](https://collabreate-production.up.railway.app)

---

## 📱 Mobile App

### 🛠 Tech Stack

- ⚛ **React Native** with **Expo**
- 🟦 **TypeScript**
- 📍 **Expo Router** for navigation
- 🖼 **Lucide Icons**
- 📊 **React Native Chart Kit** for visualizations
- ✍ **Custom Fonts** (DM Sans)
- 🔒 **Secure Storage** for authentication
- 🎨 **Modern UI Components**

### 🚀 Features

- 🔑 **User Authentication** (Login/Register)
- 💵 **Transaction Management** (Add, Edit, Delete)
- 📊 **Income vs Expenses Visualization**
- 🔍 **Transaction Filtering & Search**
- 👤 **Profile Management**
- 📈 **Real-time Statistics**

### ⚙️ Setup & Running

1. Install dependencies:

   ```bash
   cd mobile
   npm install
   ```

2. Start the mobile app:

   ```bash
   npm run dev
   ```

---

## 🖥️ Backend

### 🛠 Tech Stack

- 🟩 **Node.js**
- 🚀 **Express.js**
- 🟦 **TypeScript**
- 📦 **Prisma ORM**
- 🛢 **PostgreSQL**
- 🔐 **JWT Authentication**
- 🌐 **REST API**

### 🚀 Features

- 🔑 **User Authentication & Authorization**
- 💳 **Transaction CRUD Operations**
- 📊 **Statistical Data Aggregation**
- 👤 **Profile Management**
- ✅ **Data Validation**
- 🚨 **Error Handling**

### 🔒 Security

- 🔑 **JWT-based Authentication**
- 🔐 **Password Hashing with bcrypt**
- 🔏 **Protected API Endpoints**
- 🛑 **Input Validation**
- 🚧 **Error Handling**
- 🔒 **Secure Token Storage**

### ⚙️ Setup & Running

1. Create a `.env` file in the backend folder:

   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   JWT_SECRET="your-secret-key"
   PORT=3000
   ```

2. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Start the backend:

   ```bash
   npm run dev
   ```

4. Deploy the backend:

   ```bash
   npm run railway:up
   ```

---

## 📦 Database Schema

```prisma
model User {
    id String @id @default(uuid())
    username String @unique
    password String
    name String?
    email String? @unique
    joinDate DateTime @default(now())
    profileImage String?
    transactions Transaction[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

model Transaction {
    id String @id @default(uuid())
    name String
    amount Float
    type TransactionType
    date DateTime
    userId String
    user User @relation(fields: [userId], references: [id])
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
}

enum TransactionType {
    income
    expense
}
```

---

# 📡 API Documentation

## 🔐 Authentication

### 📝 Register

**Endpoint:** `POST /register`

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword",
  "name": "John Doe",
  "email": "johndoe@example.com"
}
```

**Response:**

- ✅ **Success (201):**

```json
{
  "token": "jwt_token_here"
}
```

- ❌ **Error (400):**

```json
{
  "message": "Username or email already registered"
}
```

### 🔑 Login

**Endpoint:** `POST /login`

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**

- ✅ **Success (200):**

```json
{
  "token": "jwt_token_here"
}
```

- ❌ **Error (401):**

```json
{
  "message": "Invalid username or password"
}
```

## 👤 User Profile

### 📄 Get Profile

**Endpoint:** `GET /`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token_here"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "johndoe@example.com",
  "joinDate": "2024-01-01T00:00:00Z",
  "profileImage": "https://example.com/profile.jpg",
  "stats": {
    "totalTransactions": 10,
    "totalIncome": 5000,
    "totalExpenses": 3000,
    "savingsRate": "40%"
  }
}
```

### 🛠 Update Profile

**Endpoint:** `PUT /`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token_here"
}
```

**Request Body:**

```json
{
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "profileImage": "https://example.com/newprofile.jpg"
}
```

**Response:**

```json
{
  "id": 1,
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "joinDate": "2024-01-01T00:00:00Z",
  "profileImage": "https://example.com/newprofile.jpg"
}
```

---

## 📊 Chart Data

### 📉 Get Chart Data

**Endpoint:** `GET /chart-data`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token_here"
}
```

**Response:**

```json
{
  "all": {
    "labels": ["Jan", "Feb", "Mar"],
    "income": [5000, 3000, 4000],
    "expenses": [2000, 1500, 1000]
  }
}
```

---

## 📝 License

📜 **MIT License**
