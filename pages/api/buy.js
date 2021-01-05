const buy = async (req, res) => {
	const buyData = req.body
	try {
		const response = await fetch(process.env.BASE_URL + '/v2/orders', {
			method: 'POST',
			body: buyData,
			headers: {
				'APCA-API-KEY-ID': process.env.APCA_API_KEY,
				'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY
			}
		})
		const data = await response.json()

		res.statusCode = 200
		res.send({
			success: true,
			message: 'Successfully bought',
			data
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
export default buy
