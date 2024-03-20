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

# GitHub でソースコード管理（Repository は UI 上で作成する必要あり）
git init
git remote add origin git@github.com:akmrbaby/blockchainApp.git
git branch -M main
git push -u origin main
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
# output
# MyToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

これでスマートコントラクトのデプロイまでの一連の流れが完了。

## 2. フロントエンドの作成

- Web フレームワーク：Next.js
- UI ライブラリ：Mantine

### Next.js の起動まで

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

npm run dev # localhost:3000 で Next の起動を確認
```

### フロントエンドの画面の編集

```bash
truncate -s 0 -c ./app/globals.css # frontend/app/global.css のファイルの中身を削除する（ファイル自体は削除しない）

# frontend/tsconfig.json の "module" および "moduleResolution" の値を "node16" に変更

# frontend/app/page.tsx の中身を編集

mkdir abi

# frontend/abi 配下に、contracts/MyToken.sol/MyToken.json をコピー

npm run dev

# Hardhat の秘密鍵を読み込んだ Metamask アカウントを接続して、"Tokens owned" ボタンを押下。
# トークン残高が表示されていれば OK。
```

## 3. OpenZeppelin による開発

```bash
# ディレクトリを blockchainApp まで戻る
cd contracts
touch MyERC20.sol

# MyERC20.sol を編集

cd ..
npx hardhat compile

# scripts/deploy-local.ts にトークン名を MyToken から MyERC20 に変更したものを追加

npx hardhat run --network localhost scripts/deploy-local.ts
# output
# MyToken deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
# MyERC20 deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

touch test/MyERC20.ts

# test/MyERC20.ts を編集

npx hardhat test
```
