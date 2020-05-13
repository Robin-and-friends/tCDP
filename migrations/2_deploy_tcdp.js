const tCDP = artifacts.require('./tCDP.sol');

module.exports = function(deployer) {
    deployer.deploy(tCDP);
};
