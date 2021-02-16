const axios = require('axios')
const scraper = require('./scraper')

;(async () => {
	console.log('connecting to your account...')
	const data = await scraper()
	if (!data) {
		console.log('Sorry, we were not able to connect to your account :(')
		return
	}
	const printCustomerData = (data) => {
		const { customerDetails, contracts } = data
		console.log('\n')
		console.log(
			'Hi ' +
				customerDetails.title +
				' ' +
				customerDetails.firstName +
				' ' +
				customerDetails.lastName +
				'!',
		)
		for (const contract of contracts) {
			console.log(
				contract.postCode +
					' - ' +
					contract.energyType +
					', balance: ' +
					contract.currentBalance.amount,
			)
		}
	}
	axios
		.get(
			'https://quote.scottishpower.co.uk/aylo/api/customer/' +
				data.accountId,
			{
				headers: {
					Authorization: data.bearerToken,
				},
			},
		)
		.then((response) => {
			printCustomerData(response.data)
		})
		.catch((error) => {
			console.log(error)
		})
})()
