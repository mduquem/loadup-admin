const getPositions = async (req, res) => {
	const response = await fetch(process.env.BASE_URL + '/v2/positions', {
		method: 'GET',
		headers: {
			'APCA-API-KEY-ID': process.env.APCA_API_KEY,
			'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY
		}
	})
	const data = await response.json()
	res.statusCode = 200
	res.send({
		success: true,
		message: 'Successfully retrieved positions',
		data
	})
}

export default getPositions
