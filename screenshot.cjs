const puppeteer = require('puppeteer');
const path = require('path');

const outputDir = 'C:/Users/BartVisser/Desktop/Bespaarcheck/Claude-screenshots';

async function takeScreenshots() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to bespaarcheck.vercel.app...');
    await page.goto('https://bespaarcheck.vercel.app', {
        waitUntil: 'networkidle0',
        timeout: 60000
    });

    await new Promise(r => setTimeout(r, 3000));

    // Screenshot 1: Hero
    console.log('Screenshot 1: Hero section...');
    await page.screenshot({
        path: path.join(outputDir, 'v2_1_hero.png'),
        fullPage: false
    });

    // Screenshot 2: Savings section
    console.log('Screenshot 2: Savings section...');
    await page.evaluate(() => {
        document.getElementById('savings')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({
        path: path.join(outputDir, 'v2_2_savings.png'),
        fullPage: false
    });

    // Screenshot 3: Calculator
    console.log('Screenshot 3: Calculator section...');
    await page.evaluate(() => {
        document.getElementById('calculator')?.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({
        path: path.join(outputDir, 'v2_3_calculator.png'),
        fullPage: false
    });

    // Screenshot 4: Full page
    console.log('Screenshot 4: Full page...');
    await page.screenshot({
        path: path.join(outputDir, 'v2_4_fullpage.png'),
        fullPage: true
    });

    await browser.close();
    console.log('Screenshots saved!');
}

takeScreenshots().catch(console.error);
