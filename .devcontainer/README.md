# Deploying to GitHub Codespaces

This project is configured to run in GitHub Codespaces. Follow these steps to deploy:

1. Push this repository to GitHub (if not already there)
2. Go to the GitHub repository page
3. Click the "Code" button
4. Select the "Codespaces" tab
5. Click "Create codespace on main"

GitHub will create a new Codespace and set up the environment according to the configuration in `devcontainer.json`. The setup process will:

1. Build the Docker container defined in the project's Dockerfile
2. Install all dependencies for both backend and frontend
3. Forward ports 3000 (frontend) and 5000 (backend)
4. Set up VS Code with recommended extensions

## After Deployment

Once the Codespace is running:

1. The application should start automatically with `npm start`
2. Access the frontend at the forwarded port 3000
3. Access the backend API at the forwarded port 5000

## Troubleshooting

If the application doesn't start automatically:

1. Open a terminal in VS Code
2. Run `npm run install-all` to ensure all dependencies are installed
3. Run `npm start` to start the application

## Environment Variables

Make sure to set up any required environment variables in the Codespace:

1. Copy `.env.example` to `.env` if needed
2. Configure any required secrets in the GitHub repository settings 