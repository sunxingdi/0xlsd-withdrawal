# 0xlsd项目合约分析

### 信息汇总

项目官网地址：https://0xlsd.com/#/HOME

池子合约地址：0x2bb76ce97bc26b022401570573253863ea644d92

案例交易哈希：https://bscscan.com/tx/0x120be12320d222acd7d7c679304cec669265d30197fdff90ae306e0603d3d00c

### 问题描述

在平台质押的资金，LP个人能否直接调用合约函数提现？

### 交易分析

1. Tx Input Data：
```
Function: teamIncome(uint256 id,address tokenIn,uint256 amount,uint256 feeNum,address recive,bytes signature)

MethodID: 0x9237e263                                                   ---> 函数选择器
[0]:  0000000000000000000000000000000000000000000000000000000000011595 ---> 操作ID：71061（十进制）
[1]:  00000000000000000000000055d398326f99059ff775485246999027b3197955 ---> 提现币种：BSC-USDT（精度18）
[2]:  000000000000000000000000000000000000000000000000f89edd950f1f8000 ---> 提现金额：17.915000000000000000
[3]:  0000000000000000000000000000000000000000000000000de0b6b3a7640000 ---> 手续费：   1.000000000000000000
[4]:  0000000000000000000000008a1d3fa38391621855b805fa352895947a7364c0 ---> 提现收款地址
[5]:  00000000000000000000000000000000000000000000000000000000000000c0 ---> bytes数据偏移量：192（十进制），bytes数据从192字节处开始，32 x 6 = 192，即数据从第7个槽位开始
[6]:  0000000000000000000000000000000000000000000000000000000000000041 ---> bytes数据长度：65（十进制），以太坊标准签名长度为65字节
[7]:  ef25ca6b69d2dfe608a555ff3912b0e3325949e71570df31ecab57d8cb336f81 ---> ecdsa签名r值，占32字节
[8]:  2af9c7315e11063765d1bf34e70e983758db09c937fe80eeeaca0a181b1ce1bc ---> ecdsa签名s值，占32字节
[9]:  1b00000000000000000000000000000000000000000000000000000000000000 ---> ecdsa签名v值：27，占1字节
```

2. BEP-20 Tokens Transferred:

```
From 0x2bB76C...eA644d92 To 0x8a1d3f...7A7364C0 For 16.915 $16.91  Binance-Peg ... (BSC-US...) 
--->合约往收款地址转账$16.91 USDT（实际提现到账金额）

From 0x2bB76C...eA644d92 To PancakeSwap V2: 0XLSD-BSC-USD 2 For 1 $1.00  Binance-Peg ... (BSC-US...) 
--->合约往交易所转账$1.00 USDT，用于兑换0XLSD

From PancakeSwap V2: 0XLSD-BSC-USD 2 To 0x14BDCD...1047b805 For 0.000323051906118434  0XLSD... (0XLSD...) 
--->交易所往地址0x14BDCD转账0.000323051906118434  0XLSD

From 0x14BDCD...1047b805 To Null: 0x000...000 For 0.000323051906118434  0XLSD... (0XLSD...) 
--->地址0x14BDCD销毁0.000323051906118434  0XLSD

From PancakeSwap V2: 0XLSD-BSC-USD 2 To 0x2bB76C...eA644d92 For 0.000003263150566853  0XLSD... (0XLSD...) 
--->交易所往地址0x2bB76C转账0.000003263150566853  0XLSD

From 0x2bB76C...eA644d92 To Null: 0x000...000 For 0.000003263150566853  0XLSD... (0XLSD...)
--->地址0x2bB76C销毁0.000003263150566853  0XLSD
```

### 合约分析

teamIncome函数中，第一步是验签操作。注意此处验签账户为_key，来源于构造函数参数，这是一个项目方账户，可以在合约代码界面查看账户地址。

结论：LP个人无法调用合约函数提现，只能通过项目前端软件触发提现。

```
function teamIncome(uint256 id,address tokenIn,uint256 amount,uint256 feeNum,address recive,bytes memory signature) external {
    //获取收款账户nonce, 避免重放攻击
    uint256 nonce = _teamincomenonce[recive][tokenIn];
    //构造以太坊签名消息
    bytes32 message = ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(address(this),id,nonce,"TEAM_INCOME",tokenIn,amount,feeNum,recive)));
    //验签恢复公钥
    require(ECDSA.recover(message, signature) == _key,"LSD: SIGN ERROR");
    //收款账户nonce+1
    _teamincomenonce[recive][tokenIn] = _teamincomenonce[recive][tokenIn]+1;
    //调用转账函数
    _income(tokenIn,recive,amount,feeNum);
    //广播事件
    emit Income(id);
}

constructor(address key,address feeRecive){
    _key = key;
    _feeRecive = feeRecive;
    _manager = msg.sender;
    _noteFee = 5e15;
    _support(_usdt,5,1e18);
}
```

合约构造函数参数解析。
```
000000000000000000000000a9e2908ae90ddced6b8021bd79830849ca5588020000000000000000000000008dfaf7ba849da8f1483ae2fee9df926ec1c63dc2

-----Decoded View---------------
Arg [0] : key (address): 0xa9e2908Ae90Ddced6b8021bD79830849Ca558802
Arg [1] : feeRecive (address): 0x8dFAF7bA849dA8F1483ae2FeE9DF926Ec1C63dc2

-----Encoded View---------------
2 Constructor Arguments found :
Arg [0] : 000000000000000000000000a9e2908ae90ddced6b8021bd79830849ca558802
Arg [1] : 0000000000000000000000008dfaf7ba849da8f1483ae2fee9df926ec1c63dc2

```

### 附录

进制转换器：https://www.jyshare.com/front-end/58/

ABI在线编码：https://abi.hashex.org/