import * as constant from '../constant'

export const getTokenBalancesForAddress = async (chainId:number, address:string, nft:boolean = false) => {

	let url = `${constant.covalentApiHost}/v1/${chainId}/address/${address}/balances_v2/?key=${constant.covalentApiKey}`;

	if(nft){
		url = `${constant.covalentApiHost}/v1/${chainId}/address/${address}/balances_v2/?nft=true&no-nft-fetch=true&key=${constant.covalentApiKey}`;
	}

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get token balance for address failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get token balance for address failed.');
	}

	return res;
}

export const getErc20TokenTransfersForAddress = async (chainId:number, address:string, contract:string, pageSize:number = 10, currentPage:number = 0) => {
	
	const url = `${constant.covalentApiHost}/v1/${chainId}/address/${address}/transfers_v2/?contract-address=${contract}&key=${constant.covalentApiKey}&quote-currency=USD&format=JSON&page-number=${currentPage}&page-size=${pageSize}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get erc20 token transfer for address failed.');
	}

	let hasMore = false;

	try{
		res = await res.json();
		hasMore = (res as any)['data']['pagination']['has_more'];
		res = (res as any)['data']['items'];
	}catch(e){
		throw new Error('get token holders for block height failed.');
	}

	return {data:res, hasMore: hasMore};  
}

export const getTokenHoldersForBlockHeight = async (chainId:number, contract:string, blockHeight:number = -1, pageSize:number = 10, currentPage:number = 0) => {
	
	let url = `${constant.covalentApiHost}/v1/${chainId}/tokens/${contract}/token_holders/?key=${constant.covalentApiKey}&quote-currency=USD&format=JSON&page-number=${currentPage}&page-size=${pageSize}`;

	if(blockHeight >= 0){
		url = `${constant.covalentApiHost}/v1/${chainId}/tokens/${contract}/token_holders/?block-height=${blockHeight}&key=${constant.covalentApiKey}&quote-currency=USD&format=JSON&page-number=${currentPage}&page-size=${pageSize}`;
	}

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get token holders for block height failed.');
	}

	let hasMore = false;

	try{
		res = await res.json();
		hasMore = (res as any)['data']['pagination']['has_more'];
		res = (res as any)['data']['items'];
	}catch(e){
		throw new Error('get token holders for block height failed.');
	}

	return {data:res, hasMore: hasMore};    	
}

export const getChangesInTokenHoldersBetweenBlocks = async (chainId:number, contract:string, blockStart:number, blockEnd:number, pageSize:number = 10, currentPage:number = 0) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/tokens/${contract}/token_holders_changes/?starting-block=${blockStart}&ending-block=${blockEnd}&key=${constant.covalentApiKey}&quote-currency=USD&format=JSON&page-number=${currentPage}&page-size=${pageSize}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get token holders changes between blocks height failed.');
	}

	let hasMore = false;

	try{
		res = await res.json();
		hasMore = (res as any)['data']['pagination']['has_more'];
		res = (res as any)['data']['items'];
	}catch(e){
		throw new Error('get token holders for block height failed.');
	}

	return {data:res, hasMore: hasMore};    	
}

export const getNFTTokenIdForContract = async (chainId:number, contract:string) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/tokens/${contract}/nft_token_ids/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get nft token ids for contract failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get nft token ids for contract failed.');
	}

	return res;  	

}

export const getNFTTransactionsForContract = async (chainId:number, contract:string, tokenId:number) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/tokens/${contract}/nft_transactions/${tokenId}/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get nft transactions for contract failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get nft transactions for contract failed.');
	}

	return res;  		

}

export const getNFTExternalMetadataForContract = async (chainId:number, contract:string, tokenId:number) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/tokens/${contract}/nft_metadata/${tokenId}/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get nft external metadata for contract failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get nft external metadata for contract failed.');
	}

	return res;  		
}

export const getTransactionsForAddress = async (chainId:number, address:string, pageSize:number = 10, currentPage:number = 0) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/address/${address}/transactions_v2/?key=${constant.covalentApiKey}&quote-currency=USD&format=JSON&page-number=${currentPage}&page-size=${pageSize}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get transactions for address failed.');
	}

	let hasMore = false;

	try{
		res = await res.json();
		hasMore = (res as any)['data']['pagination']['has_more'];
		res = (res as any)['data']['items'];
	}catch(e){
		throw new Error('get token holders for block height failed.');
	}

	return {data:res, hasMore: hasMore};  
}

export const getTransaction = async (chainId:number, transaction:string) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/transaction_v2/${transaction}/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get transaction failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get transaction failed.');
	}

	return res; 		

}

export const getBlock = async (chainId:number, block:number|string) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/block_v2/${block}/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get block failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get block failed.');
	}

	return res; 		
}

export const getBlockHeights = async (chainId:number, starttime:string, endtime:string) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/block_v2/${starttime}/${endtime}/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get block heights failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get block heights failed.');
	}

	return res; 	
}

export const getLogEventsByContractAddress = async (chainId:number, contract:string, blockstart:number, blockend:number, pageSize:number = 10, currentPage:number = 0) => {

	const url = `${constant.covalentApiHost}/v1/${chainId}/events/address/${contract}/?starting-block=${blockstart}&ending-block=${blockend}&key=${constant.covalentApiKey}&quote-currency=USD&format=JSON&page-number=${currentPage}&page-size=${pageSize}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get log events by contract address failed.');
	}

	let hasMore = false;

	try{
		res = await res.json();
		hasMore = (res as any)['data']['pagination']['has_more'];
		res = (res as any)['data']['items'];
	}catch(e){
		throw new Error('get token holders for block height failed.');
	}

	return {data:res, hasMore: hasMore};	
}

export const getAllChains = async () => {

	const url = `${constant.covalentApiHost}/v1/chains?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get all chains failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get all chains failed.');
	}

	return res; 	

}

export const getAllChainStatuses = async () => {

	const url = `${constant.covalentApiHost}/v1/chains/status/?key=${constant.covalentApiKey}`;

	let res = await fetch(url, {
		headers: {
			"content-type": "application/json",
		},
		"referrer": (window as any).location.href,
		"referrerPolicy": "strict-origin-when-cross-origin",
		"method": "GET",
		"mode": "cors",
		"credentials": "omit",
	});

	if (res.status < 200 || res.status > 299){
		throw new Error('get chains status failed.');
	}

	try{
		res = ((await res.json()) as any)['data']['items'];
	}catch(e){
		throw new Error('get chains status failed.');
	}

	return res; 

}

