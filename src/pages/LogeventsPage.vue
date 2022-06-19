<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="LogEvents" name="logevents"></el-tab-pane>
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
          <el-col :span="4">
            <el-input size="large" v-model="blockStart" placeholder="" type="number" style="margin-top: 10px;">
              <template #prepend>BlockStart</template>
            </el-input>
          </el-col>    
          <el-col :span="4">
            <el-input size="large" v-model="blockEnd" placeholder="" type="number" style="margin-top: 10px;">
              <template #prepend>BlockEnd</template>
            </el-input>
          </el-col>                                                      
          <el-col :span="1">
            <el-button circle type="primary" size="large" style="margin-top: 10px;" @click="handleClick">
              <el-icon :size="20"><search /></el-icon>
            </el-button>
          </el-col>            
        </el-row>  
        <el-row>
          <table v-if="activeName === 'logevents'">
            <thead>
              <th width="150px">Tx</th>
              <th width="380px">Sender</th>
              <th width="400px">LogEvent</th>
              <th width="100px">BlockHeight</th>
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
                    <el-link :href="addressExplorerUrl(item.sender)" type="primary" target="_blank">{{item.sender}}</el-link>
                    <el-icon @click="onClickToCopy(item.sender)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td><h4 style="word-break:break-all;">{{item.log}}</h4></td>
                  <td>{{item.block}}</td>
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
  name: 'LogeventsPage',
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
const blockStart = ref(-1);
const blockEnd = ref(-1);
const resolution = new Resolution();

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

  let contract = contractContent.value.trim();
  if(contract === ''){
    contract = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  }
  
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

  const chainId = connectState.chainId;

  let start = blockStart.value;
  let end = blockEnd.value;

  if(end < 0){
    const res = await covalent.getBlock(chainId, 'latest');
    end = res[0].height;
  }

  if(start < 0){
    start = end - 100000 > 0 ? end - 100000 : 0;
  }

  if(start > end){
    start = end;
  }
  
  const res = await covalent.getLogEventsByContractAddress(chainId, contract, start, end, pageSize.value, currentPage.value);
  
  hasMore.value = res.hasMore;

  const newTokenList = new Array();

  for(let i = res.data.length -1; i >= 0; i--){
    const item = res.data[i];

    const params = [];
    for(let j = 0; j < item.decoded.params.length; j++){
      const value = item.decoded.params[j].value;
      if(typeof(value) != 'number'){
        params.push(`"${value}"`);
      }else{
        params.push(value);
      }
    }

    newTokenList.push({
      tx: item.tx_hash,
      sender: item.sender_address,
      block: item.block_height,
      timestamp: item.block_signed_at,
      signature: item.decoded.signature,
      log: `${item.decoded.name}(${params.join(" ,")})`,
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

  if(activeName.value != 'logevents'){

    activeName.value = 'logevents';
  }
}catch(e){
  activeName.value = 'logevents';
}

//update page
handleClick();
</script>