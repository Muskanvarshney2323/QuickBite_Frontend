# QuickBite Frontend

Welcome to the QuickBite Frontend! This is a modern React web application for ordering food online, managing restaurants, and tracking orders.

## 📋 What is QuickBite?

QuickBite is a full-featured food delivery platform where:

- **Customers** can browse restaurants, view menus, add items to cart, and checkout
- **Restaurants** can manage their menus and view orders
- **Agents** can track and manage deliveries
- **Admins** can oversee the entire system

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository** (if you haven't already)

   ```bash
   git clone <repository-url>
   cd quickbite-react
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Setup environment variables**
   - Copy `.env.example` to `.env`
   - Update the values with your backend API URL and other configuration

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppLayout.jsx   # Main layout wrapper
│   ├── AppNav.jsx      # Navigation bar
│   ├── Brand.jsx       # Logo/brand component
│   └── Toasts.jsx      # Notification toasts
│
├── pages/              # Page components for different routes
│   ├── Landing.jsx     # Home page
│   ├── Login.jsx       # User login
│   ├── Register.jsx    # User registration
│   ├── Menu.jsx        # Restaurant menu
│   ├── Cart.jsx        # Shopping cart
│   ├── Checkout.jsx    # Payment & checkout
│   ├── Orders.jsx      # User's orders
│   ├── Track.jsx       # Order tracking
│   ├── Restaurants.jsx # Browse restaurants
│   ├── AdminDashboard.jsx     # Admin panel
│   ├── RestaurantDashboard.jsx # Restaurant panel
│   ├── AgentDashboard.jsx      # Delivery agent panel
│   └── CustomerDashboard.jsx   # Customer profile
│
├── store/              # State management (stores)
│   ├── auth.js         # Authentication state
│   ├── cart.js         # Shopping cart state
│   └── toast.js        # Notification state
│
├── api/                # API communication
│   └── client.js       # API client setup
│
├── styles/             # Global stylesheets
│   ├── app.css
│   └── main.css
│
└── App.jsx             # Main App component
```

## 🎯 Key Features

### Pages & Features

| Page                     | Purpose                             |
| ------------------------ | ----------------------------------- |
| **Landing**              | Home page with featured restaurants |
| **Restaurants**          | Browse all restaurants              |
| **Menu**                 | View menu items for a restaurant    |
| **Cart**                 | View and edit shopping cart         |
| **Checkout**             | Complete payment and place order    |
| **Login**                | User authentication                 |
| **Register**             | Create new user account             |
| **Orders**               | View order history                  |
| **Track**                | Track order in real-time            |
| **Customer Dashboard**   | Manage customer profile             |
| **Restaurant Dashboard** | Restaurant owner panel              |
| **Admin Dashboard**      | System administration               |
| **Agent Dashboard**      | Delivery agent panel                |

### Main Components

- **AppLayout** - Wraps all pages with consistent layout
- **AppNav** - Top navigation bar with user menu
- **Brand** - Logo and branding
- **Toasts** - Show notifications to users

## 🛠️ Available Scripts

```bash
# Start development server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode for development
npm test -- --watch
```

## 📦 State Management (Store)

The app uses simple store modules to manage state:

### `store/auth.js`

Handles user authentication:

- Login/logout
- User info
- Token management

### `store/cart.js`

Manages shopping cart:

- Add/remove items
- Update quantities
- Calculate totals

### `store/toast.js`

Handles notifications:

- Success messages
- Error alerts
- Info notifications

## 🔌 API Client

The app communicates with a backend API through `api/client.js`:

- Configure your API base URL in `.env`
- The client handles authentication headers
- All requests go through this centralized client

### Example API calls:

```javascript
import { apiClient } from "./api/client.js";

// Get restaurants
const restaurants = await apiClient.get("/restaurants");

// Place order
const order = await apiClient.post("/orders", orderData);

// Get user profile
const user = await apiClient.get("/users/profile");
```

## ✅ Testing

The project includes unit tests for components and store modules:

```bash
# Run all tests
npm test

# Run tests for specific file
npm test -- AppNav.test.jsx

# Run tests in watch mode (re-run on file changes)
npm test -- --watch
```

Test files are located next to their source files with `.test.js` or `.test.jsx` extension.

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=QuickBite
```

See `.env.example` for all available variables.

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Deploy

- Upload the `dist/` folder to your hosting service
- Make sure your API endpoint is correctly configured
- Update environment variables for production

## 🐛 Troubleshooting

### Port already in use

If port 5173 is already in use, Vite will automatically use the next available port.

### API connection issues

- Check that your backend server is running
- Verify `VITE_API_URL` in `.env` points to the correct backend

### Clear node_modules

If you encounter dependency issues:

```bash
rm -r node_modules
npm install
```

## 📚 Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **JavaScript/JSX** - Programming language
- **CSS** - Styling
- **Jest** - Testing framework

## 👥 User Roles

### Customer

- Browse restaurants and menus
- Add items to cart
- Place orders
- Track orders
- View order history
- Manage profile

### Restaurant Owner

- Manage restaurant profile
- Update menu items
- View orders
- Track deliveries

### Delivery Agent

- View assigned orders
- Update delivery status
- Track route

### Admin

- Manage users
- Monitor restaurants
- View all orders
- System analytics

## 💡 Tips

- Keep your `.env` file secret and don't commit it to git
- Run tests before committing code
- Check browser console for any errors
- Use React Developer Tools browser extension for debugging

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review test files for usage examples
3. Check browser console for error messages
4. Verify backend API is running

---

**Happy coding! 🍕**
