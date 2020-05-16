/**
 * @notice Please do NOT run this file while deploying to mainnet.
 * @dev This file is used to print running environment info and 
 *      set account state to meet testing requirement.
 */
const tCDP = artifacts.require('./tCDPAave.sol');
const CTokenInterface = artifacts.require('./CErc20.sol');
const CEth = artifacts.require('./CEth.sol');
const ERC20 = artifacts.require('./ERC20.sol');
const ComptrollerInterface = artifacts.require('./Comptroller.sol');
const CompOracleInterface = artifacts.require('./PriceOracle.sol');

const CETH_ADDRESS = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5";
const CDAI_ADDRESS = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643";
const CUSDC_ADDRESS = "0x39aa39c021dfbae8fac545936693ac917d5e7563";
const CBAT_ADDRESS = "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e";
const CZRX_ADDRESS = "0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407";
const CREP_ADDRESS = "0x158079ee67fce2f58472a96584a73c7ab9ac95c1";
const CWBTC_ADDRESS = "0xc11b1268c1a384e55c48c2391d8d480264a3a7f4";

const DAI_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const BAT_ADDRESS = "0x0d8775f648430679a709e98d2b0cb6250d2887ef";
const ZRX_ADDRESS = "0xe41d2489571d322189246dafa5ebde1f4699f498";
const REP_ADDRESS = "0x1985365e9f78359a9b6ad760e32412f4a445e862";
const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";

const COMPOUND_COMPTROLLER_ADDRESS = "0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b";
const COMPOUND_ORACLE_ADDRESS = "0x1D8aEdc9E924730DD3f9641CDb4D1B92B848b4bd";


module.exports = async function (deployer, network) {
    if(network != "development"){
        return;
    }
    
    let accounts = await web3.eth.getAccounts();
    let account = accounts[0];

    await run(account);
    // await erc2erc(account); // doSomeThing || skip || erc2eth || printBalance
    // await printRate();

};

async function skip() {
    log("skip");
};

async function run(account) {
    let instance = await tCDP.deployed()
    let ceth_contract = await CTokenInterface.at(CETH_ADDRESS)
    let cdai_contract = await ERC20.at(CDAI_ADDRESS)
    let cusdc_contract = await CTokenInterface.at(CUSDC_ADDRESS)
    let cbat_contract = await CTokenInterface.at(CBAT_ADDRESS)
    let czrx_contract = await CTokenInterface.at(CZRX_ADDRESS)
    let crep_contract = await CTokenInterface.at(CREP_ADDRESS)    
    let cwbtc_contract = await CTokenInterface.at(CWBTC_ADDRESS)
    let dai_contract = await ERC20.at(DAI_ADDRESS)
    let usdc_contract = await ERC20.at(USDC_ADDRESS)

    console.log('');
    log(`#########  initiate  #########`);
    let res = await instance.initiate(web3.utils.toWei('1'), {value: web3.utils.toWei('1'), from: account})
    await getCollateralAndDebt(instance);

    console.log('');
    log(`#########  mint  #########`);
    let res2 = await instance.mint({value: web3.utils.toWei('1'), from: account})
    await getCollateralAndDebt(instance);

    console.log('');
    log(`#########  burn  #########`);
    //approve cToken to instance contract
    await dai_contract.approve(instance.address, web3.utils.toWei('100000000000'), {from: account})
    await dai_contract.allowance(account, instance.address).then(num => log("DAI Allowance: " + num.toString()))
    let res3 = await instance.burn(web3.utils.toWei('1'), {from: account})
    await getCollateralAndDebt(instance);

};

async function getCollateralAndDebt(tCDP) {
    let collateral = web3.utils.fromWei((await tCDP.collateral.call()).toString());
    let debt = web3.utils.fromWei((await tCDP.debt.call()).toString());
    log(`Collateral: ${collateral}`);
    log(`Debt: ${debt}`);
}

