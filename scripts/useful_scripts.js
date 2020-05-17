// [truffle console]

// initialize
let instance = await tCDP.deployed()
let instance = await tCDPAave.deployed()
let instance = await rebalanceCDPAave.deployed()
let accounts = await web3.eth.getAccounts()

let ceth_contract = await CTokenInterface.at("0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5")
let cdai_contract = await CTokenInterface.at("0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643")
let cusdc_contract = await CTokenInterface.at("0x39aa39c021dfbae8fac545936693ac917d5e7563")
let cbat_contract = await CTokenInterface.at("0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e")
let crep_contract = await CTokenInterface.at("0x158079ee67fce2f58472a96584a73c7ab9ac95c1")
let dai_contract = await ERC20.at("0x6b175474e89094c44da98b954eedeac495271d0f")

// get Exchange Rate
let exRate_cdai = (await cdai_contract.exchangeRateStored()).toString()
let exRate_ceth = (await ceth_contract.exchangeRateStored()).toString()

// get Underlying Price
let compOracle = await CompOracleInterface.at("0x1D8aEdc9E924730DD3f9641CDb4D1B92B848b4bd")
let underlyingPrice_dai1 = (await compOracle.getUnderlyingPrice(cdai_contract.address)).toString()

// main action
let res = await instance.initiate(web3.utils.toWei('150'), {from: accounts[0], value: web3.utils.toWei('1')})
instance.collateral.call().then( num => console.log('collateral: ' + web3.utils.fromWei(num.toString())))
instance.debt.call().then( num => console.log('debt: ' + web3.utils.fromWei(num.toString())))
let res2 = await instance.mint({from: accounts[0], value: web3.utils.toWei('1')})
let res3 = await instance.burn(web3.utils.toWei('1'), {from: accounts[0]})
instance.debtRatio.call().then( num => console.log('debtRatio: ' + web3.utils.fromWei(num.toString())))
let res4 = await instance.deleverage()
instance.debtRatio.call().then( num => console.log('debtRatio: ' + web3.utils.fromWei(num.toString())))
let res5 = await instance.leverage()
instance.debtRatio.call().then( num => console.log('debtRatio: ' + web3.utils.fromWei(num.toString())))

// transfer DAI
dai_contract.transfer(instance.address, web3.utils.toWei("1"), {from: dai_account})

// check balance
web3.eth.getBalance(ceth_account).then(num => console.log(web3.utils.fromWei(num.toString())))
ceth_contract.balanceOf(ceth_account).then(num => console.log(num.toString()))
ceth_contract.balanceOf(accounts[0]).then(num => console.log(num.toString()))
cdai_contract.balanceOf(ceth_account).then(num => console.log(num.toString()))
cusdc_contract.balanceOf(ceth_account).then(num => console.log(num.toString()))
cbat_contract.balanceOf(ceth_account).then(num => console.log(num.toString()))
crep_contract.balanceOf(ceth_account).then(num => console.log(num.toString()))
dai_contract.balanceOf(accounts[0]).then(num => console.log(num.toString()))

// approve & check allowance
dai_contract.approve(instance.address, web3.utils.toWei('2000'), {from: accounts[0]})
dai_contract.allowance(accounts[0], instance.address).then(num => console.log(num.toString()))

ceth_contract.approve(instance.address, "100000000000000000000", {from: ceth_account})
ceth_contract.allowance(ceth_account, instance.address).then(num => console.log(num.toString()))


// compound enterMarkets()
let troller = await ComptrollerInterface.at("0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b")
let cTokens = [crep_contract.address]
await troller.enterMarkets(cTokens, {from: ceth_account}) // enter market
await troller.exitMarket(ceth_contract.address, {from: ceth_account}) // exit market
await troller.getAssetsIn(ceth_account)

// send ether
await web3.eth.sendTransaction({from:accounts[0],to:ceth_account,value:web3.utils.toWei('10')})

// utils
.then(num => console.log(web3.utils.fromWei(num.toString())))

web3.utils.fromWei( web3.utils.hexToNumberString('0x000000000000000000000000000000000000000000000bacfc34481a0fdd9fda') )

res.logs[5].args[0].toString()

let res = await web3.eth.getTransactionReceipt('0xc919ca89424c15a93e0059400178f7fddf32e23d8be5c9491bb29b40379ba547')
web3.utils.hexToNumberString(res.gasUsed)

/// ------------------------------------------------------------------------------------
