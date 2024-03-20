# 作業ログ

npm のバージョンは、18.10.0 を利用（n コマンドで管理）

## 0. 環境構築

```bash
mkdir blockchainApp
cd blockchainApp

npm init -y

npm install --save-dev hardhat@2.18.2
npm install --save-dev @nomicfoundation/hardhat-toolbox@3.0.0

npx hardhat init
# Create at TypeScript project を選択。それ以降はデフォルトでOK。

npm install @openzeppelin/contracts@4.9.3

git init
```

## 1. チュートリアル

### サンプルトークンの作成

```bash
rm contracts/Lock.sol
touch contracts/MyToken.sol
# 参考：p.97
# 参考：https://hardhat.org/tutorial/writing-and-compiling-contracts

npx hardhat compile
```

### テストコードの作成

```bash
rm test/Lock.ts # 勝手に作られる Lock.ts は削除
touch test/MyTokens.ts

# test/MyTokens.ts を編集

npx hardhat test
```

### Hardhat ネットワークへのデプロイ

```bash
rm scripts/deploy.ts
touch scripts/deploy-local.ts

# scripts/deploy-local.ts を編集

npx hardhat node

# 別ターミナルを起動

npx hardhat run --network localhost scripts/deploy-local.ts
# これでスマートコントラクトのデプロイまでの一連の流れが完了。
```

## 2. フロントエンドの作成

Web フレームワーク：Next.js
UI ライブラリ：Mantine

```bash


```
