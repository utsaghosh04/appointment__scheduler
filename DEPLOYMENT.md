# Deployment Guide

## Quick Start for Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Run development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## Deploy to Vercel

### Option 1: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Follow the prompts** to link your project

### Option 2: Vercel Dashboard

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Go to [vercel.com](https://vercel.com)**
3. **Click "New Project"**
4. **Import your GitHub repository**
5. **Vercel will auto-detect Vite and deploy**

## Deploy to Netlify

### Option 1: Netlify CLI

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Build the project:**
```bash
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod --dir=dist
```

### Option 2: Netlify Dashboard

1. **Push code to GitHub** (same as Vercel steps above)

2. **Go to [app.netlify.com](https://app.netlify.com)**

3. **Click "Add new site" → "Import an existing project"**

4. **Connect to GitHub** and select your repository

5. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

6. **Click "Deploy site"**

## Environment Variables

No environment variables are required for this demo. In production, you would add:
- `VITE_APPSYNC_URL` - Your AppSync GraphQL endpoint
- `VITE_API_KEY` - API key for authentication

## Repository Setup

1. **Initialize Git:**
```bash
git init
```

2. **Create .gitignore** (already included)

3. **Add all files:**
```bash
git add .
```

4. **Initial commit:**
```bash
git commit -m "Initial commit: Appointment Management System"
```

5. **Create repository on GitHub/GitLab/Bitbucket**

6. **Add remote and push:**
```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## Project Structure for Deployment

```
SwasthiQ-assignment/
├── appointment_service.py          # Python backend (Task 1)
├── appointmentService.js           # JS service layer
├── EMR_Frontend_Assignment.jsx     # React component (Task 2)
├── src/
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Tailwind CSS
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── README.md                       # Documentation
└── DEPLOYMENT.md                   # This file
```

## Live Link Requirements

After deployment, you'll get a URL like:
- Vercel: `https://your-project.vercel.app`
- Netlify: `https://your-project.netlify.app`

**Include this URL in your submission.**

## Troubleshooting

### Build Errors

If you get build errors:
1. Make sure all dependencies are installed: `npm install`
2. Check Node.js version (v14+ required)
3. Clear cache: `rm -rf node_modules package-lock.json && npm install`

### Tailwind CSS Not Working

If styles aren't applying:
1. Check `tailwind.config.js` includes all file paths
2. Ensure `postcss.config.js` is present
3. Verify `src/index.css` has Tailwind directives

### Import Errors

If you get module not found errors:
1. Ensure `appointmentService.js` is in the root directory
2. Check import paths in `EMR_Frontend_Assignment.jsx`
3. Verify file extensions match

