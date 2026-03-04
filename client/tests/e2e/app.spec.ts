import { test, expect, Page } from '@playwright/test';

/*
 * Helper — log in and return the dashboard page.
 * Seed accounts (password: seed1223):
 *   Author  – prof.vondrak@university.edu
 *   Solver  – tai.huy@student.edu
 */

async function login(page: Page, email: string, password = 'seed1223') {
  await page.goto('/login');
  await page.getByRole('textbox', { name: /email/i }).fill(email);
  await page.getByRole('textbox', { name: /password/i }).fill(password);
  await page.getByRole('button', { name: /sign in|log in|login/i }).click();
}

// ─── Authentication ─────────────────────────────────────────

test.describe('Authentication', () => {
  test('shows login page by default', async ({ page }) => {
    await page.goto('/');
    // should redirect to /login
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole('heading', { name: /task manager/i })).toBeVisible();
    await expect(page.getByText('Sign in to continue')).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await login(page, 'wrong@email.com', 'badpassword');
    // should stay on login and show an error
    await expect(page).toHaveURL(/login/);
  });

  test('author can log in and see dashboard', async ({ page }) => {
    await login(page, 'prof.vondrak@university.edu');
    await expect(page).toHaveURL(/author/);
    await expect(page.getByText(/task management/i)).toBeVisible();
  });

  test('solver can log in and see dashboard', async ({ page }) => {
    await login(page, 'tai.huy@student.edu');
    await expect(page).toHaveURL(/solver/);
    await expect(page.getByText(/my tasks/i)).toBeVisible();
  });

  test('logout returns to login page', async ({ page }) => {
    await login(page, 'prof.vondrak@university.edu');
    await expect(page).toHaveURL(/author/);
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});

// ─── Author dashboard ───────────────────────────────────────

test.describe('Author — Task CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'prof.vondrak@university.edu');
    await expect(page).toHaveURL(/author/);
  });

  test('can open and close the creation form', async ({ page }) => {
    // click "+ New Task" in the toolbar to open the form
    await page.locator('.toolbar button').first().click();
    // creation panel should appear
    await expect(page.getByRole('heading', { name: 'Create New Task' })).toBeVisible();
    // the toolbar button now says "Cancel" — click it to close
    await page.locator('.toolbar button').first().click();
    // creation heading should disappear
    await expect(page.getByRole('heading', { name: 'Create New Task' })).not.toBeVisible();
  });

  test('can create a new task', async ({ page }) => {
    await page.getByRole('button', { name: /new task/i }).click();
    await expect(page.getByRole('heading', { name: 'Create New Task' })).toBeVisible();

    const taskTitle = `E2E Test ${Date.now()}`;
    await page.locator('#title').fill(taskTitle);
    await page.locator('#desc').fill('Automated test description');

    // wait for solvers to load in the dropdown, then pick the first real option
    const solverSelect = page.locator('#solver');
    await expect(solverSelect.locator('option')).not.toHaveCount(1, { timeout: 5000 });
    await solverSelect.selectOption({ index: 1 });

    // submit
    await page.getByRole('button', { name: 'Create Task' }).click();

    // the new task should appear in the table after reload
    await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 });
  });

  test('can select a task and see detail panel', async ({ page }) => {
    // wait for table to render
    await page.locator('.task-table').waitFor({ state: 'visible', timeout: 5000 });

    // skip if there are no real data rows (only empty-row)
    const dataRows = page.locator('.task-table tbody tr:not(.empty-row)');
    const rowCount = await dataRows.count();
    if (rowCount === 0) {
      test.skip();
      return;
    }

    await dataRows.first().click();

    // the detail panel should open with lifecycle stepper
    await expect(page.locator('.detail-panel')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('.lifecycle-stepper')).toBeVisible();
  });

  test('can filter tasks by status', async ({ page }) => {
    const filterSelect = page.locator('.toolbar select');
    await filterSelect.selectOption('PENDING');
    // wait for table update
    await page.waitForTimeout(500);
    // all visible status pills should say "Pending"
    const pills = page.locator('.status-pill');
    const pillCount = await pills.count();
    for (let i = 0; i < pillCount; i++) {
      await expect(pills.nth(i)).toHaveText('Pending');
    }
  });
});

// ─── Solver dashboard ───────────────────────────────────────

test.describe('Solver — Task Actions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'tai.huy@student.edu');
    await expect(page).toHaveURL(/solver/);
  });

  test('shows assigned tasks in table', async ({ page }) => {
    const table = page.locator('.task-table');
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('can select a task and see detail panel with lifecycle', async ({ page }) => {
    const row = page.locator('.task-table tbody tr').first();
    const rowCount = await row.count();
    if (rowCount === 0) {
      test.skip(); // no tasks assigned
      return;
    }
    await row.click();
    await expect(page.locator('.detail-panel')).toBeVisible();
    await expect(page.locator('.lifecycle-stepper')).toBeVisible();
  });
});

// ─── Notifications ──────────────────────────────────────────

test.describe('Notifications', () => {
  test('notification bell is visible for author', async ({ page }) => {
    await login(page, 'prof.vondrak@university.edu');
    await expect(page.getByText('🔔')).toBeVisible();
  });

  test('notification bell is visible for solver', async ({ page }) => {
    await login(page, 'tai.huy@student.edu');
    await expect(page.getByText('🔔')).toBeVisible();
  });
});

// ─── Responsive layout ─────────────────────────────────────

test.describe('Responsive Design', () => {
  test('dashboard adapts to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await login(page, 'prof.vondrak@university.edu');
    await expect(page).toHaveURL(/author/);
    // page should still render without horizontal overflow
    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(768);
  });

  test('dashboard adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page, 'prof.vondrak@university.edu');
    await expect(page).toHaveURL(/author/);
    const body = page.locator('body');
    const box = await body.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(375);
  });
});
