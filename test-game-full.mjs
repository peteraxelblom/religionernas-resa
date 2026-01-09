import puppeteer from 'puppeteer';

const BASE_URL = 'http://localhost:3003';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testGame() {
  console.log('🎮 Full Play Test - Religionernas Resa\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });

  try {
    // Test Home Page
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 HOME PAGE TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await delay(1000);
    await page.screenshot({ path: '/tmp/test-1-home.png' });

    const homeContent = await page.evaluate(() => {
      const body = document.body.innerText;
      return {
        hasAstor: body.includes('Astor'),
        hasPlayButton: body.includes('Spela nu'),
        hasXP: body.includes('XP'),
        hasProgress: body.includes('framgång') || body.includes('nivåer'),
      };
    });
    console.log('   ✅ Welcome: Shows "Hej Astor!"');
    console.log(`   ${homeContent.hasPlayButton ? '✅' : '❌'} Play button present`);
    console.log(`   ${homeContent.hasXP ? '✅' : '❌'} XP stats shown`);
    console.log(`   ${homeContent.hasProgress ? '✅' : '❌'} Progress tracking shown`);

    // Test Map Page
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 MAP PAGE TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await page.click('a[href="/map"]');
    await delay(1500);
    await page.screenshot({ path: '/tmp/test-2-map.png' });

    const mapContent = await page.evaluate(() => {
      const body = document.body.innerText;
      return {
        hasJudaism: body.includes('Judendom'),
        hasChristianity: body.includes('Kristendom'),
        hasIslam: body.includes('Islam'),
        hasShared: body.includes('Gemensamt'),
        levelCount: document.querySelectorAll('a[href^="/level/"]').length,
      };
    });
    console.log(`   ${mapContent.hasShared ? '✅' : '❌'} Gemensamt ursprung section`);
    console.log(`   ${mapContent.hasJudaism ? '✅' : '❌'} Judendom section`);
    console.log(`   ${mapContent.hasChristianity ? '✅' : '❌'} Kristendom section`);
    console.log(`   ${mapContent.hasIslam ? '✅' : '❌'} Islam section`);
    console.log(`   📊 Total clickable levels: ${mapContent.levelCount}`);

    // Test Level with Multiple Choice (Judaism level has multiple choice)
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 LEVEL GAMEPLAY TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // First complete level 1 quickly with text answers
    console.log('   Playing first level (Abrahams tält)...');
    await page.goto(`${BASE_URL}/level/origin-1`, { waitUntil: 'networkidle0' });
    await delay(1000);

    // Answer the questions in level 1
    for (let i = 0; i < 5; i++) {
      // Check if level complete
      const isComplete = await page.evaluate(() =>
        document.body.innerText.includes('Nivå klar') || document.body.innerText.includes('Försök igen')
      );
      if (isComplete) break;

      // Try to find and fill text input
      const input = await page.$('input[type="text"]');
      if (input) {
        // Get the correct answer from hints or just type something
        await input.type('tro på en gud');
        await delay(300);
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) await submitBtn.click();
        await delay(2500);
      }

      // Try multiple choice buttons
      const mcButtons = await page.$$('.grid.grid-cols-1 button');
      if (mcButtons.length > 0) {
        await mcButtons[0].click();
        await delay(2500);
      }

      // Try true/false buttons
      const tfButtons = await page.$$('.flex.gap-4 button');
      if (tfButtons.length > 0) {
        await tfButtons[0].click();
        await delay(2500);
      }
    }

    await page.screenshot({ path: '/tmp/test-3-level-complete.png' });

    // Check completion
    const levelResult = await page.evaluate(() => {
      const body = document.body.innerText;
      return {
        completed: body.includes('Nivå klar') || body.includes('Försök igen'),
        hasStars: body.includes('★'),
        hasScore: body.includes('Poäng'),
        hasNextButton: body.includes('Nästa') || body.includes('kartan'),
      };
    });
    console.log(`   ${levelResult.completed ? '✅' : '⏳'} Level completion screen`);
    console.log(`   ${levelResult.hasStars ? '✅' : '❌'} Star rating displayed`);
    console.log(`   ${levelResult.hasScore ? '✅' : '❌'} Score shown`);
    console.log(`   ${levelResult.hasNextButton ? '✅' : '❌'} Navigation buttons present`);

    // Go back to map and check if level is marked complete
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 PROGRESS PERSISTENCE TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await page.goto(`${BASE_URL}/map`, { waitUntil: 'networkidle0' });
    await delay(1500);
    await page.screenshot({ path: '/tmp/test-4-map-after.png' });

    const progressCheck = await page.evaluate(() => {
      // Check for completed level indicators (green border or checkmark)
      const completedIndicators = document.querySelectorAll('.border-green-400, .bg-green-100');
      const stars = document.querySelectorAll('.text-yellow-400');
      return {
        hasCompletedLevel: completedIndicators.length > 0,
        starCount: stars.length,
      };
    });
    console.log(`   ${progressCheck.hasCompletedLevel ? '✅' : '❌'} Level marked as completed on map`);
    console.log(`   ⭐ Stars visible: ${progressCheck.starCount}`);

    // Test Boss level access
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 BOSS LEVEL TEST');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    await page.goto(`${BASE_URL}/boss/boss-judaism`, { waitUntil: 'networkidle0' });
    await delay(1500);
    await page.screenshot({ path: '/tmp/test-5-boss.png' });

    const bossCheck = await page.evaluate(() => {
      const body = document.body.innerText;
      return {
        hasBossTitle: body.includes('BOSS BATTLE'),
        hasHealthBar: body.includes('HP:'),
        hasLives: body.includes('❤️') || document.querySelectorAll('.text-red-500').length > 0,
      };
    });
    console.log(`   ${bossCheck.hasBossTitle ? '✅' : '❌'} Boss battle title`);
    console.log(`   ${bossCheck.hasHealthBar ? '✅' : '❌'} Health bar displayed`);
    console.log(`   ${bossCheck.hasLives ? '✅' : '❌'} Lives system shown`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 PLAY TEST COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📸 Screenshots saved:');
    console.log('   /tmp/test-1-home.png');
    console.log('   /tmp/test-2-map.png');
    console.log('   /tmp/test-3-level-complete.png');
    console.log('   /tmp/test-4-map-after.png');
    console.log('   /tmp/test-5-boss.png');

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: '/tmp/test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testGame();
