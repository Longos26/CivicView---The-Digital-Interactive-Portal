
Ensure you have the following installed:
Git
Node.js & npm
GitHub Desktop (optional)
VS Code (recommended)

######################################################

Setup Instructions
Clone the Repository
1. Using GitHub Desktop:

Open GitHub Desktop.

Click File > Clone Repository.

Select the repository and choose an empty folder on your local machine.

2. Using Terminal:
git clone https://github.com/Longos26/CivicView---The-Digital-Interactive-Portal.git

######################################################
## Prerequisites
- Ensure all environment variables are set correctly in the `.env` files for both `api/` and `client/` as required.
- Make sure all dependencies are installed (`npm install` in root, `client/`, and `api/`).

3. Install Dependencies
Navigate to the project root:
npm install (terminal)

cd client
npm install
npm run dev

cd api
npm install
npm run dev
######################################################

4. Environment Variables
Obtain the .env file
Place it in the correct directory (root or client, as required).

######################################################

5. Open the project in VS Code:
code .

######################################################



Building the Frontend
1.Navigate to the `client` directory and build the production assets:

cd client
npm run build

This will generate a `dist/` folder with static assets ready for deployment.

2. Prepare the Backend
Navigate to the `api` directory:


cd ../api
npm install # if not already done


3. Set Environment Variables
- Place your `.env` files in the appropriate directories (`api/` and/or `client/`).
- Double-check all required variables are present for production (e.g., database URLs, API keys).

4. Deploy to Production
You can deploy using any Node.js-compatible hosting (VPS, cloud, etc.).

Option A: Deploy Both Frontend and Backend Together
- Serve the `client/dist` folder as static files (e.g., with Nginx, Apache, or a Node.js static server).
- Run the backend (`api/`) as a Node.js process (e.g., using PM2, systemd, or your host's process manager):


cd api
npm run start # or npm run dev for development
```

Option B: Deploy Separately
- Host the frontend (`client/dist`) on a static hosting service (e.g., Netlify, Vercel, GitHub Pages).
- Deploy the backend (`api/`) to a Node.js server (e.g., Heroku,Render, DigitalOcean, AWS EC2).

5. Configure Reverse Proxy (Recommended)
If deploying both on the same server, use a reverse proxy (Nginx/Apache) to route API requests to the backend and serve static files for the frontend.

6. Monitor and Maintain
- Use process managers (like PM2) to keep the backend running.
- Set up logging and monitoring for uptime and errors.



For platform-specific deployment (Heroku, Vercel, AWS, etc.), refer to their documentation for details on environment variables, build steps, and process management.
