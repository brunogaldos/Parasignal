# ParaAgent Telegram Bot

## Overview
ParaAgent is a Telegram bot that enables users to:

- Create a pre-generated Para wallet using the `/setuptrade <email>` command.
- Send POL tokens to a specified wallet using the `/sendPol <wallet_address> <pol_amount>` command.

### Project Structure
This project consists of two main components:

- **bot/** - Contains the Telegram bot logic.
- **examples-hub/** - Spins up a server to interact with Para APIs for wallet creation and transaction handling.

---

## Installation & Setup
### 1. Setting Up `examples-hub/`

1. Navigate to the `examples-hub/` folder:
   ```sh
   cd examples-hub
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```
3. Rename `.env.example` to `.env`:
   ```sh
   mv .env.example .env
   ```
4. Open `.env` and enter your credentials:
   - Para API Key
   - Encryption Key (generated using OpenSSL or another tool)
5. Start the server:
   ```sh
   yarn dev
   ```
   The server will now listen on `localhost:3000`.

### 2. Setting Up `bot/`

1. Navigate to the `bot/` folder:
   ```sh
   cd bot
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Rename `.env.example` to `.env`:
   ```sh
   mv .env.example .env
   ```
4. Open `.env` and enter your **Telegram Bot Token**.
5. Start the bot:
   ```sh
   node bot
   ```

---

## Usage
### 1. Create a Para Wallet
```sh
/setuptrade <email>
```
This command generates a wallet for the given email.

### 2. Send POL Tokens
```sh
/sendPol <wallet_address> <pol_amount>
```
This command sends the specified amount of POL tokens to the given wallet.

---

## Technologies Used
- **Node.js / Telegraf** - Telegram Bot & API interactions
- **Yarn / NPM** - Package management
- **Express.js** - API server in `examples-hub/`
- **Para API** - For wallet creation and transactions
- **OpenSSL** - For encryption key generation

---

## Contributing
1. Fork the repository.
2. Create a feature branch:
   ```sh
   git checkout -b feature-branch
   ```
3. Commit changes:
   ```sh
   git commit -m "Add new feature"
   ```
4. Push to the branch:
   ```sh
   git push origin feature-branch
   ```
5. Open a pull request.

---

## License
This project is licensed under the **MIT License**.

---

## Contact
For any questions or support, feel free to reach out!

🚀 **Happy coding!**


