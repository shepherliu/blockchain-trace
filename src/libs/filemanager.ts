// example imports 
import { providers, Contract } from "ethers"

import { fileContractAddress } from "../constant"

import {networkConnect, connectState} from "./connect"

//contract abis
const abi = [
	"function addFile(string memory filename, string memory filetype, string memory fileid, uint256 filesize) public returns (bool)",
	"function delFile(string memory fileid) public returns (bool)",
	"function getIndexsByFileType(string memory filetype) public view returns (uint256[] memory)",
	"function getFileInfoByIndex(uint256 index) public view returns(string memory, string memory, string memory, uint256)",
];

//get contract provider
export const getContract = async () => {
  await networkConnect();

  return new Contract((fileContractAddress as any)[connectState.chainId], abi, connectState.signer);	
}

//add a file to the smart contract
export const addFile = async (filename:string, filetype:string, fileid:string, filesize:number) => {
	filename = filename.trim();
	if(filename===''){
		throw new Error("file name is empty!");
	}
	filetype = filetype.trim();
	if(filetype!="image"&&filetype!="audio"&&filetype!="video"&&filetype!="docs"&&filetype!="folder"&&filetype!="website"){
		throw new Error("unknow filetype!");
	}	
	fileid = fileid.trim();
	if(fileid===''){
		throw new Error("file id is empty!");
	}
	filesize = Math.floor(filesize);
	if(filesize<=0){
		throw new Error("file size must large than zero!");
	}

	const contract = await getContract();
	const tx = await contract.addFile(filename, filetype, fileid, filesize);
  await tx.wait()

  return tx.hash;
}

//delete a file from the smart contract
export const delFile = async (fileid:string) => {
	fileid = fileid.trim();
	if(fileid===''){
		throw new Error("file id is empty!");
	}

	const contract = await getContract();
	const tx = await contract.delFile(fileid);
  await tx.wait()

  return tx.hash;	
}

//get file indexs by file type, like image/audio/video/folder/website
export const getIndexsByFileType = async (filetype:string) => {
	filetype = filetype.trim();
	if(filetype!="image"&&filetype!="audio"&&filetype!="video"&&filetype!="docs"&&filetype!="folder"&&filetype!="website"){
		throw new Error("unknow filetype!");
	}

	const contract = await getContract();

	return await contract.getIndexsByFileType(filetype);
}

//get file info by index
export const getFileInfoByIndex = async (index:number) => {
	index = Math.floor(index);
	if(index<0){
		throw new Error("index must large than zero!");
	}

	const contract = await getContract();

	return await contract.getFileInfoByIndex(index);
}