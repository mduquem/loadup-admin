import { useEffect, useState } from 'react'
import Head from 'next/head'
import Loading from 'components/loading/loading'

export default function Home() {
	const [availableShares, setAvailableShares] = useState([])
	const [selectedSymbol, setSelectedSymbol] = useState('')
	const [selectedSymbolLastPrice, setSelectedSymbolLastPrice] = useState(0)

	const [numberOfShares, setNumberOfShares] = useState(0)
	const [totalAmount, setTotalAmount] = useState(0)
	const [loading, setLoading] = useState(false)

	const [currentPositions, setCurrentPositions] = useState([])
	const [page, setPage] = useState(1)

	useEffect(async () => {
		setLoading(true)

		await fetch(process.env.BASE_URL + '/v2/assets', {
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
				setLoading(false)

				setAvailableShares(tradableShares.splice(0, 10))
				setSelectedSymbol(tradableShares[0].id)
			})
			.catch((error) => {
				console.error(error)
				setLoading(false)
			})

		await fetch(process.env.MAIN_LOADUP_URL + '/api/get-positions')
			.then((response) => {
				console.log('response', response)
				setLoading(false)

				return response.json()
			})
			.then((data) => {
				console.log('data inside positions', data)
				setCurrentPositions(data.data)
				setLoading(false)
			})
	}, [])

	const buyNewShare = (event) => {
		event.preventDefault()
		const symbol =
			availableShares.find((share) => share.id === selectedSymbol) || 'AAPL'
		if (
			selectedSymbol === '' ||
			numberOfShares === 0 ||
			selectedSymbolLastPrice === 0
		) {
			alert('Unable to buy. Missing parameters')
		}
		fetch(process.env.MAIN_LOADUP_URL + '/api/buy', {
			method: 'POST',
			body: JSON.stringify({
				symbol: symbol.symbol,
				qty: numberOfShares,
				side: 'buy',
				type: 'market',
				time_in_force: 'day'
			})
		})
			.then((response) => {
				return response.json()
			})
			.then((data) => {})
			.catch((error) => {
				console.error(error)
			})
	}

	const changeSelectedSymbol = (event) => {
		setSelectedSymbol(event.target.value)
		fetchSymbolLastPrice(selectedSymbol)
	}

	const fetchSymbolLastPrice = () => {
		const symbol =
			availableShares.find((share) => share.id === selectedSymbol) || 'AAPL'

		fetch(
			process.env.MARKET_DATA_URL + '/v1/last/stocks/' + String(symbol.symbol),
			{
				method: 'GET',
				headers: {
					'APCA-API-KEY-ID': process.env.APCA_API_KEY,
					'APCA-API-SECRET-KEY': process.env.APCA_API_SECRET_KEY
				}
			}
		)
			.then((response) => {
				return response.json()
			})
			.then((data) => {
				setSelectedSymbolLastPrice(data.last.price)
				setTotalAmount(numberOfShares * selectedSymbolLastPrice)
			})
			.catch((error) => {
				console.error('errorrrrrr inside fetch', error)
			})
	}

	let mainContent = (
		<div>
			<h1 className='text-6xl font-bold text-gray-800'>
				Welcome to Loadup Admin!
			</h1>
			<h2 className='text-3xl text-gray-600 '>Just buy whole shares for now</h2>
			<div className='flex items-center justify-between my-5'>
				<form className=' border-2 border-green-600 rounded-md shadow-lg p-5'>
					<div className='flex flex-col my-5'>
						<label className=' text-sm font-medium text-gray-700'>
							Please select the <span className='font-bold'>symbol</span> you
							want to purchase
						</label>
						<select
							onChange={changeSelectedSymbol}
							value={selectedSymbol}
							className='rounded-md shadow-sm py-5 px-3'
						>
							{availableShares.map((share) => {
								return (
									<option key={share.id} value={share.id}>
										{share.symbol} - {share.name}
									</option>
								)
							})}
						</select>
					</div>

					<div className='flex flex-col my-5'>
						<label className=' text-sm font-medium text-gray-700'>
							Please select <span className='font-bold'>number</span> of shares
							you want to purchase
						</label>
						<input
							className='rounded-md shadow-sm  py-5 px-3'
							type='number'
							placeholder='e.g. 5 shares of AAPL'
							onChange={(event) => {
								setNumberOfShares(event.target.value)
							}}
						/>
					</div>
					<div className='flex justify-between'>
						<button
							onClick={buyNewShare}
							className='bg-green-600 text-white active:bg-green-700 font-bold uppercase text-base px-8 py-3 rounded-full shadow-md hover:shadow-lg outline-none focus:outline-none mr-1 mb-1'
						>
							Buy
						</button>
						<div>
							{availableShares.map((share) => {
								if (share.id === selectedSymbol) {
									return <h3>{share.name}</h3>
								} else {
									return null
								}
							})}
							{totalAmount !== 0 ? (
								<p>
									<span className='font-bold'>for</span> $
									{new Intl.NumberFormat().format(totalAmount, {
										style: 'currency',
										currency: 'USD'
									})}
								</p>
							) : null}
						</div>
					</div>
				</form>
				<div className='p-5'>
					{currentPositions.map((position) => {
						let color = 'green'
						if (position.unrealized_pl < 0) {
							color = 'red'
						}
						return (
							<div key={position.id}>
								<h1 className='text-gray-900 font-bold text-lg'>
									{position.symbol} -{' '}
									<span className='text-green-600'>
										{position.side.toUpperCase()}
									</span>
								</h1>
								<h2>
									{position.qty} shares at{' '}
									{Intl.NumberFormat().format(position.current_price, {
										style: 'currency',
										currency: 'USD'
									})}{' '}
									<br />
									for a market value of{' '}
									{new Intl.NumberFormat().format(position.market_value, {
										style: 'currency',
										currency: 'USD'
									})}
								</h2>
								<h2 className={`text-${color}-600`}>
									{(position.change_today * 100).toFixed(4)} % Today
								</h2>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)

	if (loading) {
		mainContent = <Loading />
	}

	return (
		<div>
			<Head>
				<title>Loadup | Admin</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex justify-center p-12'>{mainContent}</main>

			<footer></footer>
		</div>
	)
}
