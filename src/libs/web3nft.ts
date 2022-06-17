// example imports 
import { providers, utils, Contract } from "ethers"

import {nftContractAddress} from "../constant"

import {networkConnect, connectState} from "./connect"

//contract abis
const abi = [
	"function safeTransferFrom(address from, address to, uint256 tokenId)",
	"function mint(string memory tokenType, string memory tokenURI) public returns (uint256)",
	"function burn(uint256 tokenId) public payable returns (bool)",
	"function tokenURI(uint256 tokenId) public view returns (string memory)",
	"function hateNft(uint256 tokenId) public returns (bool)",
	"function likeNft(uint256 tokenId) public returns (bool)",
	"function rewardNft(uint256 tokenId) public payable returns (bool)",
	"function claim() public payable returns (bool)",
	"function getNFTPrameters() public view returns (uint, uint, uint, uint, uint)",
	"function getAddressPrameters() public view returns (uint256, uint256, uint, uint256, bool)",
	"function balanceOf(address owner) public view returns (uint256)",
	"function ownerOf(uint256 tokenId) public view returns (address)",
	"function tokenByIndex(uint256 index) public view returns (uint256)",
	"function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
	"function totalSupply() public view returns (uint256)",
	"function minted(string memory tokenURI) public view returns (bool)",
	"function addVote(string memory title, string memory content, uint value, uint deadline) public returns (bool)",
	"function delVote(uint256 voteId) public returns (bool)",
	"function vote(uint256 voteId, bool voteAggree) public returns (bool)",
	"function getVoteTotal() public view returns (uint)",
	"function getVoteInfoByIndex(uint index) public view returns (uint256, address, string memory, string memory, uint, uint, uint, bool)",
	"function sellNFT(uint256 tokenId, uint256 tokenPrice) public returns (bool)",
	"function buyNFT(uint256 tokenId) public payable returns (bool)",
	"function getNftInfoByIndex(uint256 tokenId) public view returns (address, string memory, string memory, uint, uint, uint256, uint256)",
];

//get contract provider
export const getContract = async () => {
  await networkConnect();

  return new Contract((nftContractAddress as any)[connectState.chainId], abi, connectState.signer);	
}

//safetransfer from
export const safeTransferFrom = async (from:string, to:string, tokenId:number) => {
	from = from.trim();
	if(from === ''){
		throw new Error("from address is empty!");
	}
	to = to.trim();
	if(to === ''){
		throw new Error("to address is empty!");
	}
	if(from === to){
		throw new Error("from address can not be the same as to address!");
	}
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}	

	const contract = await getContract();
	const tx = await contract.safeTransferFrom(from, to, tokenId);
  await tx.wait();

  return tx.hash;		
}

//mint a nft
export const mint = async (tokenType:string, tokenURI:string) => {
	tokenType = tokenType.trim();
	if(tokenType!="image"&&tokenType!="audio"&&tokenType!="video"){
		throw new Error("unknow token type!");
	}

	tokenURI = tokenURI.trim();
	if(tokenURI===''){
		throw new Error("token uri is empty!");
	}

	const contract = await getContract();
	const tx = await contract.mint(tokenType, tokenURI);
  await tx.wait();

  return tx.hash;	
}

//burn a nft
export const burn = async (tokenId:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const contract = await getContract();
	const tx = await contract.burn(tokenId);
  await tx.wait();

  return tx.hash;		
}

//get nft token uri
export const tokenURI = async (tokenId:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const contract = await getContract();
	return await contract.tokenURI(tokenId);
}

//vote to hate a nft
export const hateNft = async (tokenId:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const contract = await getContract();
	const tx = await contract.hateNft(tokenId);
  await tx.wait();

  return tx.hash;			
}

//vote to like a nft
export const likeNft = async (tokenId:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const contract = await getContract();
	const tx = await contract.likeNft(tokenId);
  await tx.wait();

  return tx.hash;		
}

//reward the nft some tokens
export const rewardNft = async(tokenId:number, reward:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	if(reward<=0){
		throw new Error("reward must large than zero!");
	}

	const options = {value: utils.parseEther(String(reward))};

	const contract = await getContract();
	const tx = await contract.rewardNft(tokenId, options);
  await tx.wait();

  return tx.hash;		
}

//cliam the user address reward tokens
export const claim = async () => {
	const contract = await getContract();
	const tx = await contract.claim();
	await tx.wait();

	return tx.hash;
} 

