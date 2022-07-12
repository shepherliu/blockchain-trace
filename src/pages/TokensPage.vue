<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="Tokens" name="tokens"></el-tab-pane>
          <el-tab-pane label="Nfts" name="nfts"></el-tab-pane>
        </el-tabs>
      </el-header>
      <el-main
        style="height: 450px;" 
        v-loading="loadStatus"
        element-loading-text="Loading..."
        :element-loading-spinner="svg"
        element-loading-svg-view-box="-10, -10, 50, 50"
        element-loading-background="#ffffff"
      >
        <el-row :gutter="20">
          <el-col :span="11">
            <el-input size="large" v-model="addressContent" :placeholder="userAddr" style="margin-top: 10px;">
              <template #prepend>Address</template>
            </el-input>
          </el-col>
          <el-col :span="1">
            <el-button circle type="primary" size="large" style="margin-top: 10px;" @click="handleClick">
              <el-icon :size="20"><search /></el-icon>
            </el-button>
          </el-col>            
        </el-row>  
        <el-row>
          <table v-if="activeName === 'tokens'">
            <thead>
              <th width="150px">Name</th>
              <th width="380px">Contract</th>
              <th width="150px">Balance</th>
              <th width="150px">Decimals</th>
              <th width="150px">Price (USD)</th>
              <th width="150px">Operation</th>
            </thead>
            <tbody>
              <template v-for="item in tokenList" :key="item.contract">
                <tr>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.contract)" type="primary" target="_blank">{{item.name}}<el-image :src="item.logo" style="width: 25px;"></el-image></el-link>
                  </td>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.contract)" type="primary" target="_blank">{{item.contract}}</el-link>
                    <el-icon @click="onClickToCopy(item.contract)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>{{item.balance}}</td>
                  <td>{{item.decimals}}</td>
                  <td>{{item.price}}</td>
                  <td><el-link href="javascript:void(0);" type="primary" @click="sendToken(item.name, item.contract, item.balance, item.decimals)">send</el-link></td>
                </tr>
              </template>
            </tbody>
          </table>
          <table v-if="activeName === 'nfts'">
            <thead>
              <th width="150px">Name</th>
              <th width="380px">Contract</th>
              <th width="150px">Balance</th>
              <th width="150px">tokenId</th>
              <th width="150px">TokenUrl</th>
              <th width="150px">Price (ETH)</th>
              <th width="150px">Operation</th>
            </thead>
            <tbody>
              <template v-for="item in tokenList" :key="item.contract">
                <tr>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.contract)" type="primary" target="_blank">{{item.name}}<el-image :src="item.logo" style="width: 25px;"></el-image></el-link>
                  </td>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.contract)" type="primary" target="_blank">{{item.contract}}</el-link>
                    <el-icon @click="onClickToCopy(item.contract)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>{{item.balance}}</td>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.contract, item.tokenId)" type="primary" target="_blank">{{item.tokenId}}</el-link>
                    <el-icon @click="onClickToCopy(item.tokenId)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td v-if="item.url"><el-link :href="item.url" type="primary" target="_blank">url</el-link></td>
                  <td v-if="item.url === null"></td>
                  <td>{{item.price}}</td>
                  <td><el-link href="javascript:void(0);" type="primary" @click="sendNftToken(item.name, item.contract, item.tokenId)">send</el-link></td>
                </tr>
              </template>
            </tbody>
          </table>          
        </el-row>
      </el-main>
      <el-footer>
        <div>
          <el-pagination
            background
            layout="total, prev, pager, next"
            v-model:currentPage="currentPage"
            :total="tokenTotal"
            :page-size="pageSize"
            style="float: right;"
             @current-change="handleClick"
          />
      </div>
      </el-footer>
    </el-container>
  </div> 

</template>

<script lang="ts">
export default {
  name: 'TokensPage',
  props: {
  }
}
</script>

<script setup lang="ts">
import { h, ref } from "vue"
import Resolution from "@unstoppabledomains/resolution";
import { utils, Contract } from "ethers"

import * as covalent from "../libs/covalent"
import * as tools from "../libs/tools"
import { connected, connectState, networkConnect } from "../libs/connect"
import * as element from "../libs/element"
import * as constant from "../constant"

const addressContent = ref('');
const userAddr = connectState.userAddr;
const resolution = new Resolution();

const activeName = connectState.activeName;
const loadStatus = ref(false);
const pageSize = ref(10);
const currentPage = ref(0);
const tokenTotal = ref(0);
const tokenList = ref(new Array());

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `;

//address explore url
const tokenExplorerUrl = (address:string, tokenId:string = '') => {
  for(const i in constant.chainList){
    if(connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      if(tokenId != ''){
        return `${blockExplorerUrls}/token/${address}?a=${tokenId}#inventory`
      }
      return `${blockExplorerUrls}/token/${address}`
    }
  }

  return address;
}

