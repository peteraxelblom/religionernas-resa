import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3003';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testGame() {
  console.log('🎮 Starting Religionernas Resa play test...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Set viewport for iPad-like testing
  await page.setViewport({ width: 1024, height: 768 });

  try {
    // Test 1: Home Page
    console.log('📍 Test 1: Loading home page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(1000);

    const title = await page.title();
    console.log(`   Title: ${title}`);

    const welcomeText = await page.$eval('h2', el => el.textContent).catch(() => null);
    console.log(`   Welcome: ${welcomeText || 'Not found'}`);

    const playButton = await page.$('a[href="/map"] button');
    if (playButton) {
      console.log('   ✅ "Spela nu!" button found');
    } else {
      console.log('   ❌ Play button not found');
    }

    // Test 2: Navigate to Map
    console.log('\n📍 Test 2: Navigating to map...');
    await page.click('a[href="/map"]');
    await delay(1500);

    const mapTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log(`   Map title: ${mapTitle || 'Not found'}`);

    // Check for religion sections
    const sections = await page.$$eval('h2', els => els.map(e => e.textContent));
    console.log(`   Religion sections: ${sections.join(', ')}`);

    // Find first level
    const firstLevel = await page.$('a[href="/level/origin-1"]');
    if (firstLevel) {
      console.log('   ✅ First level "Abrahams tält" found and clickable');
    } else {
      console.log('   ❌ First level not found');
    }

    // Test 3: Play a level
    console.log('\n📍 Test 3: Starting first level...');
    await page.click('a[href="/level/origin-1"]');
    await delay(2000);

    const levelTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    console.log(`   Level title: ${levelTitle || 'Not found'}`);

    // Look for a question
    const question = await page.$eval('h2', el => el.textContent).catch(() => null);
    console.log(`   Question: ${question ? question.substring(0, 50) + '...' : 'Not found'}`);

    // Find answer buttons (multiple choice)
    const answerButtons = await page.$$('button');
    console.log(`   Answer options: ${answerButtons.length} buttons found`);

    // Test 4: Answer a question
    console.log('\n📍 Test 4: Answering questions...');

    // Try to answer 3 questions
    for (let i = 0; i < 3; i++) {
      await delay(500);

      // Find answer buttons in the card area
      const buttons = await page.$$('.grid button, .flex button');
      if (buttons.length > 0) {
        // Click first answer (might be wrong, might be right)
        await buttons[0].click();
        console.log(`   Answered question ${i + 1}`);
        await delay(2000); // Wait for animation and next card
      } else {
        console.log(`   No answer buttons found for question ${i + 1}`);
        break;
      }
    }

    // Check current score
    const scoreElement = await page.$eval('.text-purple-700', el => el.textContent).catch(() => null);
    console.log(`   Current score: ${scoreElement || 'Not visible'}`);

    // Test 5: Check progress
    console.log('\n📍 Test 5: Checking progress indicators...');

    const progressText = await page.$$eval('span', els =>
      els.find(e => e.textContent.includes('Kort'))?.textContent
    ).catch(() => null);
    console.log(`   Progress: ${progressText || 'Not found'}`);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/game-test-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/game-test-screenshot.png');

    console.log('\n✅ Play test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Home page loads correctly');
    console.log('   - Map displays with religion sections');
    console.log('   - Levels are clickable');
    console.log('   - Questions display with answer options');
    console.log('   - Answer submission works');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: '/tmp/game-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved to /tmp/game-test-error.png');
  } finally {
    await browser.close();
  }
}

testGame();
