import { app } from './app';

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`SupportDesk Pro API is running on port ${PORT}`);
});
