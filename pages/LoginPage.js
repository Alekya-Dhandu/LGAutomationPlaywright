const BasePage = require('./BasePage');
const users = require('../data/test-data/users.json');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async open(baseUrl) {
    return this.page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  }

  getCredentials() {
    const defaultUser = Array.isArray(users) && users.length > 0 ? users[0] : {};

    return {
      username: defaultUser.username || process.env.LOGIN_USERNAME || '',
      password: defaultUser.password || process.env.LOGIN_PASSWORD || ''
    };
  }

  subscriberInput() {
    return this.page.locator('#subscriber-number-input');
  }

  activationCodeInput() {
    return this.page.locator('#activation-code-input');
  }

  signInButton() {
    return this.page.locator('#access-code-signIn-redirect');
  }

  body() {
    return this.page.locator('body');
  }

  firstInteractiveElement() {
    return this.page.locator('#subscriber-number-input');
  }

  async enterCredentials({ username, password }) {
    await this.subscriberInput().fill(username);
    await this.activationCodeInput().fill(password);
  }

  async submitLogin() {
    await this.signInButton().click();
  }

  async loginWithSavedCredentials() {
    const credentials = this.getCredentials();
    await this.enterCredentials(credentials);
    await this.submitLogin();
  }

  async login(username, password) {
    await this.enterCredentials({ username, password });
    await this.submitLogin();
  }
}

module.exports = LoginPage;
