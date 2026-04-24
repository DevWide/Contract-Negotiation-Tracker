import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = '/') {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async clearAndReload() {
    await this.page.evaluate(() => {
      const keys = [
        'negotiation-tracker-contracts',
        'negotiation-tracker-templates',
        'negotiation-tracker-playbook',
        'negotiation-tracker-columns',
        'negotiation-tracker-impact-categories',
      ];
      keys.forEach(key => localStorage.removeItem(key));
    });
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async reload() {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  async pressCtrlN() {
    await this.page.keyboard.press('Control+n');
  }
}