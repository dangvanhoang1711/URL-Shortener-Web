const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy shortCode từ command line argument
const shortCode = process.argv[2];
const clickCount = parseInt(process.argv[3]) || 100;

if (!shortCode) {
  console.log('❌ Usage: node seed-single-url.js <shortCode> [clickCount]');
  console.log('   Example: node seed-single-url.js abc123X 150');
  process.exit(1);
}

// Danh sách IP addresses
const fakeIPs = [
  '203.113.45.12',   // Vietnam
  '8.8.8.8',         // USA
  '1.1.1.1',         // USA
  '103.21.244.0',    // Singapore
  '202.12.94.33',    // Japan
  '180.149.132.47',  // China
  '46.101.163.119',  // Germany
  '185.220.101.1',   // UK
  '13.107.42.14',    // USA
  '151.101.1.140',   // USA
];

// Danh sách User Agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

async function seedSingleUrl() {
  console.log(`🌱 Seeding stats for: ${shortCode}\n`);

  try {
    // Tìm URL
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      console.log(`❌ URL with shortCode "${shortCode}" not found`);
      process.exit(1);
    }

    console.log(`📊 Found URL: ${url.originalUrl}`);
    console.log(`🔗 Creating ${clickCount} clicks...\n`);

    // Tạo clicks
    const clicks = [];
    for (let i = 0; i < clickCount; i++) {
      const daysAgo = Math.floor(Math.random() * 7); // Clicks trong 7 ngày qua
      clicks.push({
        urlId: url.id,
        ipAddress: randomElement(fakeIPs),
        userAgent: randomElement(userAgents),
        clickedAt: randomDate(daysAgo),
      });
    }

    // Bulk insert
    await prisma.click.createMany({
      data: clicks,
    });

    // Update clickCount
    await prisma.url.update({
      where: { id: url.id },
      data: {
        clickCount: { increment: clickCount },
        lastClickedAt: new Date(),
      },
    });

    console.log(`✅ Successfully created ${clickCount} clicks`);
    console.log(`\n💡 View stats at: http://localhost:3000/stats/${shortCode}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSingleUrl().catch((error) => {
  console.error(error);
  process.exit(1);
});
