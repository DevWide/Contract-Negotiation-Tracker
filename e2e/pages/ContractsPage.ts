import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ContractData {
  name: string;
  counterparty?: string;
  description?: string;
  paperSource?: 'our' | 'counterparty';
}

export class ContractsPage extends BasePage {
  readonly ballInCourtSwitch: Locator;

  constructor(page: Page) {
    super(page);
    this.ballInCourtSwitch = page.getByRole('button', { name: 'Switch' });
  }

  async openContractDropdown() {
    // First button inside header is the contract dropdown
    await this.page.locator('header button').first().click();
    await this.page.waitForTimeout(300);
  }

  async clickNewContract() {
    await this.openContractDropdown();
    await this.page.getByRole('menuitem', { name: 'New Contract' }).click();
    await this.page.waitForTimeout(500);
  }

  async createContract(data: ContractData) {
    await this.clickNewContract();

    await this.page.getByPlaceholder('e.g., Acme Corp Software License').fill(data.name);

    if (data.counterparty) {
      await this.page.getByPlaceholder('e.g., Acme Corporation').fill(data.counterparty);
    }

    if (data.description) {
      await this.page.getByPlaceholder('Brief description of the contract...').fill(data.description);
    }

    if (data.paperSource === 'counterparty') {
      await this.page.getByText('Their Paper').click();
    }

    await this.page.getByRole('button', { name: 'Create Contract' }).click();
    await this.page.waitForTimeout(500);
  }

  async switchBallInCourt() {
    await this.ballInCourtSwitch.click();
    await this.page.waitForTimeout(300);
  }

  async switchToContract(name: string) {
    await this.openContractDropdown();
    await this.page.getByRole('menuitem', { name }).click();
    await this.page.waitForTimeout(400);
  }

  async getStoredContracts() {
    const raw = await this.page.evaluate(() =>
      localStorage.getItem('negotiation-tracker-contracts')
    );
    return raw ? JSON.parse(raw) : [];
  }
}