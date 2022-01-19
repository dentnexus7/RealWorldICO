const GreggToken = artifacts.require("./GreggToken");

module.exports = function (deployer) {
    const _name = "Gregg Token";
    const _symbol = "GGG";
    const _decimals = 18;
  deployer.deploy(GreggToken, _name, _symbol, _decimals);
};