//transaction explore url
const transactionExplorerUrl = (transaction:string) => {
  for(const i in constant.chainList){
    if(connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      return blockExplorerUrls + '/tx/' + transaction;
    }
  }

  return transaction;
}

//on click to copy address
const onClickToCopy = async (content:string) => {
  tools.clickToCopy(content);
  
  element.elMessage('success', 'Copy ' + content + ' to clipboard success.');     
};

//on click to send token 
const sendToken = (contractName:string, contractAddress:string, balance:string, decimals:string) => {
  const opts = {
    message: '',
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
    inputType: 'text',
    inputValue: '',
    inputPlaceholder: '0x0000000000000000000000000000000000000000',
    inputErrorMessage: 'Invalid address',
  };

  opts.message =  h('p', null, [
    h('p', null, 'Please enter address to send the Token:'),
    h('p', { style: 'color: teal' }, `name: ${contractName}`),
    h('p', { style: 'color: teal' }, `contract: ${contractAddress}`),
  ]);  

  element.elMessageBox('Please enter address to send the Token:', 'Send Token', opts, async (name:string) => {

    name = name.trim().toLowerCase();

    let address = name;

    if(address === undefined ||
      address === null ||
      address === '' ||
      address === '0' ||
      address === '0x' ||
      address.match('0x0{1,}$') != null || 
      address === '0x000000000000000000000000000000000000dead'){
  
      name = "0x0000000000000000000000000000000000000000";
    }    

    try{
      address = await resolution.addr(name, "ETH");
    }catch(e){

      try{
        address = await connectState.provider.resolveName(name);
      }catch(e){
        address = null;
      }
    }

    if(address === undefined || address === null || address === ''){
      element.elMessage('error', 'Invalid address input!');
      return;
    } else {
      address = address.trim().toLowerCase();
    }

    return sendErc20Token(contractName, contractAddress, name, address, balance, decimals);

  });  
}

//send erc20 tokens to a address
const sendErc20Token = async (contractName:string, contractAddress:string, name:string, address:string, balance:string, decimals:string) => {
  //enter amount to send
  const opts = {
    message: '',
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
    inputType: 'number',
    inputValue: balance,
    inputPlaceholder: balance,
    inputValidator: (amount:number) => {return amount<= parseFloat(balance);},
    inputErrorMessage: 'Invalid amount',
  };

  if(name === address){
    opts.message =  h('p', null, [
      h('p', null, 'Please enter amount to send the Token:'),
      h('p', { style: 'color: teal' }, `name: ${contractName}`),
      h('p', { style: 'color: teal' }, `contract: ${contractAddress}`),
      h('p', { style: 'color: teal' }, `send user: `),
      h('p', { style: 'color: teal' }, address),          
    ]); 
  }else{
    opts.message =  h('p', null, [
      h('p', null, 'Please enter amount to send the Token:'),
      h('p', { style: 'color: teal' }, `name: ${contractName}`),
      h('p', { style: 'color: teal' }, `contract: ${contractAddress}`),
      h('p', { style: 'color: teal' }, `send user: ${name}`),
      h('p', { style: 'color: teal' }, address),        
    ]);       
  }

  element.elMessageBox('Please enter amount to send the Token:', 'Send Token', opts, async (amount:number) => {
    amount = parseFloat(amount);

    try{
      await networkConnect();

      if(contractAddress === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'){
        const transaction = {
          to: address,
          value: utils.parseUnits(String(amount), parseInt(decimals)),
          chainId: connectState.chainId,
        };

        const tx = await connectState.signer.sendTransaction(transaction);
        await tx.wait();

        connectState.transactions.value.unshift(tx.hash);
        connectState.transactionCount.value++;

        const msg = `<div><span>Send success! Transaction: </span><a href="${transactionExplorerUrl(tx.hash)}" target="_blank">${tx.hash}</a></div>`

        element.elMessage('success', msg, true);    

        handleClick();         
      }else{
        const abi = ["function transfer(address to, uint256 amount)"];
        const contract = new Contract(contractAddress, abi, connectState.signer); 

        const tx = await contract.transfer(address, utils.parseUnits(String(amount), parseInt(decimals)));
        await tx.wait();

        connectState.transactions.value.unshift(tx.hash);
        connectState.transactionCount.value++;

        const msg = `<div><span>Send success! Transaction: </span><a href="${transactionExplorerUrl(tx.hash)}" target="_blank">${tx.hash}</a></div>`

        element.elMessage('success', msg, true);    

        handleClick();         
      }
    }catch(e){
      element.alertMessage(e);
    }
  });
}

