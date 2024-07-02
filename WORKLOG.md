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

## 4. NFT の作成

```bash
touch contracts/MyERC721.sol

# contracts/MyERC721.sol を編集

npx hardhat compile

touch test/MyERC721.ts

# test/MyERC721.ts を編集

npx hardhat test

# scripts/deploy-local.ts を編集

npx hardhat node

# 別ターミナルで
npx hardhat run --network localhost scripts/deploy-local.ts
# output
# MyToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
# MyERC20 deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
# MyERC721 deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
```

## 5. NFT マーケットプレイス開発

- アプリケーションメニューの作成
- ページ遷移のためのナビゲーションメニューの作成
- Metamask Wallet に接続するボタンの準備

```bash
cd frontend/

mkdir context
touch context/web3.context.tsx

# context/web3.context.tsx を編集

mkdir -p components/common/
touch components/common/NavbarLinks.tsx
touch components/common/AppMenu.tsx

# components/common/NavbarLinks.tsx と components/common/AppMenu.tsx を編集

# app/layout.tsx の編集

npm run dev

# localhost:3000 をブラウザで開いて接続確認

# artifacts/contracts の全てのフォルダを frontend/abi 以下にコピー
# (solidity ファイルを編集した場合は、コンパイルして再度コピーする必要あり)

mkdir app/mynft/
touch app/mynft/page.tsx

# app/mynft/page.tsx を編集

# components/common/NavbarLinks.tsx を編集

npm run dev

# localhost:3000/mynft にアクセス。
# "Mint NFT" ボタンで NFT を作成。
#
# 残り（p.172-208）をいったん飛ばして先にDAOをやる
#
#
```

## 6. DAO 開発入門

- DAO の概要
- DAO の設計原則
- DAO の技術要素
- DAO に関する規格・標準実装
- ガバナンストークンと投票機能

## 7. DAO システム開発

-

```bash
# contracts/MyERC20.sol を編集

touch contracts/MyTimelockController.sol
# contracts/MyTimelockController.sol を編集

touch contracts/MyGovernor.sol
# contracts/MyGovernor.sol を編集

# hardhat.config.ts に optimizer の設定を追加

npx hardhat compile

# test/MyGovernor.ts を編集

npx hardhat test

# 下記エラーが出て動かない
# NotImplementedError: Method 'HardhatEthersProvider.resolveName' is not implemented

```
