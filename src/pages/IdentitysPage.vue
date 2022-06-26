<template>
  <div class="file-arae">
    <el-container>
      <el-header style="background-color: #ffffff;">
        <el-tabs v-model="activeName" class="file-tabs" @tab-click="handleClick">
          <el-tab-pane label="Identitys" name="identitys"></el-tab-pane>
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
          <el-col :span="3">
            <el-link href="https://passport.gitcoin.co/" target="_blank" style="margin-top: 13px;">
              <el-image :src="gitpassportLogo"></el-image>
            </el-link>
          </el-col>
        </el-row>  
        <el-row>
          <table>
            <thead>
              <th width="380px">Address</th>
              <th width="150px">Provider</th>
              <th width="150px">PassportScore</th>
              <th width="280px">IssuanceDate</th>
              <th width="280px">ExpirationDate</th>
            </thead>
            <tbody>
              <template v-for="item in tokenList" :key="item.contract">
                <tr>
                  <td>
                    <el-link :href="tokenExplorerUrl(item.address)" type="primary" target="_blank">{{item.address}}</el-link>
                    <el-icon @click="onClickToCopy(item.address)" style="margin-left: 3px;"><document-copy /></el-icon>
                  </td>
                  <td>{{item.name}}</td>
                  <td>{{item.score}}</td>
                  <td>{{item.issuanceDate}}</td>
                   <td>{{item.expirationDate}}</td>
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
import { ref } from "vue"
import { PassportReader } from '@gitcoinco/passport-sdk-reader'
// import { PassportScorer } from '@gitcoinco/passport-sdk-scorer';

import Resolution from "@unstoppabledomains/resolution";
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

const gitpassportLogo = require('@/assets/passportLogoBlack.svg');

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

//on click to copy address
const onClickToCopy = async (content:string) => {
  tools.clickToCopy(content);
  
  element.elMessage('success', 'Copy ' + content + ' to clipboard success.');     
};

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

  const newTokenList = new Array();

  const chainId = connectState.chainId;

  const passportReader = new PassportReader(constant.CeramicApiHost, chainId);

  const res = await passportReader.getPassport(address);

  if (res === false){
    tokenList.value = newTokenList;
    tokenTotal.value = 0;
    return;
  }

  for(let i = res.stamps.length -1; i >= 0; i--){
    const item = res.stamps[i]; 
    
    if(connectState.search === '' ||
      item.provider.indexOf(connectState.search) != -1 ||
      item.provider.toLowerCase().indexOf(connectState.search) != -1 ) {

      newTokenList.push({
        name: item.provider,
        issuer: item.credential.issuer,
        proof: item.credential.proof,
        issuanceDate: item.credential.issuanceDate,
        expirationDate: item.credential.expirationDate,
        address: address,
        score: 0,
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

    // for (const i in tokenList.value){
    //   try{
    //     const pass = tokenList.value[i];
    //     const scorer = new PassportScorer([{
    //       provider: pass.name,
    //       issuer: pass.issuer,
    //       score: 0.5,
    //     }], constant.CeramicApiHost, connectState.chainId);

    //      tokenList.value[i].score = await scorer.getScore(pass.address);
    //   }catch(e){
    //     continue;
    //   }
    // }

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

  if(activeName.value != 'identitys'){

    activeName.value = 'identitys';
  }
}catch(e){
  activeName.value = 'identitys';
}

//update page
handleClick();
</script>