//on click to send nft token
const sendNftToken = (contractName:string, contractAddress:string, tokenId:string) => {
  const opts = {
    message: '',
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
    inputType: 'text',
    inputValue: '',
    inputPlaceholder: '0x0000000000000000000000000000000000000000',
    inputErrorMessage: 'Invalid address',
  };

  opts.message =  h('p', null, [
    h('p', null, 'Please enter address to send the NFT:'),
    h('p', { style: 'color: teal' }, `name: ${contractName}`),
    h('p', { style: 'color: teal' }, `contract: ${contractAddress}`),
  ]);  

  element.elMessageBox('Please enter address to send the NFT:', 'Send NFT', opts, async (name:string) => {

    name = name.trim().toLowerCase();

    let address = name;

    if(address === undefined ||
      address === null ||
      address === '' ||
      address === '0' ||
      address === '0x' ||
      address.match('0x0{1,}$') != null || 
      address === '0x000000000000000000000000000000000000dead'){
  
      name = "0x0000000000000000000000000000000000000000";
    }    

    try{
      address = await resolution.addr(name, "ETH");
    }catch(e){

      try{
        address = await connectState.provider.resolveName(name);
      }catch(e){
        address = null;
      }
    }

    if(address === undefined || address === null || address === ''){
      element.elMessage('error', 'Invalid address input!');
      return;
    } else {
      address = address.trim().toLowerCase();
    }
    
    return sendNFT(contractName, contractAddress, name, address, tokenId);

  });
}

//send a nft to a given address
const sendNFT = (contractName:string, contractAddress:string, name:string, address:string, tokenId:string) => {

  const opts = {
    message: '',
    confirmButtonText: 'Send',
    cancelButtonText: 'Cancel',
  };

  if(name === address){
    opts.message =  h('p', null, [
      h('p', null, `Are you sure to send the NFT of ID ${tokenId} ?`),
      h('p', { style: 'color: teal' }, `name: ${contractName}`),
      h('p', { style: 'color: teal' }, `contract: ${contractAddress}`),
      h('p', { style: 'color: teal' }, 'send user: '),
      h('p', { style: 'color: teal' }, address),
    ]);
  }else{
    opts.message =  h('p', null, [
      h('p', null, `Are you sure to send the NFT of ID ${tokenId} ?`),
      h('p', { style: 'color: teal' }, `name: ${contractName}`),
      h('p', { style: 'color: teal' }, `contract: ${contractAddress}`),      
      h('p', { style: 'color: teal' }, `send user: ${name}`),
      h('p', { style: 'color: teal' }, address),
    ]);
  }

  element.elMessageConfirm(`Are you sure to send the NFT of ID ${tokenId} ?`, 'Send NFT', opts, async () => {
    try{
      await networkConnect();

      const abi = ["function transferFrom(address from, address to, uint256 tokenId)"];
      const contract = new Contract(contractAddress, abi, connectState.signer);
      const tx = await contract.transferFrom(connectState.userAddr.value, address, parseInt(tokenId));
      await tx.wait();

      connectState.transactions.value.unshift(tx.hash);
      connectState.transactionCount.value++;

      const msg = `<div><span>Send success! Transaction: </span><a href="${transactionExplorerUrl(tx.hash)}" target="_blank">${tx.hash}</a></div>`

      element.elMessage('success', msg, true);    

      handleClick();      
    }catch(e){
      element.alertMessage(e);
    }
  });  
}

//get total tokens count and pull tokens info
const getTokenCount = async () => {
  await networkConnect();

  let address = addressContent.value;
 
  if(address === ''){
    address = connectState.userAddr.value;
  }

  try{
    address = await resolution.addr(address, "ETH");
  }catch(e){
    try{
      address = await connectState.provider.resolveName(address);
    }catch(e){
      address = null;
    }
  }

  if(address === undefined || address === null || address === ''){
    element.elMessage('error', 'Invalid address input!');
    return;
  } else {
    address = address.trim().toLowerCase();
  }

  const chainId = connectState.chainId;

  const res = await covalent.getTokenBalancesForAddress(chainId, address, false);

  const newTokenList = new Array();

  for(let i = res.length -1; i >= 0; i--){
    const item = res[i];

    if(item.type === 'nft'){
      continue;
    }      

    if(item.balance === null || parseInt(item.balance) === 0){
      continue;
    }
    
    if(connectState.search === '' ||
      item.contract_ticker_symbol.indexOf(connectState.search) != -1 ||
      item.contract_ticker_symbol.toLowerCase().indexOf(connectState.search) != -1 ||
      item.contract_address.toLowerCase().indexOf(connectState.search) != -1 ||
      item.contract_address.search(connectState.search) != -1) {

      newTokenList.push({
        name: item.contract_ticker_symbol,
        contract: item.contract_address,
        balance: (parseFloat(item.balance)/Math.pow(10, parseInt(item.contract_decimals))).toPrecision(6),
        decimals: item.contract_decimals,
        logo: item.logo_url,
        price: item.quote_rate ? item.quote_rate : 0,
      });
    }
  }

  tokenList.value = newTokenList.sort((a:{name:string}, b:{name:string}) => {
    if(a.name < b.name){
      return -1;
    }else if(a.name > b.name){
      return 1;
    }else{
      return 0;
    }
  });

  tokenTotal.value = tokenList.value.length;
}

