// example imports 
import { providers, utils } from "ethers"

import * as path from "path"

// import WebBundlr
import { WebBundlr } from "@bundlr-network/client"

import * as constant from "../constant"

import * as connect from "./connect"

import { fileType } from "./tools"

//get bundlr node api by chain id
const getBundlrNetwork = (chainId:number) => {
  switch(chainId){
    case 1:case 56:case 137:case 250:case 288:case 43114:case 42161:
      return constant.bundlrUrl;
    case 3:case 4:case 5:case 42:case 80001:case 28:
      return constant.bundlrTestUrl;
  }

  return constant.bundlrUrl;
}

//get contract address
const getContractAddress = (chainId: number, currency: string) => {
  switch(currency){
    case 'BOBA':
      switch(chainId){
        case 28:
          return constant.bobaTestContractAddress;
      }
  }

  return '';
}

//get bunldr currency by chain id
export const getBundlrCurrency = (chainId:number, currency: string) => {
  switch(chainId){
    case 1:case 3:case 4:case 5:case 42:
      switch(currency){
        case 'ETH':
          return 'ethereum';
        default:
          return 'ethereum';
      }
    case 56:
      switch(currency){
        case 'BNB':
          return 'bnb';
        default:
          return 'bnb';
      }
    case 137:case 80001:
      switch(currency){
        case 'MATIC':
          return 'matic';
        default:
          return 'matic';
      }
    case 250:
      switch(currency){
        case 'FTM':
          return 'fantom';
        default:
          return 'fantom';
      }
    case 288:case 28:
      switch(currency){
        case "ETH":
          return "boba-eth";
        case 'BOBA':
          return 'boba'
        default:
          return "boba";
      }
    case 588:case 1088:
      switch(currency){
        case 'METIS':
          return 'metis';
        default:
          return 'metis';
      }      
    case 43114:
      switch(currency){
        case 'ETH':
          return 'avalanche';
        default:
          return 'avalanche';
      }
    case 42161:
      switch(currency){
        case 'ETH':
          return 'arbitrum';
        default:
          return 'arbitrum';
      }
  }

  return '';
}

//get provider url
const getProviderUrl = (chainId: number) => {
  for (const i in constant.chainList){
    if(constant.chainList[i].chainId === chainId){
      return constant.chainList[i].rpcUrls;
    }
  }

  return '';  
}

//init bundlr
export const getBunldr = async () => {
  await connect.networkConnect();

  if (connect.connectState.bundlrProvider != null && connect.connectState.bundlrProvider != undefined){
    return connect.connectState.bundlrProvider;
  }

  //opts main for test network
  const opts = {
    providerUrl: getProviderUrl(connect.connectState.chainId),
    contractAddress: getContractAddress(connect.connectState.chainId, connect.connectState.currency),
  };

  //get currency
  const currency = getBundlrCurrency(connect.connectState.chainId, connect.connectState.currency);

  const bunldr = new WebBundlr(
    getBundlrNetwork(connect.connectState.chainId), 
    currency,
    connect.connectState.provider,
    opts,
  );

  await bunldr.ready();

  connect.connectState.bundlrProvider = bunldr;

  return bunldr;

};

//get bundlr account balance
export const getLoadedBalance = async () => {
  const currentbunldr = await getBunldr();

  if (currentbunldr==null){
    throw new Error(`Init bundlr failed!`);
  }

  const balance = await currentbunldr.getLoadedBalance();
  const converted = currentbunldr.utils.unitConverter(balance);

  return converted;
};

//get bundlr account balance by address
export const getBalance = async (address:string) => {
  const currentbunldr = await getBunldr();

  if (currentbunldr==null){
    throw new Error(`Init bundlr failed!`);
  }

  const balance = await currentbunldr.getBalance(address);
  const converted = currentbunldr.utils.unitConverter(balance);

  return converted;  
};

//get price for n bytes
export const getPrice = async (n:number) => {
  const currentbunldr = await getBunldr();

  if (currentbunldr==null){
    throw new Error(`Init bundlr failed!`);
  }

  n = Math.floor(n);
  if (n <= 0){
    throw new Error(`n must be larger than 0!`);
  }

  const price = await currentbunldr.getPrice(n);
  const converted = currentbunldr.utils.unitConverter(price);

  return converted;
};

//top up your bundlr account
export const fund = async (price:number) => {
  const currentbunldr = await getBunldr();

  if (currentbunldr==null){
    throw new Error(`Init bundlr failed!`);
  }

  if(price <= 0){
    throw new Error(`funds must be larger than 0!`);
  }

  const converted = utils.parseEther(String(price));
  const res = await currentbunldr.fund(converted.toString());

  return res;
};

//withdraw balance from your bundlr account
export const withdrawBalance = async (price:number) => {
  const currentbunldr = await getBunldr();

  if (currentbunldr==null){
    throw new Error(`Init bundlr failed!`);
  }

  const balance = await getLoadedBalance();

  if(price > balance.toNumber()){
    price = balance.toNumber();
  }

  const converted = utils.parseEther(String(price));
  const res = await currentbunldr.withdrawBalance(converted.toString());

  return res;
};

//upload file to arweave through bundlr
export const uploadFile = async (file: any) => {
  return await uploadFolder(file.name, [file]);
}

//upload folder to arweave through bundlr
export const uploadFolder = async (dirPath: string, files: any[]) => {
  const currentbunldr = await getBunldr();

  if (currentbunldr == null){
    throw new Error(`Init bundlr failed!`);
  }

  if (files.length === 0){
   throw new Error(`no files selected to upload!`); 
  }

  //files list for the dir
  const manifest = {
    manifest: "arweave/paths",
    version: "0.1.0",
    paths: Object(),
    index: {
      path: '',
    },
  };  

  //upload file one by one, that is fool!!!
  for (const i in files) {
    const tags = [{ name: "Content-Type", value: fileType(files[i].name)}];

    const data = await files[i].raw.arrayBuffer();

    const tx =  currentbunldr.createTransaction(data, { tags });

    await tx.sign();

    const res = await tx.upload();

    if(files.length === 1 && ((files[0].raw) as any).webkitRelativePath === ''){
      return res.data.id;
    }

    const relpath = ((files[i].raw) as any).webkitRelativePath.split(path.sep).slice(1,).join(path.sep);

    if(relpath === 'index.html') {
      manifest.index.path = relpath;
    }

    manifest.paths[relpath] = {id: res.data.id};
  }

  //upload the manifest file, which contains the files info of the dir
  const tags = [{ name: "Type", value: "manifest" }, { name: "Content-Type", value: "application/x.arweave-manifest+json" }];

  const data = JSON.stringify(manifest);

  const tx =  currentbunldr.createTransaction(data, { tags });
  await tx.sign();

  const res = await tx.upload();

  return res.data.id;
}


