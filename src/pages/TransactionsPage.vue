<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="Transactions" name="transactions"></el-tab-pane>
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
          <el-col :span="11">
            <el-input size="large" v-model="contractContent" placeholder="" style="margin-top: 10px;">
              <template #prepend>Contract</template>
            </el-input>
          </el-col>                                    
          <el-col :span="1">
            <el-button circle type="primary" size="large" style="margin-top: 10px;" @click="handleClick">
              <el-icon :size="20"><search /></el-icon>
            </el-button>
          </el-col>            
        </el-row>  
        <el-row>
          <table v-if="activeName === 'transactions'">
            <thead>
              <th width="150px">Tx</th>
              <th width="380px">From</th>
              <th width="380px">To</th>
              <th width="150px">Value (USD)</th>
              <th width="50px">Success</th>
              <th width="200px">Timestamp</th>
            </thead>
            <tbody>
              <template v-for="item in tokenList" :key="item.tx">
                <tr>
                  <td>
                    <el-link :href="txExplorerUrl(item.tx)" type="primary" target="_blank">{{tools.shortString(item.tx)}}</el-link>
                    <el-icon @click="onClickToCopy(item.tx)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>
                    <el-link :href="addressExplorerUrl(item.from)" type="primary" target="_blank">{{item.from}}</el-link>
                    <el-icon @click="onClickToCopy(item.from)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>
                    <el-link :href="addressExplorerUrl(item.to)" type="primary" target="_blank">{{item.to}}</el-link>
                    <el-icon @click="onClickToCopy(item.to)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>{{item.value}}</td>
                  <td>{{item.success}}</td>
                  <td>{{item.timestamp}}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </el-row>
      </el-main>
      <el-footer>
        <div>
          <el-button type="primary" style="margin-top: 10px;" @click="onHandlePrev">Prev
          </el-button>
          <el-button type="primary" style="margin-top: 10px;" @click="onHandleNext" :disabled="!hasMore">Next
          </el-button>          
      </div>
      </el-footer>
    </el-container>
  </div> 

</template>

<script lang="ts">
export default {
  name: 'TransactionsPage',
  props: {
  }
}
</script>

<script setup lang="ts">
import { ref } from "vue"
import Resolution from "@unstoppabledomains/resolution";

import * as covalent from "../libs/covalent"
import * as tools from "../libs/tools"
import { connected, connectState, networkConnect } from "../libs/connect"
import * as element from "../libs/element"
import * as constant from "../constant"

const addressContent = ref('');
const contractContent = ref('');
const resolution = new Resolution();
const userAddr = connectState.userAddr;

const activeName = connectState.activeName;
const loadStatus = ref(false);
const pageSize = ref(10);
const currentPage = ref(0);
const tokenList = ref(new Array());
const hasMore = ref(false);

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

//tx explore url
const txExplorerUrl = (address:string, tokenId:string = '') => {
  for(const i in constant.chainList){
    if(connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      return `${blockExplorerUrls}/tx/${address}`
    }
  }

  return address;
}

//address explore url
const addressExplorerUrl = (address:string) => {
  for(const i in constant.chainList){
    if(connectState.chainId === constant.chainList[i].chainId){
      const blockExplorerUrls = constant.chainList[i].blockExplorerUrls;
      return `${blockExplorerUrls}/address/${address}`
    }
  }

  return address;
}

//on click to copy address
const onClickToCopy = async (content:string) => {
  tools.clickToCopy(content);
  
  element.elMessage('success', 'Copy ' + content + ' to clipboard success.');     
};

//get total tokens count and pull tokens info
const getTokenCount = async () => {
  await networkConnect();

  let address = addressContent.value.trim();
 
  if(address === ''){
    address = userAddr.value;
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

  let contract = contractContent.value.trim();
  if(contract != ''){
    try{
      contract = await resolution.addr(contract);
    }catch(e){
      try{
        contract = await connectState.provider.resolveName(contract);
      }catch(e){
        contract = null;
      }
      if(contract === undefined || contract === null || contract === ''){
        element.elMessage('error', 'Invalid contract input!');
        return;
      } else {
        contract = contract.trim().toLowerCase();
      }
    }      
  }

  const chainId = connectState.chainId;
  let res;

  if(contract === ''){
    res = await covalent.getTransactionsForAddress(chainId, address, pageSize.value, currentPage.value);
  }else{
    res = await covalent.getErc20TokenTransfersForAddress(chainId, address, contract, pageSize.value, currentPage.value);
  }

  hasMore.value = res.hasMore;

  const newTokenList = new Array();

  for(let i = res.data.length -1; i >= 0; i--){
    const item = res.data[i];

    newTokenList.push({
      tx: item.tx_hash,
      from: item.from_address,
      to: item.to_address,
      value: item.value_quote.toPrecision(6),
      timestamp: item.block_signed_at,
      success: item.successful,
    });
  }

  tokenList.value = newTokenList;
}

const onHandlePrev = async () => {
  if(currentPage.value > 0){
    currentPage.value--;
  }

  handleClick();
}

const onHandleNext = async () => {
  if(hasMore.value){
    currentPage.value++;
  }
  handleClick();
}

//click to change active item and refresh page
const handleClick = async () => {

  connectState.activeName.value = activeName.value;
  tools.setUrlParamter('activeName', activeName.value);

  try{

    loadStatus.value = true;

    if (!(await connected())){
      tokenList.value = new Array();
      return;
    }    

    await getTokenCount();

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

  if(activeName.value != 'transactions'){

    activeName.value = 'transactions';
  }
}catch(e){
  activeName.value = 'transactions';
}

//update page
handleClick();
</script>