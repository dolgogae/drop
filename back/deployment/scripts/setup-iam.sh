#!/bin/bash

set -e

ACCOUNT_ID="441070253196"
CLUSTER_NAME="backend-api-dev-eks"
REGION="ap-northeast-2"

echo "================================"
echo "IAM Role 및 ServiceAccount 설정"
echo "================================"
echo ""

# 1. OIDC Provider 확인 및 연결
echo "1. OIDC Provider 연결 확인..."
eksctl utils associate-iam-oidc-provider \
  --cluster $CLUSTER_NAME \
  --region $REGION \
  --approve

echo "✓ OIDC Provider 연결 완료"
echo ""

# 2. IAM 정책 생성
echo "2. IAM 정책 생성..."

# 정책이 이미 있는지 확인
if aws iam get-policy --policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/DropBackendSecretsPolicy 2>/dev/null; then
  echo "✓ 정책이 이미 존재합니다: DropBackendSecretsPolicy"
else
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
        "arn:aws:secretsmanager:${REGION}:${ACCOUNT_ID}:secret:drop/backend/*"
      ]
    }
  ]
}
EOF

  aws iam create-policy \
    --policy-name DropBackendSecretsPolicy \
    --policy-document file:///tmp/drop-secrets-policy.json \
    --description "Policy for Drop backend to access Secrets Manager"

  echo "✓ 정책 생성 완료: DropBackendSecretsPolicy"
  rm /tmp/drop-secrets-policy.json
fi

echo ""

# 3. ServiceAccount와 IAM Role 생성
echo "3. ServiceAccount와 IAM Role 생성..."

eksctl create iamserviceaccount \
  --name drop-backend-sa \
  --namespace default \
  --cluster $CLUSTER_NAME \
  --region $REGION \
  --attach-policy-arn arn:aws:iam::${ACCOUNT_ID}:policy/DropBackendSecretsPolicy \
  --approve \
  --override-existing-serviceaccounts

echo "✓ ServiceAccount와 IAM Role 생성 완료"
echo ""

# 4. 확인
echo "================================"
echo "설정 완료! 확인 중..."
echo "================================"
echo ""

# ServiceAccount 확인
echo "ServiceAccount 정보:"
kubectl get sa drop-backend-sa -o yaml | grep -A 2 "annotations:"

echo ""
echo "IAM Role 정책 확인:"
ROLE_NAME=$(kubectl get sa drop-backend-sa -o jsonpath='{.metadata.annotations.eks\.amazonaws\.com/role-arn}' | cut -d'/' -f2)
aws iam list-attached-role-policies --role-name $ROLE_NAME

echo ""
echo "✓ 모든 설정이 완료되었습니다!"
