#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Aurora Nocturne Theme - Python Example
Демонстрация подсветки синтаксиса Python
"""

import os
import sys
import json
import asyncio
import logging
from typing import List, Dict, Optional, Union, Tuple, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from abc import ABC, abstractmethod
from pathlib import Path
import re

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class UserStatus(Enum):
    """Перечисление статусов пользователя"""
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"


@dataclass
class User:
    """Класс пользователя с использованием dataclass"""
    id: int
    name: str
    email: str
    is_active: bool = True
    roles: List[str] = field(default_factory=lambda: ['user'])
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def __post_init__(self):
        """Валидация после инициализации"""
        if not self.validate_email(self.email):
            raise ValueError(f"Invalid email: {self.email}")
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Валидация email адреса"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    def to_dict(self) -> Dict[str, Any]:
        """Преобразование в словарь"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'is_active': self.is_active,
            'roles': self.roles,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat()
        }
    
    def __repr__(self) -> str:
        return f"User(id={self.id}, name='{self.name}', email='{self.email}')"


class DatabaseInterface(ABC):
    """Абстрактный интерфейс для базы данных"""
    
    @abstractmethod
    async def save(self, data: Dict[str, Any]) -> bool:
        """Сохранение данных"""
        pass
    
    @abstractmethod
    async def find(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Поиск данных"""
        pass
    
    @abstractmethod
    async def delete(self, id: int) -> bool:
        """Удаление данных"""
        pass


class UserManager:
    """Менеджер для управления пользователями"""
    
    MAX_USERS = 10000
    MIN_NAME_LENGTH = 2
    MAX_NAME_LENGTH = 100
    
    def __init__(self, database: DatabaseInterface):
        self.db = database
        self.users: Dict[int, User] = {}
        self._next_id = 1
        self._lock = asyncio.Lock()
        logger.info("UserManager initialized")
    
    async def add_user(self, name: str, email: str, **kwargs) -> User:
        """
        Добавление нового пользователя
        
        Args:
            name: Имя пользователя
            email: Email пользователя
            **kwargs: Дополнительные параметры
            
        Returns:
            User: Созданный пользователь
            
        Raises:
            ValueError: Если данные невалидны
            RuntimeError: Если достигнут лимит пользователей
        """
        async with self._lock:
            if len(self.users) >= self.MAX_USERS:
                raise RuntimeError("Maximum users limit reached")
            
            if not (self.MIN_NAME_LENGTH <= len(name) <= self.MAX_NAME_LENGTH):
                raise ValueError(f"Name length must be between {self.MIN_NAME_LENGTH} and {self.MAX_NAME_LENGTH}")
            
            user = User(
                id=self._next_id,
                name=name,
                email=email,
                **kwargs
            )
            
            self.users[user.id] = user
            self._next_id += 1
            
            await self.db.save(user.to_dict())
            logger.info(f"✓ User {name} created successfully with ID {user.id}")
            
            return user
    
    def find_by_email(self, email: str) -> Optional[User]:
        """Поиск пользователя по email"""
        return next(
            (user for user in self.users.values() if user.email == email),
            None
        )
    
    def find_by_id(self, user_id: int) -> Optional[User]:
        """Поиск пользователя по ID"""
        return self.users.get(user_id)
    
    def get_active_users(self) -> List[User]:
        """Получение всех активных пользователей"""
        return [user for user in self.users.values() if user.is_active]
    
    def filter_users(self, **criteria) -> List[User]:
        """
        Фильтрация пользователей по критериям
        
        Example:
            manager.filter_users(is_active=True, roles=['admin'])
        """
        result = list(self.users.values())
        
        for key, value in criteria.items():
            if isinstance(value, list):
                result = [u for u in result if getattr(u, key, None) == value]
            else:
                result = [u for u in result if getattr(u, key, None) == value]
        
        return result
    
    @property
    def total_users(self) -> int:
        """Общее количество пользователей"""
        return len(self.users)
    
    @property
    def active_count(self) -> int:
        """Количество активных пользователей"""
        return sum(1 for user in self.users.values() if user.is_active)


class Statistics:
    """Класс для работы со статистикой"""
    
    def __init__(self, data: List[Union[int, float]]):
        self.data = data
    
    @property
    def mean(self) -> float:
        """Среднее значение"""
        return sum(self.data) / len(self.data) if self.data else 0.0
    
    @property
    def median(self) -> float:
        """Медиана"""
        sorted_data = sorted(self.data)
        n = len(sorted_data)
        if n == 0:
            return 0.0
        mid = n // 2
        return (sorted_data[mid] + sorted_data[~mid]) / 2
    
    @property
    def min_max(self) -> Tuple[Union[int, float], Union[int, float]]:
        """Минимум и максимум"""
        return (min(self.data), max(self.data)) if self.data else (0, 0)
    
    def percentile(self, p: float) -> float:
        """Вычисление перцентиля"""
        if not 0 <= p <= 100:
            raise ValueError("Percentile must be between 0 and 100")
        
        sorted_data = sorted(self.data)
        k = (len(sorted_data) - 1) * p / 100
        f = int(k)
        c = k - f
        
        if f + 1 < len(sorted_data):
            return sorted_data[f] + c * (sorted_data[f + 1] - sorted_data[f])
        return sorted_data[f]


def process_data(data: List[Dict[str, Any]], 
                 transform_fn: callable = None,
                 filter_fn: callable = None) -> List[Dict[str, Any]]:
    """
    Обработка данных с применением функций трансформации и фильтрации
    
    Args:
        data: Список данных для обработки
        transform_fn: Функция трансформации (опционально)
        filter_fn: Функция фильтрации (опционально)
    
    Returns:
        Обработанный список данных
    """
    result = data.copy()
    
    if filter_fn:
        result = [item for item in result if filter_fn(item)]
    
    if transform_fn:
        result = [transform_fn(item) for item in result]
    
    return result


async def fetch_user_data(user_id: int, timeout: float = 5.0) -> Dict[str, Any]:
    """
    Асинхронное получение данных пользователя
    
    Args:
        user_id: ID пользователя
        timeout: Таймаут запроса
    
    Returns:
        Данные пользователя
    """
    try:
        # Симуляция асинхронного запроса
        await asyncio.sleep(0.1)
        
        return {
            'id': user_id,
            'name': f'User {user_id}',
            'email': f'user{user_id}@example.com',
            'timestamp': datetime.now().isoformat()
        }
    except asyncio.TimeoutError:
        logger.error(f"Timeout fetching data for user {user_id}")
        raise
    except Exception as e:
        logger.error(f"Error fetching user data: {e}")
        raise


async def batch_process_users(user_ids: List[int]) -> List[Dict[str, Any]]:
    """Пакетная обработка пользователей"""
    tasks = [fetch_user_data(uid) for uid in user_ids]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Фильтрация ошибок
    return [r for r in results if not isinstance(r, Exception)]


def read_config(config_path: str = 'config.json') -> Dict[str, Any]:
    """Чтение конфигурации из файла"""
    path = Path(config_path)
    
    if not path.exists():
        logger.warning(f"Config file not found: {config_path}")
        return {}
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        logger.info(f"Configuration loaded from {config_path}")
        return config
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in config file: {e}")
        return {}


def write_config(config: Dict[str, Any], config_path: str = 'config.json') -> bool:
    """Запись конфигурации в файл"""
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        logger.info(f"Configuration saved to {config_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to save config: {e}")
        return False


# Декоратор для измерения времени выполнения
def timing_decorator(func):
    """Декоратор для измерения времени выполнения функции"""
    async def async_wrapper(*args, **kwargs):
        start = datetime.now()
        result = await func(*args, **kwargs)
        elapsed = (datetime.now() - start).total_seconds()
        logger.info(f"{func.__name__} took {elapsed:.3f} seconds")
        return result
    
    def sync_wrapper(*args, **kwargs):
        start = datetime.now()
        result = func(*args, **kwargs)
        elapsed = (datetime.now() - start).total_seconds()
        logger.info(f"{func.__name__} took {elapsed:.3f} seconds")
        return result
    
    return async_wrapper if asyncio.iscoroutinefunction(func) else sync_wrapper


# Контекстный менеджер
class DatabaseConnection:
    """Контекстный менеджер для работы с базой данных"""
    
    def __init__(self, connection_string: str):
        self.connection_string = connection_string
        self.connection = None
    
    def __enter__(self):
        logger.info(f"Opening database connection: {self.connection_string}")
        # Здесь должно быть реальное подключение
        self.connection = {"connected": True}
        return self.connection
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        logger.info("Closing database connection")
        if exc_type:
            logger.error(f"Exception occurred: {exc_type.__name__}: {exc_val}")
        self.connection = None
        return False


def main():
    """Главная функция с примерами использования"""
    # Работа с числами и строками
    numbers = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30]
    stats = Statistics(numbers)
    
    print(f"Mean: {stats.mean:.2f}")
    print(f"Median: {stats.median:.2f}")
    print(f"Min/Max: {stats.min_max}")
    print(f"95th percentile: {stats.percentile(95):.2f}")
    
    # List comprehensions и lambda функции
    squares = [x**2 for x in range(10)]
    evens = [x for x in numbers if x % 2 == 0]
    doubled = list(map(lambda x: x * 2, numbers))
    
    print(f"\nSquares: {squares}")
    print(f"Evens: {evens}")
    print(f"Doubled: {doubled}")
    
    # Работа со словарями
    config = {
        'api_url': 'https://api.example.com',
        'timeout': 30,
        'retries': 3,
        'features': {
            'auth': True,
            'cache': False,
            'logging': True
        }
    }
    
    # Распаковка словаря
    api_url = config.get('api_url', 'default_url')
    timeout = config.get('timeout', 10)
    
    # F-strings и форматирование
    message = f"API URL: {api_url}, Timeout: {timeout}s"
    print(f"\n{message}")
    
    # Множественное присваивание
    x, y, z = 1, 2, 3
    a, *rest, b = [1, 2, 3, 4, 5]
    
    print(f"\nMultiple assignment: x={x}, y={y}, z={z}")
    print(f"Unpacking: a={a}, rest={rest}, b={b}")
    
    # Работа с None, True, False
    value = None
    is_valid = True
    is_empty = False
    
    result = value or "default_value"
    print(f"\nDefault value: {result}")


if __name__ == '__main__':
    try:
        main()
        logger.info("✓ Application completed successfully")
    except KeyboardInterrupt:
        logger.warning("⚠ Application interrupted by user")
        sys.exit(130)
    except Exception as e:
        logger.error(f"✗ Application failed: {e}", exc_info=True)
        sys.exit(1)
