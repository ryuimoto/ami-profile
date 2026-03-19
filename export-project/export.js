const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Ensure high resolution
        await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });
        
        const fileUrl = `file://${path.resolve('../profile.html')}`;
        console.log(`Loading: ${fileUrl}`);
        
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        // Get the dimensions of the profile card to crop exactly to it
        const clip = await page.evaluate(() => {
            const card = document.querySelector('.profile-card');
            if (!card) return null;
            const { x, y, width, height } = card.getBoundingClientRect();
            // Add some padding around the card for the final image
            return { x: Math.max(0, x - 20), y: Math.max(0, y - 20), width: width + 40, height: height + 40 };
        });

        const outputPath = path.resolve('../profile-final.jpg');
        console.log(`Saving to: ${outputPath}`);
        
        if (clip) {
             await page.screenshot({ 
                 path: outputPath, 
                 type: 'jpeg',
                 quality: 100,
                 clip: clip
             });
        } else {
             await page.screenshot({ 
                 path: outputPath, 
                 type: 'jpeg',
                 quality: 100,
                 fullPage: true
             });
        }
        
        await browser.close();
        console.log('Successfully generated profile-final.jpg!');
    } catch (error) {
        console.error('Error generating image:', error);
    }
})();
