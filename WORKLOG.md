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
npx create-next-app --ts frontend
# ESLint: Yes
# Tailwind CSS: No
# "src/" directory: No
# App Router: Yes
# default import alias: No

cd frontend
# バージョン固定で再インストール（本のサンプルコードをそのまま動かすため）
npm install --save-exact next@13.4.13 bufferutil@4.0.8 utf-8-validate@6.0.3
rm -rf node_modules/
rm package-lock.json
npm install # これで依存関係が解消できるらしい

npm install @tabler/icons-react@2.32.0 @mantine/core@7.0.0 @mantine/hooks@7.0.0

npm install --save-dev postcss@8.4.29 postcss-preset-mantine@1.7.0 postcss-simple-vars@7.0.1

touch postcss.config.js
# postcss.config.js を編集

npm install ethers@6.7.0

```
