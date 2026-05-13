const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Danh sách IP addresses giả lập từ các quốc gia khác nhau
const fakeIPs = [
  '203.113.45.12',   // Vietnam
  '8.8.8.8',         // USA (Google DNS)
  '1.1.1.1',         // USA (Cloudflare)
  '103.21.244.0',    // Singapore
  '202.12.94.33',    // Japan
  '180.149.132.47',  // China
  '46.101.163.119',  // Germany
  '185.220.101.1',   // UK
  '13.107.42.14',    // USA (Microsoft)
  '151.101.1.140',   // USA (Fastly)
  '104.16.132.229',  // USA (Cloudflare)
  '172.217.14.206',  // USA (Google)
  '52.84.150.25',    // USA (AWS)
  '13.225.78.0',     // USA (CloudFront)
  '192.168.1.100',   // Local network
  '10.0.0.50',       // Private network
];

// Danh sách User Agents thực tế
const userAgents = [
  // Chrome on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Chrome on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Firefox on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Safari on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  // Edge on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  // Chrome on Android
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  // Safari on iPhone
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  // Chrome on Linux
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  // Firefox on Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  // Opera on Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
  // Samsung Internet on Android
  'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
  // Chrome on iPad
  'Mozilla/5.0 (iPad; CPU OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
];

// Hàm random
function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Hàm tạo timestamp trong khoảng thời gian
function randomDate(daysAgo) {
  const now = new Date();
  const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = past.getTime() + Math.random() * (now.getTime() - past.getTime());
  return new Date(randomTime);
}

async function seedStats() {
  console.log('🌱 Starting to seed stats data...\n');

  try {
    // Lấy tất cả URLs trong database
    const urls = await prisma.url.findMany({
      select: {
        id: true,
        shortCode: true,
        originalUrl: true,
      },
    });

    if (urls.length === 0) {
      console.log('❌ No URLs found in database. Please create some short URLs first.');
      return;
    }

    console.log(`📊 Found ${urls.length} URL(s) in database\n`);

    // Seed clicks cho mỗi URL
    for (const url of urls) {
      const clickCount = randomInt(50, 200); // Mỗi URL có 50-200 clicks
      console.log(`🔗 Seeding ${clickCount} clicks for: ${url.shortCode}`);

      const clicks = [];
      for (let i = 0; i < clickCount; i++) {
        const daysAgo = randomInt(0, 30); // Clicks trong 30 ngày qua
        clicks.push({
          urlId: url.id,
          ipAddress: randomElement(fakeIPs),
          userAgent: randomElement(userAgents),
          clickedAt: randomDate(daysAgo),
        });
      }

      // Bulk insert clicks
      await prisma.click.createMany({
        data: clicks,
      });

      // Update clickCount
      await prisma.url.update({
        where: { id: url.id },
        data: {
          clickCount: clickCount,
          lastClickedAt: new Date(),
        },
      });

      console.log(`   ✅ Created ${clickCount} clicks`);
    }

    console.log('\n🎉 Stats seeding completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   - URLs seeded: ${urls.length}`);
    console.log(`   - Total clicks created: ${urls.length * 125} (average)`);
    console.log(`   - IP addresses used: ${fakeIPs.length}`);
    console.log(`   - User agents used: ${userAgents.length}`);
    console.log('\n💡 You can now view stats at: http://localhost:3000/stats/{shortCode}');

  } catch (error) {
    console.error('❌ Error seeding stats:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedStats()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
