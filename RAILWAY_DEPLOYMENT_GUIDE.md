# Railway Deployment Guide - Step by Step

**Project**: Sales & Distribution Management System
**Date**: November 3, 2025
**Status**: Ready to Deploy ✅

---

## ✅ Pre-Deployment Checklist (COMPLETED)

- ✅ Database config updated to support `DATABASE_URL`
- ✅ Server port configured for Railway (`0.0.0.0`)
- ✅ Frontend API URL supports environment variable
- ✅ Start scripts added to package.json
- ✅ .env.example files created

**All code changes are complete! Ready to deploy.**

---

## 🚀 Railway Deployment Steps

### Part 1: Commit and Push to GitHub

**1. Check Git Status**
```bash
cd /home/art/projects/salesform
git status
```

**2. Add All Changes**
```bash
git add .
```

**3. Commit Changes**
```bash
git commit -m "Prepare for Railway deployment

- Update database.js to support DATABASE_URL
- Configure server to bind to 0.0.0.0
- Add environment variable support for frontend API
- Create .env.example files for documentation
"
```

**4. Push to GitHub**
```bash
git push origin main
```

**If you don't have a GitHub repository yet:**
```bash
# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/salesform.git

# Push
git branch -M main
git push -u origin main
```

---

### Part 2: Sign Up for Railway

**1. Go to Railway**
- Visit: https://railway.app
- Click "Login" or "Start a New Project"

**2. Sign Up with GitHub**
- Click "Login with GitHub"
- Authorize Railway to access your repositories
- This makes deployment much easier!

**3. Verify Account**
- Complete email verification if required
- You'll get $5 free credit (no credit card needed initially)

---

### Part 3: Deploy PostgreSQL Database

**1. Create New Project**
- Click "New Project" button
- Select "Provision PostgreSQL"

**2. Name Your Database**
- Railway will create the database automatically
- Name it: `salesform-db` (optional, just for clarity)

