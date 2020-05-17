const tCDP = artifacts.require('./tCDP.sol');
const tCDPAave = artifacts.require('./tCDPAave.sol');
const rebalanceCDPAave = artifacts.require('./rebalanceCDPAave.sol');

const lendingPoolAddressesProvider = '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8';

module.exports = function(deployer) {
    // deployer.deploy(tCDP);
    deployer.deploy(rebalanceCDPAave, lendingPoolAddressesProvider);
};
