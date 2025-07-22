const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || './database/jaguar_club.db';
  }

  // Инициализация базы данных
  async init() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Ошибка подключения к БД:', err);
          reject(err);
        } else {
          console.log('✅ Подключение к SQLite БД успешно');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  // Создание всех таблиц
  async createTables() {
    const tables = [
      // Таблица пользователей
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('client', 'coach', 'admin')) DEFAULT 'client',
        phone TEXT,
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )`,

      // Таблица анкет "Точка А"
      `CREATE TABLE IF NOT EXISTS point_a_forms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL,
        body_fat_percentage REAL,
        plank_time INTEGER,
        punches_per_minute INTEGER,
        energy_level INTEGER CHECK(energy_level >= 1 AND energy_level <= 10),
        stress_level INTEGER CHECK(stress_level >= 1 AND stress_level <= 10),
        sleep_quality INTEGER CHECK(sleep_quality >= 1 AND sleep_quality <= 10),
        nutrition_quality INTEGER CHECK(nutrition_quality >= 1 AND nutrition_quality <= 10),
        emotions_level INTEGER CHECK(emotions_level >= 1 AND emotions_level <= 10),
        intimacy_level INTEGER CHECK(intimacy_level >= 1 AND intimacy_level <= 10),
        goal_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Таблица тренировок
      `CREATE TABLE IF NOT EXISTS trainings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        coach_id INTEGER NOT NULL,
        training_date DATE NOT NULL,
        training_type TEXT CHECK(training_type IN ('Техника', 'Кардио', 'Спарринг', 'Общая')) DEFAULT 'Общая',
        attended BOOLEAN DEFAULT 1,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(coach_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Таблица комментариев тренеров
      `CREATE TABLE IF NOT EXISTS trainer_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        training_id INTEGER,
        user_id INTEGER NOT NULL,
        coach_id INTEGER NOT NULL,
        comment_text TEXT NOT NULL,
        training_type TEXT DEFAULT 'Тренировка',
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(training_id) REFERENCES trainings(id) ON DELETE SET NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(coach_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Таблица прогресса показателей
      `CREATE TABLE IF NOT EXISTS progress_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        weight REAL,
        body_fat_percentage REAL,
        plank_time INTEGER,
        punches_per_minute INTEGER,
        energy_level INTEGER CHECK(energy_level >= 1 AND energy_level <= 10),
        stress_level INTEGER CHECK(stress_level >= 1 AND stress_level <= 10),
        sleep_quality INTEGER CHECK(sleep_quality >= 1 AND sleep_quality <= 10),
        nutrition_quality INTEGER CHECK(nutrition_quality >= 1 AND nutrition_quality <= 10),
        emotions_level INTEGER CHECK(emotions_level >= 1 AND emotions_level <= 10),
        intimacy_level INTEGER CHECK(intimacy_level >= 1 AND intimacy_level <= 10),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Таблица профилей участников (для нетворкинга)
      `CREATE TABLE IF NOT EXISTS user_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        company TEXT,
        industry TEXT,
        expertise_offer TEXT,
        expertise_seeking TEXT,
        is_public BOOLEAN DEFAULT 0,
        linkedin_url TEXT,
        telegram_username TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Индексы для производительности
      `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`,
      `CREATE INDEX IF NOT EXISTS idx_trainings_user_id ON trainings(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_trainings_coach_id ON trainings(coach_id)`,
      `CREATE INDEX IF NOT EXISTS idx_trainings_date ON trainings(training_date)`,
      `CREATE INDEX IF NOT EXISTS idx_comments_user_id ON trainer_comments(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_comments_coach_id ON trainer_comments(coach_id)`,
      `CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress_updates(user_id)`
    ];

    // Выполняем все SQL команды
    for (const sql of tables) {
      await this.run(sql);
    }

    console.log('✅ Все таблицы БД созданы успешно');
    
    // Выполняем миграции
    await this.runMigrations();
  }

  // Выполнение миграций базы данных
  async runMigrations() {
    try {
      console.log('🔄 Проверка необходимости миграций...');
      
      // Миграция 1: Добавляем поле training_type в trainer_comments если его нет
      try {
        const columns = await this.all("PRAGMA table_info(trainer_comments)");
        const hasTrainingType = columns.some(col => col.name === 'training_type');
        
        if (!hasTrainingType) {
          console.log('📄 Добавляем поле training_type в trainer_comments...');
          await this.run('ALTER TABLE trainer_comments ADD COLUMN training_type TEXT DEFAULT "Тренировка"');
          console.log('✅ Поле training_type добавлено');
        }
      } catch (error) {
        console.log('⚠️ Миграция training_type пропущена:', error.message);
      }
      
      // Миграция 2: Делаем training_id nullable (SQLite не поддерживает ALTER COLUMN напрямую)
      // Для существующих данных это не критично, новая схема уже поправлена
      
      console.log('✅ Миграции выполнены');
    } catch (error) {
      console.error('❌ Ошибка выполнения миграций:', error);
    }
  }


  // Вспомогательные методы для работы с БД
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Закрытие соединения
  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) console.error('Ошибка закрытия БД:', err);
          else console.log('📴 Соединение с БД закрыто');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
