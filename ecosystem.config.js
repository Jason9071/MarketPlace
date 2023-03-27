module.exports = {
    apps : [
        {
          name: "exchange",
          script: "./index.js",
          watch: true,
          env: {
              "PORT": 80,
              "NODE_ENV": "development"
          },
          env_production: {
              "PORT": 80,
              "NODE_ENV": "production",
          }
        }
    ]
  }