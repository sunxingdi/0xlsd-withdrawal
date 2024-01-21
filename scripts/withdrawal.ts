import { ethers } from "hardhat";

console.log("\n", "ethers version: ", ethers.version);

import {
    PRIVATE_KEY
} from "../hardhat.config";

const privateKey = PRIVATE_KEY; 

async function main() {

    console.log("###############################################################")
    console.log("\n", "处理消息...")
    
    // //案例1：https://bscscan.com/tx/0x120be12320d222acd7d7c679304cec669265d30197fdff90ae306e0603d3d00c
    // let _contractAddr = '0x2bB76Ce97BC26b022401570573253863eA644d92'; //合约地址
    // let _id = 71061; //交互ID，可能从前端传入
    // let _nonce = 0;  //提现次数，变量：_orderincomenonce/_teamincomenonce/_principalnonce;
    // let _strfix = "TEAM_INCOME"; //固定字符串标识
    // let _tokenIn = '0x55d398326f99059ff775485246999027b3197955'; //BSC-USD
    // let _amount = '17915000000000000000'; //提现金额
    // let _feeNum = '1000000000000000000';  //手续费
    // let _recive = '0x8a1d3fa38391621855b805Fa352895947A7364C0'; //提现收款地址

    //案例2：https://bscscan.com/tx/0x5af20eca2c9eccb78dc02f28c1e44a8e66de529f1eb1df1f4ad567a32a7bc309
    let _contractAddr = '0x2bB76Ce97BC26b022401570573253863eA644d92'; //合约地址
    let _id = 66515; //交互ID，可能从前端传入
    let _nonce = 0;  //提现次数，变量：_orderincomenonce/_teamincomenonce/_principalnonce;
    let _strfix = "TEAM_INCOME"; //固定字符串标识
    let _tokenIn = '0x55d398326f99059ff775485246999027b3197955'; //BSC-USD
    let _amount = '11420000000000000000'; //提现金额
    let _feeNum = '1000000000000000000';  //手续费
    let _recive = '0x42eb7119bdcebb14d688cd4997249cf984bba16f'; //提现收款地址    

    console.log("\n", "原始消息:      ",
        ['address'    , 'uint256', 'uint256', 'string', 'address', 'uint256', 'uint256', 'address'],
        [_contractAddr, _id      , _nonce   , _strfix , _tokenIn , _amount  , _feeNum  , _recive]);

    let messageHash = ethers.solidityPackedKeccak256(
        ['address'    , 'uint256', 'uint256', 'string', 'address', 'uint256', 'uint256', 'address'],
        [_contractAddr, _id      , _nonce   , _strfix , _tokenIn , _amount  , _feeNum  , _recive])
    
  console.log("\n", "打包和哈希消息: ", messageHash);

  let ethSignedmessageHash = ethers.solidityPackedKeccak256(['string', 'bytes32'], ["\x19Ethereum Signed Message:\n32", messageHash])
  console.log("\n", "以太坊签名消息: ", ethSignedmessageHash);


  console.log("###############################################################")
  console.log("\n", "签名方法2：ethers.Wallet")
  const wallet = new ethers.Wallet(privateKey);
  console.log("\n", "wallet地址:    ", wallet.address)

  let messageHashSigned = await wallet.signMessage(Uint8Array.from(Buffer.from(messageHash.slice(2), 'hex')));
  console.log("\n", "Wallet签名:    ", messageHashSigned)


  console.log("###############################################################")
  console.log("\n", "Ethers恢复公钥...")
  const recoveredPublicKey = ethers.SigningKey.recoverPublicKey(ethSignedmessageHash, messageHashSigned);
  console.log("\n", "Ethers恢复公钥(未压缩)：", recoveredPublicKey)
  const compressedPublicKey = ethers.computeAddress(recoveredPublicKey);
  console.log("\n", "Ethers恢复公钥(压缩后)：", compressedPublicKey)
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
