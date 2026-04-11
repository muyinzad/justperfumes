module.exports = {
  apps: [{
    name: 'justperfumes',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3004',
    cwd: '/var/www/justperfumes',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3004,
    },
    max_memory_restart: '500M',
    restart_delay: 4000,
    autorestart: true,
  }],
}
