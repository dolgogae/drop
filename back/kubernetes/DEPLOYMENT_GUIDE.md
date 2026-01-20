# Drop Backend EKS 배포 가이드

이 가이드는 Drop 백엔드를 AWS EKS에 배포하는 전체 과정을 설명합니다.

## 사전 요구사항

- AWS CLI 설치 및 구성
- kubectl 설치
- Docker 설치
- EKS 클러스터 (`backend-api-dev-eks`) 생성 완료
- AWS 계정 ID 확인: `aws sts get-caller-identity --query Account --output text`

## 1단계: AWS Secrets Store CSI Driver 설치

```bash
# Secrets Store CSI Driver 설치
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/rbac-secretproviderclass.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/csidriver.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/secrets-store.csi.x-k8s.io_secretproviderclasses.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/secrets-store.csi.x-k8s.io_secretproviderclasspodstatuses.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/secrets-store-csi-driver.yaml

# AWS Provider 설치
kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml
```

확인:
```bash
kubectl get pods -n kube-system | grep secrets-store
```

## 2단계: IAM 권한 설정

### 간단한 방법: setup-iam.sh 사용 (권장)

```bash
cd kubernetes
./setup-iam.sh
```

이 스크립트가 자동으로:
- OIDC Provider 연결
- IAM Policy 생성 (`DropBackendSecretsPolicy`)
- IAM Role과 ServiceAccount 생성
- 정책을 Role에 연결

### 수동 설정 (필요한 경우)

#### IAM Role과 ServiceAccount 확인

```bash
# ServiceAccount 확인
kubectl get sa drop-backend-sa -o yaml

# Role ARN 추출
ROLE_ARN=$(kubectl get sa drop-backend-sa -o jsonpath='{.metadata.annotations.eks\.amazonaws\.com/role-arn}')
echo $ROLE_ARN

# Role 이름 추출
ROLE_NAME=$(echo $ROLE_ARN | cut -d'/' -f2)

# Role에 연결된 정책 확인
aws iam list-attached-role-policies --role-name $ROLE_NAME
```

#### 신규 환경에서 처음부터 설정

```bash
# OIDC Provider 연결
eksctl utils associate-iam-oidc-provider \
  --cluster backend-api-dev-eks \
  --region ap-northeast-2 \
  --approve

# IAM Policy 생성
cat > /tmp/drop-secrets-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:ap-northeast-2:441070253196:secret:drop/backend/*"
      ]
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name DropBackendSecretsPolicy \
  --policy-document file:///tmp/drop-secrets-policy.json

# IAM Role과 ServiceAccount 생성
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

eksctl create iamserviceaccount \
  --name drop-backend-sa \
  --namespace default \
  --cluster backend-api-dev-eks \
  --region ap-northeast-2 \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/DropBackendSecretsPolicy \
  --approve \
  --override-existing-serviceaccounts
```

## 3단계: RDS 및 ElastiCache 생성

```bash
cd kubernetes
chmod +x setup-aws-resources.sh
./setup-aws-resources.sh
```

이 스크립트는 다음을 생성합니다:
- RDS MySQL 인스턴스 (db.t3.micro)
- ElastiCache Redis 클러스터 (cache.t3.micro)
- 필요한 Security Groups 및 Subnet Groups

**완료까지 약 15-20분 소요됩니다.**

스크립트가 완료되면 RDS와 Redis의 엔드포인트가 출력됩니다.

## 4단계: AWS Secrets Manager에 Secret 생성

**주의**: `setup-secrets.sh` 파일은 실제 secret 값이 포함되어 있어 `.gitignore`에 추가되어 있습니다.
새로운 환경에서는 `setup-secrets.sh.example`을 복사하여 사용하세요.

```bash
# 새로운 환경이라면 example 파일을 복사
# cp setup-secrets.sh.example setup-secrets.sh
# 그 다음 setup-secrets.sh를 편집하여 실제 값 입력

chmod +x setup-secrets.sh
./setup-secrets.sh
```

그 다음, 3단계에서 출력된 엔드포인트를 사용하여 Secret 값을 업데이트합니다:

