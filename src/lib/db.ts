import mysql from 'mysql2/promise';

// Load environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trustbuysell',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT || '0'),
  // Add SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : undefined,
  // Add connection timeout
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

export { pool };

// Helper function to execute queries
export async function executeQuery(query: string, values?: any[]): Promise<any> {
  try {
    const [results] = await pool.execute(query, values || []);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to get single row
export async function executeQuerySingle(query: string, values?: any[]): Promise<any> {
  try {
    const [results] = await pool.execute(query, values || []);
    return Array.isArray(results) && results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
} 