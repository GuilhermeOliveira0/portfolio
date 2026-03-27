import { expect, test } from '@playwright/test';

test('home should render projects loaded from projects.json', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-a11y-action="decrease-font"]')).toHaveCount(0);
  await expect(page.locator('[data-a11y-action="reset-font"]')).toHaveCount(0);
  await expect(page.locator('[data-a11y-action="increase-font"]')).toHaveCount(0);

  const cards = page.locator('#projects-track .project-card');
  const firstCard = cards.first();
  await expect(firstCard).toBeVisible({ timeout: 15000 });
  await firstCard.scrollIntoViewIfNeeded();

  await firstCard.locator('.project-details-btn').evaluate((button) => button.click());
  await expect(page.locator('#project-modal')).toHaveClass(/is-open/);

  await page.locator('.project-modal-close').click();
  await expect(page.locator('#project-modal')).not.toHaveClass(/is-open/);
});

test('grade page should load at least one disciplina card', async ({ page }) => {
  await page.goto('/grade.html');

  await expect(page.locator('[data-a11y-action="decrease-font"]')).toHaveCount(0);
  await expect(page.locator('[data-a11y-action="reset-font"]')).toHaveCount(0);
  await expect(page.locator('[data-a11y-action="increase-font"]')).toHaveCount(0);
  await expect(page.locator('#disciplinas-grid .grade-card').first()).toBeVisible({ timeout: 15000 });
});
