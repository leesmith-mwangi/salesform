module.exports = {
  apps: [
    {
      name: "salesform-frontend",
      script: "./node_modules/serve/bin/serve.js",
      args: "-s build -l 3000",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3000"
      },
      watch: false,
      autorestart: true
    }
  ]
};
