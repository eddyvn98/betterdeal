import fs from 'fs';
import path from 'path';

// Đọc API Key từ file .env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKeyMatch = envContent.match(/EXTERNAL_API_KEY=["']?([^"'\s]+)["']?/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : null;

if (!API_KEY) {
  console.error('❌ Không tìm thấy EXTERNAL_API_KEY trong file .env');
  process.exit(1);
}

const API_URL = 'http://localhost:8787/api/v1/external/quote';
const SAMPLES_PATH = path.resolve(process.cwd(), 'automation/samples.json');

async function runTests() {
  const samples = JSON.parse(fs.readFileSync(SAMPLES_PATH, 'utf8'));
  const results = [];

  console.log(`🚀 Bắt đầu Automation Test (${samples.length} kịch bản)...\n`);

  for (const sample of samples) {
    console.log(`[${sample.id}] Đang xử lý: ${sample.type}...`);
    const start = Date.now();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          customerRequest: sample.customerRequest,
          lang: 'vi'
        })
      });

      const data = await response.json();
      const duration = (Date.now() - start) / 1000;

      if (response.ok) {
        console.log(`✅ Thành công (${duration}s)`);
        results.push({
          id: sample.id,
          success: true,
          duration,
          reply: data.data.reply.substring(0, 100) + '...',
          lead: data.data.lead
        });
      } else {
        console.error(`❌ Thất bại: ${data.error}`);
        results.push({ id: sample.id, success: false, error: data.error });
      }
    } catch (error) {
      console.error(`❌ Lỗi kết nối: ${error.message}`);
      results.push({ id: sample.id, success: false, error: error.message });
    }
    
    // Nghỉ 1 giây giữa các request để đảm bảo ổn định
    await new Promise(r => setTimeout(r, 1000));
  }

  // Tổng hợp báo cáo
  const totalTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  const avgTime = results.length > 0 ? (totalTime / results.length).toFixed(2) : 0;
  const successCount = results.filter(r => r.success).length;

  console.log('\n📊 TỔNG KẾT BÁO CÁO:');
  console.log(`- Tổng số test case: ${samples.length}`);
  console.log(`- Thành công: ${successCount}`);
  console.log(`- Thời gian xử lý trung bình: ${avgTime}s`);

  // Lưu báo cáo
  const reportPath = path.resolve(process.cwd(), 'automation/report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: { total: samples.length, success: successCount, avgDuration: avgTime },
    results
  }, null, 2));
  
  console.log(`\n💾 Báo cáo chi tiết đã được lưu tại: ${reportPath}`);
}

runTests();
