module.exports = {
  networks: {
    networks: {
      development: {
        host: 'localhost',
        port: 8545,
        network_id: '*', // eslint-disable-line camelcase
      },
      ganache: {
        host: 'localhost',
        port: 8545,
        network_id: '*', // eslint-disable-line camelcase
      }
    }
  },
  compilers: {
    solc: {
      version: "0.4.24",
      settings: {
       optimizer: {
         enabled: false,
         runs: 200
       }
      }
    }
  }
}