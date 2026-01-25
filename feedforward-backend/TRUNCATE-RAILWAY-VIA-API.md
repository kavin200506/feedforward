# Truncate Railway MySQL Tables via API

I've created a temporary admin endpoint that you can call to truncate all tables in Railway MySQL.

## Steps:

1. **Set the admin secret key** (for security):
   - In Railway dashboard, go to your backend service
   - Add environment variable: `ADMIN_SECRET_KEY=your-secret-key-here`
   - Or use the default: `CHANGE_THIS_IN_PRODUCTION` (not secure!)

2. **Deploy the changes** to Railway (the AdminController is now in your codebase)

3. **Call the endpoint**:
   ```bash
   curl -X POST "https://your-railway-backend-url.railway.app/api/admin/truncate-all?secret=your-secret-key-here"
   ```

   Or use your browser/Postman:
   ```
   POST https://your-railway-backend-url.railway.app/api/admin/truncate-all?secret=your-secret-key-here
   ```

4. **Response** will show:
   ```json
   {
     "success": true,
     "message": "All tables truncated successfully",
     "data": {
       "message": "All tables truncated successfully in Railway MySQL!",
       "counts": {
         "users": 0,
         "restaurants": 0,
         "ngos": 0,
         "food_listings": 0,
         "food_requests": 0,
         "donation_history": 0
       }
     }
   }
   ```

## Security Note:
⚠️ **IMPORTANT**: This endpoint should be removed or properly secured before production!
The current implementation uses a simple secret key check which is not production-ready.

## Alternative: Use Railway CLI
If you prefer not to use the API endpoint:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and connect
railway login
railway link
railway connect mysql

# Then run SQL:
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE donation_history;
TRUNCATE TABLE food_requests;
TRUNCATE TABLE food_listings;
TRUNCATE TABLE ngos;
TRUNCATE TABLE restaurants;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;
```
