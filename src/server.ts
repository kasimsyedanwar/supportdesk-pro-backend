import { app } from './app';

const PORT = Number(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
  console.log(`SupportDesk Pro API running on http://localhost:${PORT}`);
});

const shutdown = (signal: string): void => {
  console.log(`${signal} received. Closing server...`);

  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
