module.exports = {
  apps: [
    {
      name: 'pixelpro-app',
      script: 'node',
      args: 'node_modules/tsx/dist/cli.mjs watch server/index.ts',
      cwd: 'D:/porfolio/betterdeal',
      windowsHide: true,
      env: {
        NODE_ENV: 'production',
        API_PORT: '18081'
      }
    },
    {
      name: 'ai-core-platform',
      script: 'node',
      args: 'node_modules/tsx/dist/cli.mjs watch src/index.ts',
      cwd: 'D:/ai-core-platform',
      windowsHide: true,
      env: {
        NODE_ENV: 'production',
        PORT: '4000'
      }
    },
    {
      name: 'posweb-backend',
      script: 'server.js',
      cwd: 'D:/posweb/bot_backend',
      env: {
        NODE_ENV: 'production',
        PORT: '3001'
      }
    },
    {
      name: 'posweb-frontend',
      script: 'serve_posweb.cjs',
      cwd: 'D:/posweb',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