//get token hates
export const getNftInfoByIndex = async (tokenId:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const contract = await getContract();

	return await contract.getNftInfoByIndex(tokenId);
}

//get NFT base prameters
export const getNFTPrameters = async () => {

	const contract = await getContract();

	return await contract.getNFTPrameters();
}

//get user address base prameters
export const getAddressPrameters = async () => {

	const contract = await getContract();

	return await contract.getAddressPrameters();
}

//get the amount nfts of user
export const balanceOf = async (addr:string) => {
	addr = addr.trim();
	if(addr===''){
		throw new Error("address is empty!");
	}

	const contract = await getContract();

	return await contract.balanceOf(addr);
}

//get the owner of the nft
export const ownerOf = async (tokenId:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const contract = await getContract();

	return await contract.ownerOf(tokenId);
}

//get nft id by index
export const tokenByIndex = async (index:number) => {
	index = Math.floor(index);
	if(index < 0){
		throw new Error("invalid token index!");
	}

	const contract = await getContract();

	return await contract.tokenByIndex(index);
}

//get user nft id by index
export const tokenOfOwnerByIndex = async (addr:string, index:number) => {
	index = Math.floor(index);
	if(index < 0){
		throw new Error("invalid token index!");
	}
	addr = addr.trim();
	if(addr===''){
		throw new Error("address is empty!");
	}	

	const contract = await getContract();

	return await contract.tokenOfOwnerByIndex(addr, index);
}

//get total nfts amount
export const totalSupply = async () => {
	const contract = await getContract();

	return await contract.totalSupply();
}

//check if a nft is minted or not by the uri
export const minted = async (tokenURI:string) => {
	tokenURI = tokenURI.trim();
	if(tokenURI===''){
		throw new Error("token uri is empty!");
	}

	const contract = await getContract();

	return await contract.minted(tokenURI);
}

//add a dao vote
export const addVote = async (title:string, content:string, value:number, deadline:number) => {
	title = title.trim();
	if(title === ''){
		throw new Error('vote title is empty!');
	}
	content = content.trim();
	if(content === ''){
		throw new Error('vote content is empty!');
	}
	value = Math.floor(value);
	deadline = Math.floor(deadline);
	if(deadline < 1 || deadline > 30){
		throw new Error("vote deadline must large than 1 day and less than 30 days!");
	}

	const contract = await getContract();
	const tx = await contract.addVote(title, content, value, deadline);

  await tx.wait();

  return tx.hash;		
}

//del a dao vote
export const delVote = async (voteId:number) => {
	voteId = Math.floor(voteId);
	if(voteId < 0){
		throw new Error("invalid vote id!");
	}	

	const contract = await getContract();
	const tx = await contract.delVote(voteId);

  await tx.wait();

  return tx.hash;		
}

//vote aggree or against
export const vote = async (voteId:number, voteAggree:boolean) => {
	voteId = Math.floor(voteId);
	if(voteId < 0){
		throw new Error("invalid vote id!");
	}	

	const contract = await getContract();
	const tx = await contract.vote(voteId, voteAggree);

  await tx.wait();

  return tx.hash;		
}

//get vote indexs by type like lining/finished
export const getVoteTotal = async () => {
	const contract = await getContract();

	return await contract.getVoteTotal();
}

//get vote info by index
export const getVoteInfoByIndex = async (index:number) => {
	index = Math.floor(index);
	if(index < 0){
		throw new Error("invalid token index!");
	}

	const contract = await getContract();

	return await contract.getVoteInfoByIndex(index);
}

//sell a NFT
export const sellNFT = async (tokenId:number, tokenPrice:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	if(tokenPrice <= 0){
		tokenPrice = 0;
	}

	const sellPrice = utils.parseEther(String(tokenPrice));

	const contract = await getContract();
	const tx = await contract.sellNFT(tokenId, sellPrice);

	await tx.wait();

	return tx.hash;	
}

//buy a NFT
export const buyNFT = async (tokenId:number, tokenPrice:number) => {
	tokenId = Math.floor(tokenId);
	if(tokenId < 0){
		throw new Error("invalid token id!");
	}

	const options = {value: utils.parseEther(String(tokenPrice))};	

	const contract = await getContract();
	const tx = await contract.buyNFT(tokenId, options);

	await tx.wait();

	return tx.hash;	
}

