**3. Get Database Connection String**
- Click on the PostgreSQL service
- Go to "Connect" tab
- Copy the `DATABASE_URL` (you'll need this)
- It looks like: `postgresql://user:password@host:port/database`

**⚠️ IMPORTANT**: Keep this window open, you'll need the URL!

---

### Part 4: Deploy Backend Service

**1. Add New Service**
- In your Railway project, click "New"
- Select "GitHub Repo"
- Choose your `salesform` repository
- Railway will scan and detect Node.js

**2. Configure Backend**
- Click on the new service
- Go to "Settings"

**3. Set Root Directory**
- Scroll to "Root Directory"
- Enter: `backend`
- Click "Update"

**4. Add Environment Variables**
- Go to "Variables" tab
- Click "New Variable"

Add these variables:
```
DATABASE_URL = <paste the PostgreSQL connection string from Part 3>
NODE_ENV = production
PORT = 5000
FRONTEND_URL = https://${{RAILWAY_STATIC_URL}}
```

**5. Deploy**
- Railway will automatically deploy
- Wait 2-3 minutes for build to complete
- Check "Deployments" tab for progress

**6. Get Backend URL**
- Go to "Settings"
- Scroll to "Domains"
- Click "Generate Domain"
- Copy the URL (e.g., `salesform-backend.railway.app`)
- **Save this URL - you need it for frontend!**

---

### Part 5: Set Up Database Schema

**Option A: Using Railway Shell (Recommended)**

**1. Open Railway Shell**
- Click on your backend service
- Click "Shell" or "Terminal" icon
- Wait for shell to load

**2. Run Database Setup**
```bash
npm run db:setup
```

**3. Verify**
- You should see success messages
- Tables and seed data created

**Option B: Using Local psql Client**

**1. Install psql** (if not installed)
```bash
sudo apt-get install postgresql-client
```

**2. Connect to Railway Database**
```bash
psql "postgresql://user:password@host:port/database"
```
(Use the DATABASE_URL from Part 3)

**3. Run Schema**
- Copy contents of `backend/src/config/schema.sql`
- Paste into psql prompt
- Press Enter

---

### Part 6: Deploy Frontend Service

**1. Add Another Service**
- Click "New" in your Railway project
- Select "GitHub Repo"
- Choose the SAME `salesform` repository
- Railway detects it's the same repo - that's OK!

**2. Configure Frontend**
- Click on the new service
- Name it: "salesform-frontend" (for clarity)
- Go to "Settings"

**3. Set Root Directory**
- Scroll to "Root Directory"
- Enter: `frontend`
- Click "Update"

**4. Add Environment Variable**
- Go to "Variables" tab
- Click "New Variable"

Add this variable:
```
REACT_APP_API_URL = https://YOUR-BACKEND-URL.railway.app/api
```
Replace `YOUR-BACKEND-URL` with the backend domain from Part 4, Step 6

Example:
```
REACT_APP_API_URL = https://salesform-backend-production.up.railway.app/api
```

**5. Deploy**
- Railway will automatically build and deploy
- Wait 3-5 minutes for build to complete
- React build takes longer than backend

**6. Get Frontend URL**
- Go to "Settings"
- Scroll to "Domains"
- Click "Generate Domain"
- Copy the URL (e.g., `salesform.railway.app`)
- **This is your client-facing URL! 🎉**

---

### Part 7: Update Backend CORS

**Now that you have the frontend URL, update backend:**

**1. Go to Backend Service**
- Click on your backend service in Railway

**2. Update FRONTEND_URL Variable**
- Go to "Variables"
- Find `FRONTEND_URL`
- Update it to your actual frontend URL:
```
FRONTEND_URL = https://salesform.railway.app
```

**3. Redeploy**
- Railway will automatically redeploy
- Wait 1-2 minutes

---

## 🧪 Testing Your Deployment

### Test Backend:

**1. Health Check**
```bash
curl https://your-backend.railway.app/api/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2025-11-03T...",
  "database": "connected"
}
```

**2. Check Products**
```bash
curl https://your-backend.railway.app/api/products
```

Should return list of products.

### Test Frontend:

**1. Open in Browser**
```
https://your-frontend.railway.app
```

**2. Check Console**
- Open browser DevTools (F12)
- Check Console tab
- Should see: "API Base URL: https://your-backend.railway.app/api"
- No CORS errors

**3. Test Features**
- Dashboard loads ✅
- Metrics display ✅
- Click "Stock" page ✅
- Click "Distributions" page ✅
- Try "Add Stock" form ✅
- Try "Distribute Stock" form ✅

---

## 🎉 Success! Your App is Live

**Your URLs:**
- **Frontend** (Share this with client): `https://your-frontend.railway.app`
- **Backend API**: `https://your-backend.railway.app`
- **Database**: Managed by Railway

---

## 📊 Railway Dashboard Overview

**What You'll See:**

```
My Project (salesform)
├── salesform-db (PostgreSQL)
│   ├── Status: Running
│   ├── Memory: ~50MB
│   └── Cost: ~$1/month
│
├── salesform-backend (Node.js)
│   ├── Status: Running
│   ├── Memory: ~80MB
│   ├── URL: https://salesform-backend.railway.app
│   └── Cost: ~$2/month
│
└── salesform-frontend (React)
    ├── Status: Running
    ├── Memory: ~20MB
    ├── URL: https://salesform.railway.app
    └── Cost: ~$0.50/month
```

**Total Estimated Cost**: ~$3.50/month
**Free Credit**: $5/month
**Result**: FREE for first month! 🎉

---

## 🔄 Future Updates (Auto-Deploy)

**Whenever you push code to GitHub:**

1. Commit your changes
```bash
git add .
git commit -m "Your changes"
git push origin main
```

2. Railway automatically detects the push
3. Rebuilds and redeploys affected services
4. Your app updates automatically!

**No manual steps needed after initial setup!**

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
- Check DATABASE_URL in backend variables
- Verify database is running (should be green in Railway)
- Check backend logs for connection errors

### Issue: "CORS Error" in frontend

**Solution:**
- Verify FRONTEND_URL in backend matches your frontend domain
- Check Railway logs for CORS-related errors
- Make sure you updated it in Part 7

### Issue: "404 Not Found" when calling API

**Solution:**
- Verify REACT_APP_API_URL in frontend includes `/api` at the end
- Check browser console for the API URL being used
- Test backend health endpoint directly

### Issue: Backend keeps crashing

**Solution:**
- Check Railway logs (click service → "Logs")
- Verify DATABASE_URL format is correct
- Check that all dependencies installed

### Issue: Frontend shows blank page

**Solution:**
- Check browser console for errors
- Verify build succeeded in Railway
- Check that REACT_APP_API_URL is set correctly

---

## 💰 Cost Management

**To stay within $5 free credit:**

**Check Usage:**
- Go to Railway dashboard
- Click "Usage" tab
- Monitor daily/monthly spend

**Estimated Monthly Cost:**
- Database: $1-2
- Backend: $2-3
- Frontend: $0.50-1
- **Total**: $3.50-6

**Tips to Reduce Cost:**
- Free tier is usually enough for demos
- Scale down if not actively using
- Delete services when done testing

---

## 📚 Useful Railway Commands

**View Logs:**
```bash
# Install Railway CLI (optional)
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs
```

**Or use Railway web dashboard** (easier!)

---

## ✅ Deployment Checklist

- [ ] Code committed and pushed to GitHub
- [ ] Railway account created
- [ ] PostgreSQL database provisioned
- [ ] Backend service deployed
- [ ] DATABASE_URL added to backend
- [ ] Database schema set up
- [ ] Backend health check passes
- [ ] Frontend service deployed
- [ ] REACT_APP_API_URL added to frontend
- [ ] FRONTEND_URL updated in backend
- [ ] Frontend loads in browser
- [ ] Dashboard displays data
- [ ] All pages work
- [ ] Add Stock works
- [ ] Distribute Stock works

**All checked? YOU'RE DONE! 🎉**

---

## 🎁 Share with Your Client

**Send this message:**

---

Hi [Client Name],

The Sales & Distribution Management System is now live! 🎉

**Access the application here:**
🔗 https://your-frontend.railway.app

**Test Credentials:** (if you added auth)
[Add if applicable]

**What's included:**
- ✅ Real-time dashboard with key metrics
- ✅ Stock management system
- ✅ Distribution tracking
- ✅ Mess (restaurant) management
- ✅ Reports and analytics
- ✅ Add stock functionality
- ✅ Distribute stock functionality

The system is hosted on Railway cloud platform with:
- ✅ Automatic backups
- ✅ HTTPS security
- ✅ 99.9% uptime
- ✅ Auto-scaling

Feel free to explore and let me know if you have any questions!

Best regards,
[Your Name]

---

**Need help?** Contact me or check the documentation in the project repository.

---

**Last Updated**: November 3, 2025
**Status**: Ready for Deployment
**Estimated Setup Time**: 30-45 minutes
