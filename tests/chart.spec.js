import { test, expect } from '@playwright/test';

test('has chart rendered on load', async ({ page }) => {
  // Go to the main page
  await page.goto('/');

  // Check that the title or header exists
  await expect(page.locator('text=Stock in Ounces').first()).toBeVisible();

  // Wait for the chart to render. 
  // It renders inside a `.recharts-wrapper` container once the data is loaded.
  const chartWrapper = page.locator('.recharts-wrapper');
  
  // Wait for the chart to be visible on screen
  await expect(chartWrapper).toBeVisible({ timeout: 10000 });

  // Verify that an SVG is present inside the chart, indicating plotting has occurred
  const svgChart = chartWrapper.locator('svg').first();
  await expect(svgChart).toBeVisible();
});
