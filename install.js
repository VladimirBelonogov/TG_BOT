import  sqlite3  from "sqlite3";

const db = new sqlite3.Database('./users.db');

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id TEXT NOT NULL,
    is_subscriber BOOLEAN NOT NULL,
    letter TEXT,
    last_letter_send DATE
)`, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Table created');
    }
});

// Закрываем подключение к базе данных
db.close((err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Close the database connection.');
    }
});