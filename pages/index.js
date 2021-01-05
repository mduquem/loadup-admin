import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function Home() {
	const [availableShares, setAvailableShares] = useState([])
	const [page, setPage] = useState(1)

	useEffect(() => {
		fetch(process.env.BASE_URL + '/v2/assets', {
			method: 'GET',
			headers: {
				'APCA-API-KEY-ID': process.env.APCA_API_KEY,
				'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY
			}
		})
			.then((response) => {
				if (response.status === 404) {
					alert('404. Not Found')
				}
				return response.json()
			})
			.then((data) => {
				console.log(data[0])

				const tradableShares = []
				data.map((share) => {
					if (
						share.tradable &&
						share.exchange === 'NASDAQ' &&
						share.status === 'active'
					) {
						tradableShares.push(share)
					}
				})
				console.log('tradables', tradableShares)

				setAvailableShares(tradableShares)
			})
			.catch((error) => {
				console.error(error)
			})
	}, [])

	const buyNewShare = () => {
		fetch(proc)
	}

	return (
		<div>
			<Head>
				<title>Loadup | Admin</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex justify-center p-12'>
				<div>
					<h1 className='text-6xl font-bold text-gray-800'>
						Welcome to Loadup Admin!
					</h1>
					<h2 className='text-3xl text-gray-600 '>
						Just buy whole shares for now
					</h2>
					<div className='flex items-center justify-between my-5'>
						<form className='w-full border-2 border-green-600 rounded-md shadow-lg p-5'>
							<div className='flex flex-col my-5'>
								<label className=' text-sm font-medium text-gray-700'>
									Please select the <span className='font-bold'>symbol</span>{' '}
									you want to purchase
								</label>
								<select className='rounded-md shadow-sm py-5 px-3'>
									{availableShares.splice(0, 10).map((share) => {
										return (
											<option value={share.id}>
												{share.symbol} - {share.name}
											</option>
										)
									})}
								</select>
							</div>

							<div className='flex flex-col my-5'>
								<label className=' text-sm font-medium text-gray-700'>
									Please select <span className='font-bold'>number</span> of
									shares you want to purchase
								</label>
								<input
									className='rounded-md shadow-sm  py-5 px-3'
									type='number'
									placeholder='e.g. 5 shares of AAPL'
								/>
							</div>
							<button className='bg-green-600 text-white active:bg-green-700 font-bold uppercase text-base px-8 py-3 rounded-full shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'>
								Buy
							</button>
						</form>
					</div>
				</div>
			</main>

			<footer></footer>
		</div>
	)
}
