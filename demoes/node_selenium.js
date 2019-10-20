const {Builder, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
(async function example(){
	let driver = await new Builder().forBrowser('firefox')
	// .setFirefoxOptions(new firefox.Options().headless())
	.build();
	try {
		await driver.get('http://chartink.com/login');
		await driver.findElement(By.tagName('button')).sendKeys('webdriver', Key.RETURN);
		
	}finally{
		// await driver.quit();
	}
})();
function callback(){
	setTimeout(callback, 10000)
}
// setTimeout(callback, 10000)