```bash
# RDS 정보 업데이트
aws secretsmanager update-secret \
  --secret-id drop/backend/db-credentials \
  --secret-string '{"username":"admin","password":"YourStrongPassword123!","host":"<RDS_ENDPOINT>","port":"3306","database":"drop"}' \
  --region ap-northeast-2

# Redis 정보 업데이트
aws secretsmanager update-secret \
  --secret-id drop/backend/redis-connection \
  --secret-string '{"host":"<REDIS_ENDPOINT>","port":"6379"}' \
  --region ap-northeast-2

# OAuth 정보 업데이트 (본인의 Google OAuth credentials 사용)
aws secretsmanager update-secret \
  --secret-id drop/backend/oauth-credentials \
  --secret-string '{"google-client-id":"your-actual-client-id.apps.googleusercontent.com","google-client-secret":"your-actual-client-secret"}' \
  --region ap-northeast-2

# JWT Secret 업데이트 (최소 256비트 랜덤 문자열)
aws secretsmanager update-secret \
  --secret-id drop/backend/jwt-secret \
  --secret-string '{"secret-key":"your-generated-jwt-secret-key-at-least-256-bits"}' \
  --region ap-northeast-2

# AES Secret 업데이트 (정확히 16바이트)
aws secretsmanager update-secret \
  --secret-id drop/backend/aes-secret \
  --secret-string '{"secret-key":"1234567890123456"}' \
  --region ap-northeast-2

# Kakao API Key 업데이트
aws secretsmanager update-secret \
  --secret-id drop/backend/kakao-api \
  --secret-string '{"key":"your-kakao-api-key"}' \
  --region ap-northeast-2
```

### Secret Key 생성 방법

```bash
# JWT Secret (256비트 = 32바이트)
openssl rand -base64 32

# AES Secret (128비트 = 16바이트)
openssl rand -hex 16
```

## 5단계: RDS 데이터베이스 초기화

RDS 인스턴스에 접속하여 데이터베이스를 생성합니다:

```bash
# Bastion Host 또는 EKS Pod에서 실행
mysql -h <RDS_ENDPOINT> -u admin -p

# MySQL 프롬프트에서:
CREATE DATABASE IF NOT EXISTS drop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
exit;
```

## 6단계: ECR 레포지토리 생성 및 이미지 푸시

```bash
# ECR 레포지토리 생성
aws ecr create-repository --repository-name drop-backend --region ap-northeast-2

# ECR 로그인
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com

# 백엔드 빌드
cd ../
./gradlew clean bootJar

# Docker 이미지 빌드
docker build -t drop-backend:latest .

# 이미지 태깅
docker tag drop-backend:latest ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:latest

# ECR에 푸시
docker push ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:latest
```

## 7단계: application-prod.yml 생성

Spring Boot는 환경변수를 통해 설정을 오버라이드할 수 있지만, `application-prod.yml`을 생성하여 프로덕션 설정을 관리하는 것이 좋습니다.

```yaml
# src/main/resources/application-prod.yml
server:
  servlet:
    context-path: /api
  port: 8080

spring:
  config:
    activate:
      on-profile: prod
  jpa:
    hibernate:
      ddl-auto: validate  # 프로덕션에서는 validate 사용
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
  cache:
    type: redis

# Swagger는 프로덕션에서 비활성화 권장
springdoc:
  swagger-ui:
    enabled: false
  api-docs:
    enabled: false

logging.level:
  org.hibernate.SQL: info  # 프로덕션에서는 info 레벨
```

빌드 후 이미지를 다시 푸시:
```bash
./gradlew clean bootJar
docker build -t drop-backend:latest .
docker tag drop-backend:latest ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:latest
docker push ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:latest
```

## 8단계: Kubernetes 리소스 배포

```bash
cd kubernetes

# EKS 클러스터에 연결
aws eks update-kubeconfig --region ap-northeast-2 --name backend-api-dev-eks

# ServiceAccount 배포 (필요한 경우)
kubectl apply -f service-account.yaml

# SecretProviderClass 배포
kubectl apply -f secret-provider-class.yaml

# Deployment 배포
kubectl apply -f deployment.yaml

# Service 배포
kubectl apply -f service.yaml
```

## 9단계: 배포 확인

```bash
# Pod 상태 확인
kubectl get pods -l app=drop-backend

# Pod 로그 확인
kubectl logs -l app=drop-backend --tail=100 -f

# Secret이 제대로 마운트되었는지 확인
kubectl exec -it <POD_NAME> -- ls -la /mnt/secrets-store

# Service 확인
kubectl get svc drop-backend-service

# LoadBalancer External IP 확인 (몇 분 소요될 수 있음)
kubectl get svc drop-backend-service -w
```

## 10단계: API 테스트

LoadBalancer의 External IP를 확인한 후:

