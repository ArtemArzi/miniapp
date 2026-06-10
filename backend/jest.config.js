module.exports = {
  // Среда выполнения - Node.js
  testEnvironment: 'node',
  // Явно указываем, где искать тесты.
  // Это хорошая практика, хотя Jest часто находит их автоматически.
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  // Увеличиваем таймаут, если потребуется
  testTimeout: 30000,
};