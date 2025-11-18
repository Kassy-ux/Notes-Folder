import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

dotenv.config();

console.log('🔍 Testing database connection...');
console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
console.log('');

testConnection()
    .then((success) => {
        if (success) {
            console.log('🎉 Connection test passed!');
            process.exit(0);
        } else {
            console.log('❌ Connection test failed!');
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('💥 Error during test:', error);
        process.exit(1);
    });