```bash
EXTERNAL_IP=$(kubectl get svc drop-backend-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Health Check
curl http://${EXTERNAL_IP}/api/actuator/health

# Swagger UI (개발 환경인 경우)
echo "http://${EXTERNAL_IP}/api/swagger-ui.html"
```

## 트러블슈팅

### Pod이 시작되지 않는 경우

```bash
# Pod 상세 정보 확인
kubectl describe pod <POD_NAME>

# 이벤트 확인
kubectl get events --sort-by='.lastTimestamp'

# Secret 마운트 확인
kubectl get secretproviderclasspodstatus
```

### Secret을 읽을 수 없는 경우

1. IAM Role이 제대로 연결되었는지 확인:
```bash
kubectl get sa drop-backend-sa -o yaml
```

2. Secret이 존재하는지 확인:
```bash
aws secretsmanager list-secrets --region ap-northeast-2 | grep drop/backend
```

3. IAM Policy가 제대로 연결되었는지 확인:
```bash
aws iam list-attached-role-policies --role-name <ROLE_NAME>
```

### RDS 연결 실패

1. Security Group 확인
2. RDS 엔드포인트 확인
3. Pod에서 직접 연결 테스트:
```bash
kubectl run -it --rm debug --image=mysql:8 --restart=Never -- mysql -h <RDS_ENDPOINT> -u admin -p
```

## 업데이트 배포

코드를 변경한 후 새 버전 배포:

```bash
# 버전 태그 사용 권장
VERSION="v1.0.1"

./gradlew clean bootJar
docker build -t drop-backend:${VERSION} .
docker tag drop-backend:${VERSION} ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:${VERSION}
docker push ${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:${VERSION}

# deployment.yaml의 이미지 태그를 변경하거나 kubectl set image 사용
kubectl set image deployment/drop-backend drop-backend=${ACCOUNT_ID}.dkr.ecr.ap-northeast-2.amazonaws.com/drop-backend:${VERSION}

# 롤아웃 상태 확인
kubectl rollout status deployment/drop-backend
```

## 리소스 정리

더 이상 사용하지 않을 때:

```bash
# Kubernetes 리소스 삭제
kubectl delete -f deployment.yaml
kubectl delete -f service.yaml
kubectl delete -f secret-provider-class.yaml
kubectl delete -f service-account.yaml

# RDS 삭제
aws rds delete-db-instance --db-instance-identifier drop-mysql --skip-final-snapshot --region ap-northeast-2

# ElastiCache 삭제
aws elasticache delete-cache-cluster --cache-cluster-id drop-redis --region ap-northeast-2

# Secrets Manager secrets 삭제
aws secretsmanager delete-secret --secret-id drop/backend/db-credentials --force-delete-without-recovery --region ap-northeast-2
aws secretsmanager delete-secret --secret-id drop/backend/oauth-credentials --force-delete-without-recovery --region ap-northeast-2
aws secretsmanager delete-secret --secret-id drop/backend/jwt-secret --force-delete-without-recovery --region ap-northeast-2
aws secretsmanager delete-secret --secret-id drop/backend/aes-secret --force-delete-without-recovery --region ap-northeast-2
aws secretsmanager delete-secret --secret-id drop/backend/redis-connection --force-delete-without-recovery --region ap-northeast-2

# ECR 이미지 삭제
aws ecr delete-repository --repository-name drop-backend --force --region ap-northeast-2
```

## 비용 최적화

- **개발 환경**: db.t3.micro, cache.t3.micro 사용 (프리티어 가능)
- **프로덕션 환경**:
  - RDS: db.t3.small 이상, Multi-AZ 활성화
  - ElastiCache: cache.t3.small 이상, Cluster Mode 고려
- 사용하지 않을 때는 리소스 중지 또는 삭제

## 모니터링

CloudWatch Logs와 메트릭을 설정하여 애플리케이션을 모니터링하세요:

```bash
# CloudWatch Container Insights 활성화
aws eks update-cluster-config \
  --region ap-northeast-2 \
  --name backend-api-dev-eks \
  --logging '{"clusterLogging":[{"types":["api","audit","authenticator","controllerManager","scheduler"],"enabled":true}]}'
```

## 참고 자료

- [EKS 공식 문서](https://docs.aws.amazon.com/eks/)
- [Secrets Store CSI Driver](https://secrets-store-csi-driver.sigs.k8s.io/)
- [AWS Secrets Manager Provider](https://github.com/aws/secrets-store-csi-driver-provider-aws)
