import * as path from "path"

import * as swarm from './swarm'
import * as bundlr from './bundlr'
import * as web3storage from './web3storage'


import { connectState } from './connect'
import * as tools from "./tools"
import * as filemanager from "./filemanager"

import * as constant from "../constant"

//get real file url link based on the storage type
const getFileLink = (filename:string, filetype:string, fileid:string) => {
  switch(connectState.storage){
    case 'bundlr':
      return constant.arweaveUrl + fileid;
    case 'swarm':
      return constant.swarmGateway + fileid;
    case 'filcoin':
      if(filetype==='folder'){
        return constant.web3Gateway + fileid;
      } else if (filetype==='website'){
        return constant.web3Gateway + fileid + '/index.html';
      } else {
        return constant.web3Gateway + fileid + '/' + filename;
      }
  }

  return fileid;
}

//upload file
export const uploadFile = async (file: any) => {
  return await uploadFolder(file.name, [file]);
}

//upload folder
export const uploadFolder = async (dirPath: string, files: any[]) => {
  if(files.length===0){
    throw new Error("no files selected to upload!");
  }

  let size = 0;
  for(const i in files){
    size += (files[i].raw as any).size;
  }

  let filetype = '';
  if(files.length === 1 && ((files[0].raw) as any).webkitRelativePath === ''){
    filetype = tools.fileType(files[0].name).split('/')[0];
    if(filetype!='image'&&filetype!='audio'&&filetype!='video'){
      filetype = 'docs';
    }
  }else{
    filetype = 'folder';
    for(const i in files){
      const relpath = ((files[i].raw) as any).webkitRelativePath.split(path.sep).slice(1,).join(path.sep);
      if(relpath==='index.html'){
        filetype = 'website';
        break;
      }
    }
  }

  //upload to the remote storage
  let fileid = '';
  switch (connectState.storage){
    case 'bundlr':
      fileid = await bundlr.uploadFolder(dirPath, files);
      break;
    case 'swarm':
      fileid = await swarm.uploadFolder(dirPath, files);
      break;
    case 'filcoin':
      fileid = await web3storage.uploadFolder(dirPath, files);
      break;
    default:
      fileid = await web3storage.uploadFolder(dirPath, files);
      break;
  }   

  fileid = getFileLink(dirPath, filetype, fileid);

  //upload to the smart contract
  return await filemanager.addFile(dirPath, filetype, fileid, size)
}