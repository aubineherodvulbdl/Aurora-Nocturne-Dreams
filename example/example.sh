#!/bin/bash
# Aurora Nocturne Theme - Shell Script Example
# Демонстрация подсветки синтаксиса Shell

set -euo pipefail

#######################################
# Глобальные переменные и константы
#######################################
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="/var/log/app.log"
readonly MAX_RETRIES=3
readonly TIMEOUT=30

# Цвета для вывода
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

#######################################
# Функция для логирования
# Arguments:
#   $1 - Уровень (INFO, WARN, ERROR)
#   $2 - Сообщение
#######################################
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        INFO)
            echo -e "${GREEN}[INFO]${NC} ${timestamp} - ${message}"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} ${timestamp} - ${message}"
            ;;
        ERROR)
            echo -e "${RED}[ERROR]${NC} ${timestamp} - ${message}" >&2
            ;;
        *)
            echo "${timestamp} - ${message}"
            ;;
    esac
    
    echo "[${level}] ${timestamp} - ${message}" >> "$LOG_FILE" 2>/dev/null || true
}

#######################################
# Проверка зависимостей
#######################################
check_dependencies() {
    local deps=("curl" "jq" "git" "docker")
    local missing=()
    
    for cmd in "${deps[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            missing+=("$cmd")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log "ERROR" "Missing dependencies: ${missing[*]}"
        return 1
    fi
    
    log "INFO" "All dependencies are installed"
    return 0
}

#######################################
# Обработка пользователей
#######################################
process_users() {
    local input_file="$1"
    local output_file="$2"
    
    if [[ ! -f "$input_file" ]]; then
        log "ERROR" "Input file not found: $input_file"
        return 1
    fi
    
    log "INFO" "Processing users from $input_file"
    
    # Чтение файла построчно
    local count=0
    while IFS=',' read -r id name email status; do
        # Пропуск заголовка
        [[ "$id" == "id" ]] && continue
        
        # Валидация email
        if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
            echo "$id,$name,$email,$status" >> "$output_file"
            ((count++))
        else
            log "WARN" "Invalid email for user $id: $email"
        fi
    done < "$input_file"
    
    log "INFO" "Processed $count users"
    return 0
}

#######################################
# Работа с API
#######################################
fetch_api_data() {
    local endpoint="$1"
    local api_key="${API_KEY:-}"
    local retry_count=0
    
    if [[ -z "$api_key" ]]; then
        log "ERROR" "API_KEY environment variable is not set"
        return 1
    fi
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        log "INFO" "Fetching data from $endpoint (attempt $((retry_count + 1)))"
        
        local response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $api_key" \
            -H "Content-Type: application/json" \
            --max-time "$TIMEOUT" \
            "$endpoint")
        
        local http_code=$(echo "$response" | tail -n1)
        local body=$(echo "$response" | sed '$d')
        
        if [[ "$http_code" == "200" ]]; then
            echo "$body" | jq '.'
            return 0
        else
            log "WARN" "Request failed with status $http_code"
            ((retry_count++))
            sleep $((retry_count * 2))
        fi
    done
    
    log "ERROR" "Failed to fetch data after $MAX_RETRIES attempts"
    return 1
}

#######################################
# Резервное копирование
#######################################
backup_directory() {
    local source_dir="$1"
    local backup_dir="${2:-/backup}"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_name="backup_${timestamp}.tar.gz"
    
    if [[ ! -d "$source_dir" ]]; then
        log "ERROR" "Source directory does not exist: $source_dir"
        return 1
    fi
    
    mkdir -p "$backup_dir"
    
    log "INFO" "Creating backup of $source_dir"
    
    if tar -czf "${backup_dir}/${backup_name}" -C "$(dirname "$source_dir")" "$(basename "$source_dir")"; then
        local size=$(du -h "${backup_dir}/${backup_name}" | cut -f1)
        log "INFO" "Backup created successfully: ${backup_name} (${size})"
        
        # Удаление старых бэкапов (старше 7 дней)
        find "$backup_dir" -name "backup_*.tar.gz" -mtime +7 -delete
        log "INFO" "Old backups cleaned up"
        
        return 0
    else
        log "ERROR" "Backup failed"
        return 1
    fi
}

#######################################
# Мониторинг системы
#######################################
system_monitor() {
    log "INFO" "=== System Monitor ==="
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    echo -e "${BLUE}CPU Usage:${NC} ${cpu_usage}%"
    
    # Memory usage
    local mem_info=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')
    echo -e "${BLUE}Memory Usage:${NC} ${mem_info}"
    
    # Disk usage
    echo -e "${BLUE}Disk Usage:${NC}"
    df -h | grep -E '^/dev/' | awk '{printf "  %s: %s / %s (%s)\n", $1, $3, $2, $5}'
    
    # Running processes
    local process_count=$(ps aux | wc -l)
    echo -e "${BLUE}Running Processes:${NC} ${process_count}"
    
    # Network connections
    local connections=$(netstat -an 2>/dev/null | grep ESTABLISHED | wc -l || echo "N/A")
    echo -e "${BLUE}Active Connections:${NC} ${connections}"
}

#######################################
# Обработка аргументов командной строки
#######################################
parse_arguments() {
    local action=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                set -x
                shift
                ;;
            --backup)
                action="backup"
                shift
                ;;
            --monitor)
                action="monitor"
                shift
                ;;
            --check)
                action="check"
                shift
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "$action"
}

#######################################
# Справка
#######################################
show_help() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS]

Aurora Nocturne Theme - Shell Script Example

OPTIONS:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose mode
    --backup        Create backup
    --monitor       Show system monitor
    --check         Check dependencies

EXAMPLES:
    $(basename "$0") --backup
    $(basename "$0") --monitor
    $(basename "$0") --check --verbose

EOF
}

#######################################
# Главная функция
#######################################
main() {
    log "INFO" "Script started"
    
    local action=$(parse_arguments "$@")
    
    case "$action" in
        backup)
            backup_directory "/etc" "/backup"
            ;;
        monitor)
            system_monitor
            ;;
        check)
            check_dependencies
            ;;
        *)
            log "INFO" "No action specified, running default tasks"
            check_dependencies
            system_monitor
            ;;
    esac
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log "INFO" "Script completed successfully"
    else
        log "ERROR" "Script failed with exit code $exit_code"
    fi
    
    return $exit_code
}

# Обработка сигналов
trap 'log "WARN" "Script interrupted"; exit 130' INT TERM

# Запуск скрипта
main "$@"
