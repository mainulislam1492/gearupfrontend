# GearUp Frontend
 
GearUp is a sports gear rental platform where customers rent gear, providers list and manage their inventory, and admins moderate the marketplace.
 
**Live Demo:** [https://gearupfrontend-ashen.vercel.app/](https://gearupfrontend-ashen.vercel.app/)
 
## User Roles
 
| Role | Description | Account |
|------|-------------|---------|
| Customer | Rents sports gear | Self-register, select "customer" |
| Provider | Gear vendor or rental shop | Self-register, select "provider" |
| Admin | Platform moderator | Created by seed script (no self-registration) |
 
## Features
 
**Public (no login)**
- Browse, search, filter (category, brand, price, availability) and sort gear with pagination
- View gear details: specifications, images, provider shop, reviews and average rating
- View all categories

**Authentication and Account**
- Register, login, logout, refresh token, change password
- View and update profile (name, phone, address, photo)
- Providers can add and update shop name and address
- Suspended users cannot log in

**Customer**
- Place rental orders (server-calculated pricing, date-based stock check)
- View, track and cancel orders (only while `PLACED`)
- Pay with Stripe or SSLCommerz, view payment history, retry failed payments
- Review gear (1-5 rating and comment) after it is returned

**Provider**
- Add, edit and remove gear (rental-history gear is hidden instead of deleted)
- Manage stock and availability
- View incoming orders; confirm, mark picked up, mark returned

**Admin**
- View users, filter by role/status, suspend or activate them
- View all gear (including hidden), hide or restore listings
- View all orders with filters
- Create, update and delete categories (categories with gear cannot be deleted)

## Getting Started
 
```bash
# Clone the repository
git clone <https://github.com/mainulislam1492/gearupfrontend.git>
cd gearupfrontend
 
# Install dependencies
npm install
 
# Run the development server
npm run dev
```
 
 
## Deployment
 
Deployed on Vercel: [gearupfrontend-ashen.vercel.app](https://gearupfrontend-ashen.vercel.app/)
 
