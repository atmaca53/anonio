# Anonio | ANON Wallet

ANONIO is a privacy first wallet.

It is a Sprout/Sapling-enabled, shielded-address-first ANON cryptocurrency wallet for Mac, Windows and Linux. It is built-in full node 
usable on `mainnet` and `testnet`, and currently features `dark` and `light` themes.

![Build Status](https://app.bitrise.io/app/a5bc7a8391d5501b/status.svg?token=SOuGNc3Qf9rCj3Osl-eHyQ&branch=master)
![Flow Coverage](./public/flow-coverage-badge.svg)

## WARNING: Be careful when using this software! It is highly experimental. Always have your private keys saved securely. We STRONGLY recommend testing the wallet out on the testnet before using it for live transactions to familiarize yourself with its operation.

### Always test with small amounts first! It is your responsibility to properly handle your private keys.

### For best security, it is recommended to build the entire ANONIO wallet by yourself, directly from GitHub.

### Encryption: Wallet encryption is currently disabled by anond. You should use full-disk encryption (or encryption of your home directory) to protect your wallet.dat file, and should assume that even unprivileged users who are running on your O/S can read your wallet.dat file.

### [Latest Documentation](https://anoncrypto.io/anonio-wallet/)

### [Latest Release](https://github.com/anonymousbitcoin/anonio/releases)

## Stack Information

List of the main open source libraries and technologies used in building **Anonio**:

- [Zepio](https://github.com/ZcashFoundation/zepio): Zepio / ZEC wallet
- [anond](https://github.com/anon/anon): Anon node daemon
- [Electron](https://github.com/electron/electron): Desktop application builder
- [React](https://facebook.github.io/react/): User interface view layer
- [Redux](https://redux.js.org/): Predictable application state container
- [Styled Components](https://www.styled-components.com/): Visual primitives for theming and styling applications
- [webpack](https://webpack.github.io/): Application module bundler (and more)
- [Babel](https://babeljs.io/): ES7/JSX transpilling
- [ESLint](https://eslint.org/): Code linting rules
- [Flow](https://flow.org): JavaScript static type checker
- [Docz](https://docz.site): Documentation builder
- [BigNumber.js](https://github.com/MikeMcl/bignumber.js#readme): Arbitrary-precision decimal and non-decimal arithmetic with safety

## Installing and Running From Source

To run **Anonio** from source you'll need to perform the following steps:
```bash
# Ensure you have Node LTS v8+
# https://nodejs.org/en/

# Clone Codebase
git clone git@github.com:anonymousbitcoin/anonio.git

# Install Dependencies
# inside of the `anonio` folder
yarn install
# or
npm install

# Start Application
# webpack development server hosts the application on port
# 8080 and launches the Electron wrapper, which also hosts
# the `anond` node daemon process.
yarn start
# or
npm start
```

## Building Application Locally

To build the application locally follow the instructions below:
```bash
# Make sure you are inside of the main `anonio` folder

# Run Build Script
yarn electron:distall

# Executables and binaries available under `/dist` folder
```

## Flow Coverage (Static Type Checker)

For a deeper look on the static typing coverage of the application, please follow below:
```bash
# Make sure you are inside of the main `anonio` folder

# Generate Flow Coverage Report
# this can take a couple seconds
yarn flow:report

# Browser should open with the file `index.html` opened
# Files are also available at `anonio/flow-coverage/source`
```

## Tests

To run the application's tests, please run the below:
```bash
# Make sure you are inside of the main `anonio` folder

# For Unit Tests: Run Jest Unit Test Suite
yarn test:unit

# For E2E (end-to-end) Tests: Run Jest E2E Suite
yarn e2e:serve
# on another terminal window
yarn test e2e
```

## License

Originally forked from the [Zepio wallet, by Zcash Foundation](https://github.com/ZcashFoundation/zepio)

This program is distributed under an [MIT License](https://github.com/anonymousbitcoin/anonio/blob/master/LICENSE.md)

Copyright (c) 2019 Zcash Foundation [zfnd.org](https://www.zfnd.org/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

## Disclaimer
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
