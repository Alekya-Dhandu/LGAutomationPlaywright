const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = '//*[@id="subscriber-number-input"]';
    this.passwordInput = '//*[@id="activation-code-input"]';
    this.loginButton = '//*[@id="access-code-signIn-redirect"]';
  }
  


  async login(username, password) {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }
}

module.exports = LoginPage;
