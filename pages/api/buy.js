export default async (req, res) => {
	const buyData = JSON.stringify(req.body)

	try {
		const response = await fetch(process.env.BASE_URL + '/v2/orders', {
			method: 'POST',
			body: buyData
		})
		await response.json()
		res.statusCode = 200
		res.send({
			success: true,
			message: 'Successfully bought',
			response
		})
	} catch (error) {
		res.statusCode = 500
		res.send({
			success: false,
			message: 'Error buying',
			error
		})
	}
}