async function printBalance(account = "0x0f3aeb4c56cf3ff160ac1d2e3b3376e94ddab50c") {
    // let account = "0x0f3aeb4c56cf3ff160ac1d2e3b3376e94ddab50c"
    log(`account: ${account}`);

    let troller = await ComptrollerInterface.at(COMPOUND_COMPTROLLER_ADDRESS)
    let {0:_, 1:accountLiquidity, 2:shortfall} = await troller.getAccountLiquidity.call(account);
    log(`account liquidity: ${accountLiquidity}`);
    log(`account shortfall: ${shortfall}`);
    let assetsIn = await troller.getAssetsIn(account)
    log(`Assets In: ${assetsIn}`)

    let instance = await DeFlast.deployed()
    let ceth_contract = await CTokenInterface.at(CETH_ADDRESS)
    let cdai_contract = await CTokenInterface.at(CDAI_ADDRESS)
    let cusdc_contract = await CTokenInterface.at(CUSDC_ADDRESS)
    let cbat_contract = await CTokenInterface.at(CBAT_ADDRESS)
    let crep_contract = await CTokenInterface.at(CREP_ADDRESS)
    let czrx_contract = await CTokenInterface.at(CZRX_ADDRESS)
    let cwbtc_contract = await CTokenInterface.at(CWBTC_ADDRESS)
    
    let dai_contract = await ERC20.at(DAI_ADDRESS)
    let usdc_contract = await ERC20.at(USDC_ADDRESS)
    let bat_contract = await ERC20.at(BAT_ADDRESS)
    let rep_contract = await ERC20.at(REP_ADDRESS)
    let zrx_contract = await ERC20.at(ZRX_ADDRESS)
    let wbtc_contract = await ERC20.at(WBTC_ADDRESS)

    console.log('');
    console.log(`#########  Supply  #########`);
    await getTokenBalance(ceth_contract.address, 'cETH', account);
    await getTokenBalance(cdai_contract.address, 'cDAI', account);
    await getTokenBalance(cusdc_contract.address, 'cUSDC', account);
    await getTokenBalance(cbat_contract.address, 'cBAT', account);
    await getTokenBalance(crep_contract.address, 'cREP', account);
    await getTokenBalance(czrx_contract.address, 'cZRX', account);
    await getTokenBalance(cwbtc_contract.address, 'cWBTC', account);
    
    console.log('');
    console.log(`#########  Borrow  #########`);
    await getCompoundBorrowBalance(ceth_contract.address, 'ETH', account);
    await getCompoundBorrowBalance(cdai_contract.address, 'DAI', account);
    await getCompoundBorrowBalance(cusdc_contract.address, 'USDC', account);
    await getCompoundBorrowBalance(cbat_contract.address, 'BAT', account);
    await getCompoundBorrowBalance(crep_contract.address, 'REP', account);
    await getCompoundBorrowBalance(czrx_contract.address, 'ZRX', account);
    await getCompoundBorrowBalance(cwbtc_contract.address, 'WBTC', account);
};

async function printRate() {
    // initialize
    let instance = await DeFlast.deployed()
    log(`Deployed address: ${instance.address}`)
    let ceth_contract = await CTokenInterface.at(CETH_ADDRESS)
    let cdai_contract = await CTokenInterface.at(CDAI_ADDRESS)
    let cusdc_contract = await CTokenInterface.at(CUSDC_ADDRESS)
    let cbat_contract = await CTokenInterface.at(CBAT_ADDRESS)
    let czrx_contract = await CTokenInterface.at(CZRX_ADDRESS)
    let crep_contract = await CTokenInterface.at(CREP_ADDRESS)    
    let cwbtc_contract = await CTokenInterface.at(CWBTC_ADDRESS)
    let dai_contract = await ERC20.at(DAI_ADDRESS)
    console.log('');
    
    // get Exchange Rate
    await getExchangeRate(ceth_contract, 'cETH');
    await getExchangeRate(cdai_contract, 'cDAI');
    await getExchangeRate(cusdc_contract, 'cUSDC');
    await getExchangeRate(cbat_contract, 'cBAT');
    await getExchangeRate(czrx_contract, 'cZRX');
    await getExchangeRate(crep_contract, 'cREP');
    await getExchangeRate(cwbtc_contract, 'cWBTC');
    console.log('');

    // get Underlying Price
    let compOracle = await CompOracleInterface.at(COMPOUND_ORACLE_ADDRESS)
    await getUnderlyingPrice(compOracle, cdai_contract, 'DAI')
    await getUnderlyingPrice(compOracle, cusdc_contract, 'USDC')
    await getUnderlyingPrice(compOracle, cbat_contract, 'BAT')
    await getUnderlyingPrice(compOracle, czrx_contract, 'ZRX')
    await getUnderlyingPrice(compOracle, crep_contract, 'REP')
    await getUnderlyingPrice(compOracle, cwbtc_contract, 'WBTC')
    console.log('');
}

async function getExchangeRate(cToken, symbol) {
    let exRate = (await cToken.exchangeRateStored()).toString()
    log(`Exchange Rate - ${symbol}: ${exRate}`);
}

async function getUnderlyingPrice(compOracle, cToken, symbol) {
    let underlyingPrice = (await compOracle.getUnderlyingPrice(cToken.address)).toString()
    log(`Underlying Price - ${symbol}: ${underlyingPrice}`);
}

async function getTokenBalance(tokenAddress, symbol, account) {
    let token_contract = await ERC20.at(tokenAddress);
    let balance = (await token_contract.balanceOf(account)).toString();
    log(`${symbol} Balance: ${balance}`);
}

async function getCompoundBorrowBalance(cAddress, symbol, account) {
    let token_contract = await CTokenInterface.at(cAddress);
    let balance = (await token_contract.borrowBalanceStored(account)).toString();
    log(`${symbol} Borrow Balance: ${balance}`);
}

function log(msg) {
    console.log(`> ${msg}`)
}
