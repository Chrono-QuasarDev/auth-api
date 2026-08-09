import app from './src/app.js';
import sequelize from './src/config/db.js';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
  } catch (error) {
    console.error('Unable to start server:', error) ;
  }
}

start();