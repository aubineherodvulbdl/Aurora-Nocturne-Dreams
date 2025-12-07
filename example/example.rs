// Aurora Nocturne Theme - Rust Example
// Демонстрация подсветки синтаксиса Rust

use std::collections::HashMap;
use std::fmt::{self, Display};
use std::error::Error;
use std::sync::{Arc, Mutex};

/// Структура пользователя
#[derive(Debug, Clone)]
pub struct User {
    pub id: u64,
    pub name: String,
    pub email: String,
    pub is_active: bool,
    pub roles: Vec<String>,
}

/// Перечисление для статуса операции
#[derive(Debug, PartialEq)]
pub enum OperationStatus {
    Success,
    Failed(String),
    Pending,
}

/// Трейт для валидации
pub trait Validate {
    fn is_valid(&self) -> bool;
    fn validate(&self) -> Result<(), String>;
}

impl Validate for User {
    fn is_valid(&self) -> bool {
        !self.name.is_empty() && self.email.contains('@')
    }

    fn validate(&self) -> Result<(), String> {
        if self.name.is_empty() {
            return Err("Name cannot be empty".to_string());
        }
        if !self.email.contains('@') {
            return Err("Invalid email format".to_string());
        }
        Ok(())
    }
}

impl Display for User {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "User(id={}, name={}, email={})", self.id, self.name, self.email)
    }
}

/// Менеджер пользователей с потокобезопасностью
pub struct UserManager {
    users: Arc<Mutex<HashMap<u64, User>>>,
    next_id: Arc<Mutex<u64>>,
}

impl UserManager {
    /// Создает новый экземпляр UserManager
    pub fn new() -> Self {
        Self {
            users: Arc::new(Mutex::new(HashMap::new())),
            next_id: Arc::new(Mutex::new(1)),
        }
    }

    /// Добавляет нового пользователя
    pub fn add_user(&self, name: String, email: String) -> Result<User, Box<dyn Error>> {
        let mut id_lock = self.next_id.lock().unwrap();
        let id = *id_lock;
        *id_lock += 1;
        drop(id_lock);

        let user = User {
            id,
            name,
            email,
            is_active: true,
            roles: vec!["user".to_string()],
        };

        user.validate()?;

        let mut users = self.users.lock().unwrap();
        users.insert(id, user.clone());
        
        println!("✓ User {} created successfully", user.name);
        Ok(user)
    }

    /// Находит пользователя по ID
    pub fn find_by_id(&self, id: u64) -> Option<User> {
        let users = self.users.lock().unwrap();
        users.get(&id).cloned()
    }

    /// Получает всех активных пользователей
    pub fn get_active_users(&self) -> Vec<User> {
        let users = self.users.lock().unwrap();
        users.values()
            .filter(|u| u.is_active)
            .cloned()
            .collect()
    }
}

/// Обобщенная функция для обработки результатов
fn process_result<T, E>(result: Result<T, E>) -> OperationStatus 
where
    E: Display,
{
    match result {
        Ok(_) => OperationStatus::Success,
        Err(e) => OperationStatus::Failed(e.to_string()),
    }
}

/// Макрос для логирования
#[macro_export]
macro_rules! log_info {
    ($($arg:tt)*) => {
        println!("[INFO] {}", format!($($arg)*))
    };
}

/// Асинхронная функция для демонстрации
async fn fetch_user_data(user_id: u64) -> Result<String, Box<dyn Error>> {
    // Симуляция асинхронного запроса
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
    Ok(format!("Data for user {}", user_id))
}

/// Функция с lifetime параметрами
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

/// Константы и статические переменные
const MAX_USERS: usize = 1000;
const API_VERSION: &str = "v1.0.0";
static mut GLOBAL_COUNTER: u32 = 0;

/// Главная функция с примерами использования
fn main() -> Result<(), Box<dyn Error>> {
    let manager = UserManager::new();

    // Создание пользователей
    let user1 = manager.add_user(
        "Alice Johnson".to_string(),
        "alice@example.com".to_string(),
    )?;

    let user2 = manager.add_user(
        "Bob Smith".to_string(),
        "bob@example.com".to_string(),
    )?;

    // Работа с Option и Result
    match manager.find_by_id(1) {
        Some(user) => println!("Found: {}", user),
        None => println!("User not found"),
    }

    // Итераторы и замыкания
    let active_users = manager.get_active_users();
    let names: Vec<String> = active_users
        .iter()
        .map(|u| u.name.to_uppercase())
        .filter(|n| n.len() > 5)
        .collect();

    println!("Active users: {:?}", names);

    // Работа с числами и операциями
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    let product: i32 = numbers.iter().product();
    let average = sum as f64 / numbers.len() as f64;

    println!("Sum: {}, Product: {}, Average: {:.2}", sum, product, average);

    // Pattern matching
    let status = OperationStatus::Success;
    match status {
        OperationStatus::Success => println!("✓ Operation completed"),
        OperationStatus::Failed(msg) => println!("✗ Operation failed: {}", msg),
        OperationStatus::Pending => println!("⏳ Operation pending"),
    }

    // Использование макроса
    log_info!("Application started with version {}", API_VERSION);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_validation() {
        let user = User {
            id: 1,
            name: "Test User".to_string(),
            email: "test@example.com".to_string(),
            is_active: true,
            roles: vec!["user".to_string()],
        };

        assert!(user.is_valid());
        assert!(user.validate().is_ok());
    }

    #[test]
    fn test_user_manager() {
        let manager = UserManager::new();
        let result = manager.add_user("Test".to_string(), "test@test.com".to_string());
        assert!(result.is_ok());
    }
}
