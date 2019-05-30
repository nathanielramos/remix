var RemixLib = require('remix-lib')
var executionContext = RemixLib.execution.executionContext
var ethJSUtil = require('ethereumjs-util')
var processTx = require('./txProcess.js')
var BN = ethJSUtil.BN

function hexConvert (ints) {
  var ret = '0x'
  for (var i = 0; i < ints.length; i++) {
    var h = ints[i]
    if (h) {
      ret += (h <= 0xf ? '0' : '') + h.toString(16)
    } else {
      ret += '00'
    }
  }
  return ret
}

var Transactions = function (accounts) {
  this.accounts = accounts
}

Transactions.prototype.methods = function () {
  return {
    eth_sendTransaction: this.eth_sendTransaction.bind(this),
    eth_getTransactionReceipt: this.eth_getTransactionReceipt.bind(this),
    eth_getCode: this.eth_getCode.bind(this),
    eth_call: this.eth_call.bind(this),
    eth_estimateGas: this.eth_estimateGas.bind(this),
    eth_getTransactionCount: this.eth_getTransactionCount.bind(this),
    eth_getTransactionByHash: this.eth_getTransactionByHash.bind(this),
    eth_getTransactionByBlockHashAndIndex: this.eth_getTransactionByBlockHashAndIndex.bind(this),
    eth_getTransactionByBlockNumberAndIndex: this.eth_getTransactionByBlockNumberAndIndex.bind(this)
  }
}

Transactions.prototype.eth_sendTransaction = function (payload, cb) {
  processTx(this.accounts, payload, false, cb)
}

Transactions.prototype.eth_getTransactionReceipt = function (payload, cb) {
	console.dir("== eth_getTransactionReceipt")
	console.dir(payload.params)
  executionContext.web3().eth.getTransactionReceipt(payload.params[0], (error, receipt) => {
    if (error) {
      return cb(error)
    }

    var txBlock = executionContext.txs[receipt.hash];

    var r = {
      'transactionHash': receipt.hash,
      'transactionIndex': '0x00',
      'blockHash': "0x" + txBlock.hash().toString('hex'),
      'blockNumber': "0x" + txBlock.header.number.toString('hex'),
      'gasUsed': web3.utils.toHex(receipt.gas),
      'cumulativeGasUsed': web3.utils.toHex(receipt.gas),
      'contractAddress': receipt.contractAddress,
      'logs': receipt.logs,
      'status': receipt.status
    }

    cb(null, r)
  })
}

Transactions.prototype.eth_estimateGas = function (payload, cb) {
  cb(null, 3000000)
}

Transactions.prototype.eth_getCode = function (payload, cb) {
	console.dir("== eth_getCode")
	console.dir(payload.params)
  let address = payload.params[0]
  console.dir(address);

  // const account = ethJSUtil.toBuffer(address)
	// console.dir(account)

	//executionContext.vm().stateManager.getContractCode(account, (error, result) => {
	//executionContext.web3().eth.getContractCode(address, (error, result) => {
	executionContext.web3().eth.getCode(address, (error, result) => {
		if (error) {
      console.dir("error getting code");
      console.dir(error);
		}
		//cb(error, hexConvert(result))
		cb(error, result)
	})
}

Transactions.prototype.eth_call = function (payload, cb) {
  processTx(this.accounts, payload, true, cb)
}

Transactions.prototype.eth_getTransactionCount = function (payload, cb) {
  let address = payload.params[0]

  executionContext.vm().stateManager.getAccount(address, (err, account) => {
    if (err) {
      return cb(err)
    }
    let nonce = new BN(account.nonce).toString(10)
    cb(null, nonce)
  })
}

