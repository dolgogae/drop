# Redis

## Mac에서 Redis 설치 및 사용
```bash
# 설치
brew install redis

# 버전확인
redis-server --version

# 실행 - redis를 Homebrew 서비스로 실행하면 재부팅후에도 자동으로 실행됩니다.
brew services start redis

# 중단
brew services stop redis

# 터미널 접속하는 방법
redis-cli -h localhost -p 6379

# 전체 키 조회
keys *

# 키 전체 삭제
flushall
```