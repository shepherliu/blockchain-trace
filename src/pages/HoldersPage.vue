<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="Holers" name="holders"></el-tab-pane>
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
            <el-input size="large" v-model="contractContent" placeholder="0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" style="margin-top: 10px;">
              <template #prepend>Contract</template>
            </el-input>
          </el-col>
          <el-col :span="6" v-if="activeName === 'holders'">
            <el-input size="large" v-model="blockHeight" type="number" style="margin-top: 10px;">
              <template #prepend>BlockHeight</template>
            </el-input>
          </el-col>                            
          <el-col :span="1">
            <el-button circle type="primary" size="large" style="margin-top: 10px;" @click="handleClick">
              <el-icon :size="20"><search /></el-icon>
            </el-button>
          </el-col>            
        </el-row>  
        <el-row>
          <table v-if="activeName === 'holders'">
            <thead>
              <th width="150px">Name</th>
              <th width="380px">Address</th>
              <th width="150px">Balance</th>
              <th width="150px">TotalSupply</th>
              <th width="150px">Decimals</th>
              <th width="150px">BlockHeight</th>
            </thead>
            <tbody>
              <template v-for="item in tokenList" :key="item.contract">
                <tr>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.contract)" type="primary" target="_blank">{{item.name}}</el-link>
                  </td>
                  <td>
                    <el-link :href="addressExplorerUrl(item.address)" type="primary" target="_blank">{{item.address}}</el-link>
                    <el-icon @click="onClickToCopy(item.address)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>{{item.balance}}</td>
                  <td>{{item.total}}</td>
                  <td>{{item.decimals}}</td>
                  <td>{{item.block}}</td>
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
  name: 'HoldersPage',
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

const contractContent = ref('');
const resolution = new Resolution();
const blockHeight = ref(-1);

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

  let address = contractContent.value.trim();
 
  if(address === ''){
    address = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
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

  const res = await covalent.getTokenHoldersForBlockHeight(chainId, address, blockHeight.value, pageSize.value, currentPage.value);

  hasMore.value = res.hasMore;

  const newTokenList = new Array();

  for(let i = res.data.length -1; i >= 0; i--){
    const item = res.data[i];  

    if(item.balance === null || parseInt(item.balance) === 0){
      continue;
    }

    newTokenList.push({
      name: item.contract_ticker_symbol,
      address: item.address,
      balance: (parseFloat(item.balance)/Math.pow(10, parseInt(item.contract_decimals))).toPrecision(6),
      decimals: item.contract_decimals,
      total: (parseFloat(item.total_supply)/Math.pow(10, parseInt(item.contract_decimals))).toPrecision(6),
      block: item.block_height,
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

  if(activeName.value != 'holders'){

    activeName.value = 'holders';
  }
}catch(e){
  activeName.value = 'holders';
}

//update page
handleClick();
</script>