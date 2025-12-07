// Aurora Nocturne Theme - JavaScript Example
// Демонстрация подсветки синтаксиса JavaScript

/**
 * Класс для работы с пользователями
 * @class UserManager
 */
class UserManager {
  constructor(database) {
    this.db = database;
    this.users = new Map();
    this.activeCount = 0;
  }

  /**
   * Добавляет нового пользователя
   * @param {string} name - Имя пользователя
   * @param {string} email - Email пользователя
   * @returns {Promise<Object>} Созданный пользователь
   */
  async addUser(name, email) {
    const user = {
      id: this.generateId(),
      name,
      email,
      createdAt: new Date(),
      isActive: true,
      roles: ['user'],
      metadata: {
        loginCount: 0,
        lastLogin: null
      }
    };

    try {
      await this.db.save(user);
      this.users.set(user.id, user);
      this.activeCount++;
      console.log(`✓ User ${name} created successfully`);
      return user;
    } catch (error) {
      console.error(`✗ Failed to create user: ${error.message}`);
      throw error;
    }
  }

  /**
   * Находит пользователя по email
   * @param {string} email - Email для поиска
   */
  findByEmail(email) {
    return Array.from(this.users.values())
      .filter(user => user.email === email)
      .find(user => user.isActive);
  }

  generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Примеры использования различных конструкций
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
  features: {
    auth: true,
    cache: false,
    logging: true
  }
};

// Асинхронные функции и промисы
async function fetchUserData(userId) {
  const response = await fetch(`${config.apiUrl}/users/${userId}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// Стрелочные функции и деструктуризация
const processUsers = (users) => {
  return users
    .map(({ id, name, email }) => ({
      id,
      displayName: name.toUpperCase(),
      domain: email.split('@')[1]
    }))
    .filter(user => user.domain === 'example.com')
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
};

// Template literals и регулярные выражения
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const validateEmail = (email) => {
  const isValid = emailRegex.test(email);
  console.log(`Email ${email} is ${isValid ? 'valid' : 'invalid'}`);
  return isValid;
};

// Числа, булевы значения, null, undefined
const stats = {
  totalUsers: 1234,
  activeUsers: 567,
  conversionRate: 0.458,
  isPremium: true,
  lastUpdate: null,
  nextUpdate: undefined
};

// Экспорт модулей
export { UserManager, processUsers, validateEmail };
export default config;
