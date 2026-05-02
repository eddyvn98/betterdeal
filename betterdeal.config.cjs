module.exports = {
  apps: [{
    name: 'pixelpro-app',
    script: 'node',
    args: 'node_modules/tsx/dist/cli.mjs server/index.ts',
    cwd: 'D:/porfolio/betterdeal',
    env: {
      API_PORT: 18081,
      NODE_ENV: 'production'
    }
  }]
}