Transactions.prototype.eth_getTransactionByHash = function (payload, cb) {
	console.dir("== eth_getTransactionByHash")
	console.dir(payload.params)
  const address = payload.params[0]

  executionContext.web3().eth.getTransactionReceipt(address, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    console.dir("== receipt")
    console.dir(receipt)

    var test = executionContext.web3();

    var txBlock = executionContext.txs[receipt.transactionHash];

    // executionContext.web3().eth.getBlock(receipt.hash).then((block) => {
    let r = {
      'blockHash': "0x" + txBlock.hash().toString('hex'),
		 	'blockNumber': "0x" + txBlock.header.number.toString('hex'),
      'from': receipt.from,
      'gas': web3.utils.toHex(receipt.gas),
      // 'gasPrice': '2000000000000', // 0x123
      "gasPrice":"0x4a817c800", // 20000000000
      'hash': receipt.transactionHash,
      'input': receipt.input,
      // "nonce": 2, // 0x15
      // "transactionIndex": 0,
      "value": receipt.value
      // "value":"0xf3dbb76162000" // 4290000000000000
			// "v": "0x25", // 37
			// "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
			// "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
    }

    if (receipt.to) {
      r.to = receipt.to
    }

    if (r.value === "0x") {
      r.value = "0x0"
    }

    cb(null, r)
    // })
  })
}

Transactions.prototype.eth_getTransactionByBlockHashAndIndex = function (payload, cb) {
	console.dir("== eth_getTransactionByHash")
	console.dir(payload.params)
  // const address = payload.params[0]
  const txIndex = payload.params[1]

  var txBlock = executionContext.blocks[payload.params[0]]
  const txHash = "0x" + txBlock.transactions[web3.utils.toDecimal(txIndex)].hash().toString('hex')

  executionContext.web3().eth.getTransactionReceipt(txHash, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    // executionContext.web3().eth.getBlock(receipt.hash).then((block) => {
    let r = {
      'blockHash': "0x" + txBlock.hash().toString('hex'),
      'blockNumber': "0x" + txBlock.header.number.toString('hex'),
      'from': receipt.from,
      'gas': web3.utils.toHex(receipt.gas),
      // 'gasPrice': '2000000000000', // 0x123
      "gasPrice": "0x4a817c800", // 20000000000
      'hash': receipt.transactionHash,
      'input': receipt.input,
      // "nonce": 2, // 0x15
      // "transactionIndex": 0,
      "value": receipt.value
      // "value":"0xf3dbb76162000" // 4290000000000000
      // "v": "0x25", // 37
      // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
      // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
    }

    if (receipt.to) {
      r.to = receipt.to
    }

    if (r.value === "0x") {
      r.value = "0x0"
    }

    cb(null, r)
    // })
  })
}

Transactions.prototype.eth_getTransactionByBlockNumberAndIndex = function (payload, cb) {
  console.dir("== eth_getTransactionByHash")
  console.dir(payload.params)
  // const address = payload.params[0]
  const txIndex = payload.params[1]

  var txBlock = executionContext.blocks[payload.params[0]]
  const txHash = "0x" + txBlock.transactions[web3.utils.toDecimal(txIndex)].hash().toString('hex')

  executionContext.web3().eth.getTransactionReceipt(txHash, (error, receipt) => {
    if (error) {
      return cb(error)
    }

    // executionContext.web3().eth.getBlock(receipt.hash).then((block) => {
    let r = {
      'blockHash': "0x" + txBlock.hash().toString('hex'),
      'blockNumber': "0x" + txBlock.header.number.toString('hex'),
      'from': receipt.from,
      'gas': web3.utils.toHex(receipt.gas),
      // 'gasPrice': '2000000000000', // 0x123
      "gasPrice": "0x4a817c800", // 20000000000
      'hash': receipt.transactionHash,
      'input': receipt.input,
      // "nonce": 2, // 0x15
      // "transactionIndex": 0,
      "value": receipt.value
      // "value":"0xf3dbb76162000" // 4290000000000000
      // "v": "0x25", // 37
      // "r": "0x1b5e176d927f8e9ab405058b2d2457392da3e20f328b16ddabcebc33eaac5fea",
      // "s": "0x4ba69724e8f69de52f0125ad8b3c5c2cef33019bac3249e2c0a2192766d1721c"
    }

    if (receipt.to) {
      r.to = receipt.to
    }

    if (r.value === "0x") {
      r.value = "0x0"
    }

    cb(null, r)
    // })
  })
}

module.exports = Transactions