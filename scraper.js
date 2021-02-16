const puppeteer = require('puppeteer')
const config = require('./config.js')

const getBearerToken = async () => {
	let bearerToken, accountId
	const waitForFetchedData = async () => {
		return new Promise((resolve) => {
			if (bearerToken && accountId) return resolve()
			const interval = setInterval(() => {
				if (bearerToken && accountId) {
					clearInterval(interval)
					return resolve()
				}
			}, 100)
		})
	}
	const browser = await puppeteer.launch()
	const page = await browser.newPage()

	// Need to start from home page, if not it displays an error page
	await page.goto('https://www.scottishpower.co.uk/', {
		waitUntil: 'networkidle0',
	})
	await page.goto('https://www.scottishpower.co.uk/login', {
		waitUntil: 'networkidle0',
	})

	await page.waitForSelector('#login-email-password_email')
	await page.type('#login-email-password_email', config.email)
	await page.type('#login-email-password_password', config.password)
	await page.keyboard.press('Enter')
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' })

	await page.setRequestInterception(true)
	page.on('request', async (request) => {
		if (request.headers().authorization)
			bearerToken = request.headers().authorization
		else if (
			request
				.url()
				.startsWith(
					'https://quote.scottishpower.co.uk/aylo/api/customer/',
				)
		)
			accountId = request
				.url()
				.substring(request.url().lastIndexOf('/') + 1)

		request.continue()
	})

	await waitForFetchedData()
	await browser.close()
	return { bearerToken, accountId }
}

module.exports = getBearerToken
