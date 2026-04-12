import { chromium } from 'playwright';

export interface BrowsingResult {
  title: string;
  description: string;
  text: string;
  screenshot?: string; // Base64
}

/**
 * Sử dụng Playwright để đọc nội dung website và chụp ảnh
 */
export async function advancedBrowse(url: string): Promise<BrowsingResult> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Đợi thêm một chút để các animation hoặc lazy load hiển thị
    await page.waitForTimeout(2000);
    
    const title = await page.title();
    const description = await page.$eval('meta[name="description"]', el => (el as HTMLMetaElement).content).catch(() => '');
    
    // Lấy text sạch
    const text = await page.evaluate(() => {
      // Xóa các tag không cần thiết trước khi lấy text
      const noise = document.querySelectorAll('script, style, svg, nav, footer, iframe, noscript');
      noise.forEach(el => el.remove());
      return document.body.innerText;
    });
    
    // Chụp ảnh màn hình (chỉ vùng viewport để tiết kiệm dung lượng gửi cho AI)
    const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 70 });
    const screenshot = screenshotBuffer.toString('base64');
    
    return {
      title,
      description,
      text: text.substring(0, 5000), // Giới hạn token
      screenshot
    };
  } finally {
    await browser.close();
  }
}