//get total nfts count and pull tokens info
const getNftCount = async () => {
  await networkConnect();

  let address = addressContent.value;
 
  if(address === ''){
    address = connectState.userAddr.value;
  }

  try{
    address = await resolution.addr(address, "ETH");
  }catch(e){
    try{
      address = await connectState.provider.resolveName(address);
    }catch(e){
      address = null;
    }
  }

  if(address === undefined || address === null || address === ''){
    element.elMessage('error', 'Invalid address input!');
    return;
  } else {
    address = address.trim().toLowerCase();
  }

  const chainId = connectState.chainId;

  const res = await covalent.getTokenBalancesForAddress(chainId, address, true);

  const newTokenList = new Array();

  for(let i = res.length -1; i >= 0; i--){
    const item = res[i];

    if(item.type != 'nft'){
      continue;
    }      

    if(item.balance ===null || parseInt(item.balance) === 0){
      continue;
    }
    
    if(connectState.search === '' ||
      item.contract_ticker_symbol.indexOf(connectState.search) != -1 ||
      item.contract_ticker_symbol.toLowerCase().indexOf(connectState.search) != -1 ||
      item.contract_address.toLowerCase().indexOf(connectState.search) != -1 ||
      item.contract_address.search(connectState.search) != -1) {

      for(let j = 0; j < item.nft_data.length; j++){
        if(item.nft_data[j].token_balance === null || parseInt(item.nft_data[j].token_balance) === 0){
          continue;
        }
        newTokenList.push({
          name: item.contract_ticker_symbol,
          contract: item.contract_address,
          logo: item.logo_url,
          balance: item.nft_data[j].token_balance,
          tokenId: item.nft_data[j].token_id,
          price: item.nft_data[j].token_quote_rate_eth ? item.nft_data[j].token_quote_rate_eth : 0,
          url: item.nft_data[j].token_url,
        });
      }

    }
  }

  tokenList.value = newTokenList.sort((a:{name:string}, b:{name:string}) => {
    if(a.name < b.name){
      return -1;
    }else if(a.name > b.name){
      return 1;
    }else{
      return 0;
    }
  });

  tokenTotal.value = tokenList.value.length;
}

//click to change active item and refresh page
const handleClick = async () => {
  //wait for the active name change
  await tools.sleep(100);  

  connectState.activeName.value = activeName.value;
  tools.setUrlParamter('activeName', activeName.value);

  try{

    loadStatus.value = true;

    if (!(await connected())){
      tokenList.value = new Array();
      return;
    }    

    if(activeName.value === 'tokens'){
      await getTokenCount();
    }else{
      await getNftCount();
    }

    if(currentPage.value < 1){
      currentPage.value = 1;
    }

    let totalPage = Math.floor(tokenTotal.value/pageSize.value);

    if((tokenTotal.value%pageSize.value)!=0){
      totalPage += 1;
    }

    if(currentPage.value > totalPage){
      currentPage.value = totalPage;
    }

    let start = (currentPage.value-1) * pageSize.value;
    let end = currentPage.value * pageSize.value;

    if(start < 0){
      start = 0;
    }

    if(end > tokenTotal.value){
      end = tokenTotal.value;
    }

    tokenList.value = tokenList.value.slice(start, end);

  }catch(e){
     tokenList.value = new Array();
  }finally{
    loadStatus.value = false;
  }

}

//clean search content and bind search callback function
connectState.search = '';
connectState.searchCallback = handleClick;

//try get activeName from the url paramter
try{
  activeName.value = tools.getUrlParamter('activeName');

  if(activeName.value != 'tokens' && 
    activeName.value != 'nfts'){

    activeName.value = 'tokens';
  }
}catch(e){
  activeName.value = 'tokens';
}

//update page
handleClick();
</script>