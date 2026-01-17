# FeedForward - Food Waste Management Platform

A React-based frontend application for connecting restaurants with surplus food to NGOs and shelters in India.

## 🚀 Features

- **Restaurant Features:**
  - Add and manage food listings
  - View pending requests from NGOs
  - Approve/reject food requests
  - Dashboard with statistics
  - Donation history tracking

- **NGO Features:**
  - Search and browse available food
  - Request food from restaurants
  - Manage active requests
  - Track completed donations
  - Dashboard with impact metrics

- **Public Features:**
  - Landing page with impact statistics
  - Public leaderboards
  - How it works section

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Backend API** running on `http://localhost:8080/api`
- **MySQL Database** (configured in backend)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feedforward-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:8080/api
   VITE_USE_MOCK_AUTH=false
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   npm start
   ```

   The app will be available at `http://localhost:3000` (or the port shown in terminal)

## 🏗️ Project Structure

```
feedforward-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common UI components
│   │   ├── auth/          # Authentication components
│   │   ├── restaurant/    # Restaurant-specific components
│   │   └── ngo/           # NGO-specific components
│   ├── config/            # Configuration files
│   │   └── apiConfig.js   # API configuration
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/             # Page components
│   │   ├── LandingPage.jsx
│   │   ├── AuthPage.jsx
│   │   ├── restaurant/    # Restaurant pages
│   │   └── ngo/           # NGO pages
│   ├── services/          # API service layer
│   │   ├── axiosConfig.js
│   │   ├── authService.js
│   │   ├── foodListingService.js
│   │   ├── requestService.js
│   │   └── dashboardService.js
│   ├── utils/             # Utility functions
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── .env                   # Environment variables
└── package.json          # Dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 API Endpoints

The frontend connects to the Spring Boot backend at `http://localhost:8080/api`.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile

### Restaurant Endpoints
- `GET /restaurant/dashboard` - Dashboard statistics
- `POST /restaurant/listings` - Add food listing
- `GET /restaurant/listings` - Get all listings
- `GET /restaurant/listings/active` - Get active listings
- `DELETE /restaurant/listings/{id}` - Delete listing
- `GET /requests/restaurant/pending` - Get pending requests
- `POST /requests/{id}/approve` - Approve request
- `POST /requests/{id}/reject` - Reject request

### NGO Endpoints
- `GET /ngo/dashboard` - Dashboard statistics
- `POST /ngo/search` - Search available food
- `GET /ngo/available` - Get all available food
- `POST /requests` - Create food request
- `GET /requests/ngo/my-requests` - Get my requests
- `PATCH /requests/{id}/pickup` - Mark as picked up
- `POST /requests/{id}/complete` - Complete donation

### Public Endpoints
- `GET /impact/stats` - Global impact statistics
- `GET /impact/top-restaurants` - Top restaurants
- `GET /impact/top-ngos` - Top NGOs

## 🔐 Authentication

The app uses JWT authentication:
- Tokens are stored in `localStorage`
- Axios interceptors automatically add tokens to requests
- 401 responses trigger automatic logout and redirect

## 🎨 Styling

- **Material-UI (MUI)** - Primary UI component library
- **Custom CSS** - Additional styling in component CSS files
- **CSS Variables** - Design system variables in `src/assets/styles/variables.css`

## 📱 Responsive Design

The app is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🧪 Testing

```bash
# Run tests (when configured)
npm test
```

## 🚢 Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The build output will be in the `dist/` directory.

## 🔍 Troubleshooting

### CORS Errors
- Ensure backend CORS is configured to allow `http://localhost:3000`
- Check `application.yml` in backend

### API Connection Issues
- Verify backend is running on `http://localhost:8080`
- Check `.env` file has correct `VITE_API_URL`
- Check browser console for errors

### Authentication Issues
- Clear localStorage and try again
- Check JWT token expiration
- Verify backend JWT secret configuration

## 📚 Technologies Used

- **React 19** - UI library
- **React Router v6** - Routing
- **Material-UI (MUI)** - Component library
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Date-fns** - Date formatting
- **React Icons** - Icons
- **Vite** - Build tool

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

## 👥 Authors

FeedForward Development Team

## 🔗 Related Links

- [Backend API Documentation](../feedforward-backend/API_ENDPOINTS.md)
- [Backend Connection Guide](./BACKEND_CONNECTION.md)
