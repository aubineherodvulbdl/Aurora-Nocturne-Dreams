// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Aurora Nocturne Theme - Solidity Example
// Демонстрация подсветки синтаксиса Solidity

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title UserRegistry
 * @dev Контракт для управления пользователями
 */
contract UserRegistry is Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // Структура пользователя
    struct User {
        uint256 id;
        address wallet;
        string name;
        string email;
        bool isActive;
        uint256 createdAt;
        uint256 reputation;
    }

    // Перечисление статусов
    enum UserStatus {
        Pending,
        Active,
        Suspended,
        Banned
    }

    // События
    event UserRegistered(uint256 indexed userId, address indexed wallet, string name);
    event UserUpdated(uint256 indexed userId, string name);
    event UserStatusChanged(uint256 indexed userId, UserStatus status);
    event ReputationChanged(uint256 indexed userId, uint256 oldReputation, uint256 newReputation);

    // Переменные состояния
    mapping(uint256 => User) public users;
    mapping(address => uint256) public walletToUserId;
    mapping(address => UserStatus) public userStatus;
    
    uint256 public totalUsers;
    uint256 public constant MAX_USERS = 10000;
    uint256 public constant MIN_REPUTATION = 0;
    uint256 public constant MAX_REPUTATION = 1000;
    
    bool public registrationOpen = true;

    // Модификаторы
    modifier onlyRegistered() {
        require(walletToUserId[msg.sender] != 0, "User not registered");
        _;
    }

    modifier onlyActive() {
        require(userStatus[msg.sender] == UserStatus.Active, "User not active");
        _;
    }

    modifier registrationAllowed() {
        require(registrationOpen, "Registration is closed");
        require(totalUsers < MAX_USERS, "Maximum users reached");
        _;
    }

    /**
     * @dev Конструктор контракта
     */
    constructor() {
        totalUsers = 0;
    }

    /**
     * @dev Регистрация нового пользователя
     * @param _name Имя пользователя
     * @param _email Email пользователя
     */
    function registerUser(string memory _name, string memory _email) 
        external 
        registrationAllowed 
        returns (uint256) 
    {
        require(walletToUserId[msg.sender] == 0, "User already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");

        totalUsers = totalUsers.add(1);
        uint256 userId = totalUsers;

        users[userId] = User({
            id: userId,
            wallet: msg.sender,
            name: _name,
            email: _email,
            isActive: true,
            createdAt: block.timestamp,
            reputation: 100
        });

        walletToUserId[msg.sender] = userId;
        userStatus[msg.sender] = UserStatus.Active;

        emit UserRegistered(userId, msg.sender, _name);
        return userId;
    }

    /**
     * @dev Обновление информации пользователя
     * @param _name Новое имя
     * @param _email Новый email
     */
    function updateUser(string memory _name, string memory _email) 
        external 
        onlyRegistered 
        onlyActive 
    {
        uint256 userId = walletToUserId[msg.sender];
        User storage user = users[userId];

        if (bytes(_name).length > 0) {
            user.name = _name;
        }
        if (bytes(_email).length > 0) {
            user.email = _email;
        }

        emit UserUpdated(userId, user.name);
    }

    /**
     * @dev Изменение репутации пользователя
     * @param _userId ID пользователя
     * @param _amount Изменение репутации (может быть отрицательным)
     */
    function changeReputation(uint256 _userId, int256 _amount) 
        external 
        onlyOwner 
    {
        require(_userId > 0 && _userId <= totalUsers, "Invalid user ID");
        
        User storage user = users[_userId];
        uint256 oldReputation = user.reputation;
        
        if (_amount > 0) {
            user.reputation = user.reputation.add(uint256(_amount));
            if (user.reputation > MAX_REPUTATION) {
                user.reputation = MAX_REPUTATION;
            }
        } else if (_amount < 0) {
            uint256 decrease = uint256(-_amount);
            if (user.reputation > decrease) {
                user.reputation = user.reputation.sub(decrease);
            } else {
                user.reputation = MIN_REPUTATION;
            }
        }

        emit ReputationChanged(_userId, oldReputation, user.reputation);
    }

    /**
     * @dev Изменение статуса пользователя
     * @param _wallet Адрес пользователя
     * @param _status Новый статус
     */
    function setUserStatus(address _wallet, UserStatus _status) 
        external 
        onlyOwner 
    {
        require(walletToUserId[_wallet] != 0, "User not found");
        userStatus[_wallet] = _status;
        
        uint256 userId = walletToUserId[_wallet];
        users[userId].isActive = (_status == UserStatus.Active);
        
        emit UserStatusChanged(userId, _status);
    }

    /**
     * @dev Получение информации о пользователе
     * @param _userId ID пользователя
     */
    function getUser(uint256 _userId) 
        external 
        view 
        returns (
            address wallet,
            string memory name,
            string memory email,
            bool isActive,
            uint256 createdAt,
            uint256 reputation
        ) 
    {
        require(_userId > 0 && _userId <= totalUsers, "Invalid user ID");
        User memory user = users[_userId];
        
        return (
            user.wallet,
            user.name,
            user.email,
            user.isActive,
            user.createdAt,
            user.reputation
        );
    }

    /**
     * @dev Переключение регистрации
     */
    function toggleRegistration() external onlyOwner {
        registrationOpen = !registrationOpen;
    }

    /**
     * @dev Получение ID пользователя по адресу
     */
    function getUserIdByWallet(address _wallet) external view returns (uint256) {
        return walletToUserId[_wallet];
    }
}

/**
 * @title AuroraToken
 * @dev ERC20 токен с дополнительными функциями
 */
contract AuroraToken is ERC20, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18;
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18;
    
    mapping(address => bool) public minters;
    mapping(address => uint256) public lastMintTime;
    
    uint256 public mintCooldown = 1 days;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);

    modifier onlyMinter() {
        require(minters[msg.sender], "Not a minter");
        _;
    }

    constructor() ERC20("Aurora Token", "AURORA") {
        _mint(msg.sender, INITIAL_SUPPLY);
        minters[msg.sender] = true;
    }

    /**
     * @dev Добавление минтера
     */
    function addMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "Invalid address");
        require(!minters[_minter], "Already a minter");
        
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    /**
     * @dev Удаление минтера
     */
    function removeMinter(address _minter) external onlyOwner {
        require(minters[_minter], "Not a minter");
        
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    /**
     * @dev Минт токенов
     */
    function mint(address _to, uint256 _amount) 
        external 
        onlyMinter 
        nonReentrant 
        returns (bool) 
    {
        require(_to != address(0), "Invalid address");
        require(_amount > 0, "Amount must be positive");
        require(
            totalSupply().add(_amount) <= MAX_SUPPLY,
            "Exceeds max supply"
        );
        require(
            block.timestamp >= lastMintTime[msg.sender].add(mintCooldown),
            "Mint cooldown active"
        );

        lastMintTime[msg.sender] = block.timestamp;
        _mint(_to, _amount);
        
        emit TokensMinted(_to, _amount);
        return true;
    }

    /**
     * @dev Сжигание токенов
     */
    function burn(uint256 _amount) external returns (bool) {
        require(_amount > 0, "Amount must be positive");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");

        _burn(msg.sender, _amount);
        emit TokensBurned(msg.sender, _amount);
        
        return true;
    }

    /**
     * @dev Установка времени ожидания для минта
     */
    function setMintCooldown(uint256 _cooldown) external onlyOwner {
        require(_cooldown >= 1 hours, "Cooldown too short");
        mintCooldown = _cooldown;
    }
}
