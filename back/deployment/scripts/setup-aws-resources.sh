#!/bin/bash

# AWS Region 설정
REGION="ap-northeast-2"
EKS_CLUSTER_NAME="backend-api-dev-eks"

echo "================================"
echo "AWS RDS 및 ElastiCache 생성 가이드"
echo "================================"
echo ""

# 1. VPC 및 Subnet 정보 가져오기
echo "1. EKS 클러스터의 VPC 정보 가져오기..."
VPC_ID=$(aws eks describe-cluster --name $EKS_CLUSTER_NAME --region $REGION --query 'cluster.resourcesVpcConfig.vpcId' --output text)
SUBNET_IDS=$(aws eks describe-cluster --name $EKS_CLUSTER_NAME --region $REGION --query 'cluster.resourcesVpcConfig.subnetIds' --output text)

echo "VPC ID: $VPC_ID"
echo "Subnet IDs: $SUBNET_IDS"
echo ""

# 2. Security Group 생성 (RDS용)
echo "2. RDS용 Security Group 생성..."
RDS_SG_ID=$(aws ec2 create-security-group \
  --group-name drop-rds-sg \
  --description "Security group for Drop RDS MySQL" \
  --vpc-id $VPC_ID \
  --region $REGION \
  --query 'GroupId' \
  --output text)

# EKS 클러스터의 Security Group ID 가져오기
EKS_SG_ID=$(aws eks describe-cluster --name $EKS_CLUSTER_NAME --region $REGION --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId' --output text)

# RDS Security Group에 EKS에서의 접근 허용
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 3306 \
  --source-group $EKS_SG_ID \
  --region $REGION

echo "RDS Security Group ID: $RDS_SG_ID"
echo ""

# 3. Security Group 생성 (ElastiCache용)
echo "3. ElastiCache용 Security Group 생성..."
REDIS_SG_ID=$(aws ec2 create-security-group \
  --group-name drop-redis-sg \
  --description "Security group for Drop ElastiCache Redis" \
  --vpc-id $VPC_ID \
  --region $REGION \
  --query 'GroupId' \
  --output text)

# Redis Security Group에 EKS에서의 접근 허용
aws ec2 authorize-security-group-ingress \
  --group-id $REDIS_SG_ID \
  --protocol tcp \
  --port 6379 \
  --source-group $EKS_SG_ID \
  --region $REGION

echo "Redis Security Group ID: $REDIS_SG_ID"
echo ""

# 4. DB Subnet Group 생성
echo "4. RDS DB Subnet Group 생성..."
SUBNET_ARRAY=($SUBNET_IDS)
aws rds create-db-subnet-group \
  --db-subnet-group-name drop-db-subnet-group \
  --db-subnet-group-description "Subnet group for Drop RDS" \
  --subnet-ids ${SUBNET_ARRAY[@]} \
  --region $REGION

echo ""

# 5. RDS 생성
echo "5. RDS MySQL 인스턴스 생성 중..."
echo "   (약 10-15분 소요됩니다)"
aws rds create-db-instance \
  --db-instance-identifier drop-mysql \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.40 \
  --master-username admin \
  --master-user-password 'YourStrongPassword123!' \
  --allocated-storage 20 \
  --vpc-security-group-ids $RDS_SG_ID \
  --db-subnet-group-name drop-db-subnet-group \
  --backup-retention-period 0 \
  --no-multi-az \
  --publicly-accessible \
  --region $REGION

echo ""

# 6. ElastiCache Subnet Group 생성
echo "6. ElastiCache Subnet Group 생성..."
SUBNET_LIST=$(echo $SUBNET_IDS | sed 's/ / /g')
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name drop-redis-subnet-group \
  --cache-subnet-group-description "Subnet group for Drop Redis" \
  --subnet-ids $SUBNET_ARRAY \
  --region $REGION

echo ""

# 7. ElastiCache Redis 생성
echo "7. ElastiCache Redis 클러스터 생성 중..."
echo "   (약 10-15분 소요됩니다)"
aws elasticache create-cache-cluster \
  --cache-cluster-id drop-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1 \
  --cache-subnet-group-name drop-redis-subnet-group \
  --security-group-ids $REDIS_SG_ID \
  --region $REGION

echo ""
echo "================================"
echo "생성 완료 대기 중..."
echo "================================"

# RDS 엔드포인트 대기 및 출력
echo ""
echo "RDS 인스턴스가 준비될 때까지 대기 중..."
aws rds wait db-instance-available --db-instance-identifier drop-mysql --region $REGION

RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier drop-mysql \
  --region $REGION \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "✓ RDS MySQL Endpoint: $RDS_ENDPOINT"

# ElastiCache 엔드포인트 대기 및 출력
echo ""
echo "ElastiCache 클러스터가 준비될 때까지 대기 중..."
aws elasticache wait cache-cluster-available --cache-cluster-id drop-redis --region $REGION

REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id drop-redis \
  --show-cache-node-info \
  --region $REGION \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' \
  --output text)

echo "✓ ElastiCache Redis Endpoint: $REDIS_ENDPOINT"

echo ""
echo "================================"
echo "모든 리소스 생성 완료!"
echo "================================"
echo ""
echo "다음 명령어로 Secrets Manager의 값을 업데이트하세요:"
echo ""
echo "aws secretsmanager update-secret \\"
echo "  --secret-id drop/backend/db-credentials \\"
echo "  --secret-string '{\"username\":\"admin\",\"password\":\"YourStrongPassword123!\",\"host\":\"$RDS_ENDPOINT\",\"port\":\"3306\",\"database\":\"drop\"}' \\"
echo "  --region $REGION"
echo ""
echo "aws secretsmanager update-secret \\"
echo "  --secret-id drop/backend/redis-connection \\"
echo "  --secret-string '{\"host\":\"$REDIS_ENDPOINT\",\"port\":\"6379\"}' \\"
echo "  --region $REGION"
echo ""
