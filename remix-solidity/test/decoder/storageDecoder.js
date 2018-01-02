'use strict'
var tape = require('tape')
var compiler = require('solc')
var stateDecoder = require('../../src/decoder/stateDecoder')
var MockStorageResolver = require('./mockStorageResolver')
var remixLib = require('remix-lib')
var compilerInput = remixLib.helpers.compiler.compilerInput

tape('solidity', function (t) {
  t.test('storage decoder', function (st) {
    testIntStorage(st, function () {
      testByteStorage(st, function () {
        testStructArrayStorage(st, function () {
          testMappingStorage(st, function () {
            st.end()
          })
        })
      })
    })
  })
})

function testIntStorage (st, cb) {
  var intStorage = require('./contracts/intStorage')
  var output = compiler.compileStandardWrapper(compilerInput(intStorage.contract))
  output = JSON.parse(output)
  var mockStorageResolver
  for (var storage of [intStorage.fullStorage, shrinkStorage(intStorage.fullStorage)]) {
    mockStorageResolver = new MockStorageResolver(storage)
    stateDecoder.solidityState(mockStorageResolver, output.sources, 'intStorage').then((decoded) => {
      st.equal(decoded['ui8'].value, '130')
      st.equal(decoded['ui16'].value, '456')
      st.equal(decoded['ui32'].value, '4356')
      st.equal(decoded['ui64'].value, '3543543543')
      st.equal(decoded['ui128'].value, '234567')
      st.equal(decoded['ui256'].value, '115792089237316195423570985008687907853269984665640564039457584007880697216513')
      st.equal(decoded['ui'].value, '123545666')
      st.equal(decoded['i8'].value, '-45')
      st.equal(decoded['i16'].value, '-1234')
      st.equal(decoded['i32'].value, '3455')
      st.equal(decoded['i64'].value, '-35566')
      st.equal(decoded['i128'].value, '-444444')
      st.equal(decoded['i256'].value, '3434343')
      st.equal(decoded['i'].value, '-32432423423')
      st.equal(decoded['ishrink'].value, '2')
    })
  }

  mockStorageResolver = new MockStorageResolver({})
  stateDecoder.solidityState(mockStorageResolver, output.sources, 'intStorage').then((decoded) => {
    st.equal(decoded['ui8'].value, '0')
    st.equal(decoded['ui16'].value, '0')
    st.equal(decoded['ui32'].value, '0')
    st.equal(decoded['ui64'].value, '0')
    st.equal(decoded['ui128'].value, '0')
    st.equal(decoded['ui256'].value, '0')
    st.equal(decoded['ui'].value, '0')
    st.equal(decoded['i8'].value, '0')
    st.equal(decoded['i16'].value, '0')
    st.equal(decoded['i32'].value, '0')
    st.equal(decoded['i64'].value, '0')
    st.equal(decoded['i128'].value, '0')
    st.equal(decoded['i256'].value, '0')
    st.equal(decoded['i'].value, '0')
    st.equal(decoded['ishrink'].value, '0')
    cb()
  })
}

function testByteStorage (st, cb) {
  var byteStorage = require('./contracts/byteStorage')
  var output = compiler.compileStandardWrapper(compilerInput(byteStorage.contract))
  output = JSON.parse(output)
  var mockStorageResolver
  for (var storage of [byteStorage.storage, shrinkStorage(byteStorage.storage)]) {
    mockStorageResolver = new MockStorageResolver(storage)
    stateDecoder.solidityState(mockStorageResolver, output.sources, 'byteStorage').then((decoded) => {
      st.equal(decoded['b1'].value, false)
      st.equal(decoded['a1'].value, '0xFE350F199F244AC9A79038D254400B632A633225')
      st.equal(decoded['b2'].value, true)
      st.equal(decoded['dynb1'].value, '0x64796e616d69636279746573')
      st.equal(decoded['dynb1'].length, '0xc')
      st.equal(decoded['stab'].value, '0x01')
      st.equal(decoded['stab1'].value, '0x12')
      st.equal(decoded['stab2'].value, '0x1579')
      st.equal(decoded['stab3'].value, '0x359356')
      st.equal(decoded['stab4'].value, '0x23750000')
      st.equal(decoded['stab5'].value, '0x0235764500')
      st.equal(decoded['stab6'].value, '0x324435000000')
      st.equal(decoded['stab7'].value, '0x00432400000000')
      st.equal(decoded['stab8'].value, '0x3245546457650000')
      st.equal(decoded['stab9'].value, '0x034345430000000000')
      st.equal(decoded['stab10'].value, '0x04543543654657000000')
      st.equal(decoded['stab11'].value, '0x5435465400000000000000')
      st.equal(decoded['stab12'].value, '0x030000000000000000000000')
      st.equal(decoded['stab13'].value, '0x03243242345435000000000000')
      st.equal(decoded['stab14'].value, '0x3245435435435300000000000000')
      st.equal(decoded['stab15'].value, '0x032454434435000000000000000000')
      st.equal(decoded['stab16'].value, '0x32454354440000000000000000000000')
      st.equal(decoded['stab17'].value, '0x0324543432432432450000000000000000')
      st.equal(decoded['stab18'].value, '0x032453432543543500000000000000000000')
      st.equal(decoded['stab19'].value, '0x03245434354354350000000000000000000000')
      st.equal(decoded['stab20'].value, '0x032454543543AB35000000000000000000000000')
      st.equal(decoded['stab21'].value, '0x324544324234350000000000000000000000000000')
      st.equal(decoded['stab22'].value, '0x324543AEF50000000000000000000000000000000000')
      st.equal(decoded['stab23'].value, '0x3245435FFF000000000000000000000000000000000000')
      st.equal(decoded['stab24'].value, '0x3245435F0000000000000000000000000000000000000000')
      st.equal(decoded['stab25'].value, '0x3245435F000000000000000000000000000000000000000000')
      st.equal(decoded['stab26'].value, '0x3245435F00000000000000000000000000000000000000000000')
      st.equal(decoded['stab27'].value, '0x03245FFFFFFF000000000000000000000000000000000000000000')
      st.equal(decoded['stab28'].value, '0x03241235000000000000000000000000000000000000000000000000')
      st.equal(decoded['stab29'].value, '0x0325213213000000000000000000000000000000000000000000000000')
      st.equal(decoded['stab30'].value, '0x032454352324230000000000000000000000000000000000000000000000')
      st.equal(decoded['stab31'].value, '0x32454351230000000000000000000000000000000000000000000000000000')
      st.equal(decoded['stab32'].value, '0x324324423432543543AB00000000000000000000000000000000000000000000')
      st.equal(decoded['enumDec'].value, 'e240')
      st.equal(decoded['str1'].value, 'short')
      st.equal(decoded['str12'].value, 'шеллы')
      st.equal(decoded['str2'].value, 'long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long__long')
    })
  }

  mockStorageResolver = new MockStorageResolver({})
  stateDecoder.solidityState(mockStorageResolver, output.sources, 'byteStorage').then((decoded) => {
    st.equal(decoded['b1'].value, false)
    st.equal(decoded['a1'].value, '0x0000000000000000000000000000000000000000')
    st.equal(decoded['b2'].value, false)
    st.equal(decoded['dynb1'].value, '0x')
    st.equal(decoded['dynb1'].length, '0x0')
    st.equal(decoded['stab'].value, '0x00')
    st.equal(decoded['stab1'].value, '0x00')
    st.equal(decoded['stab2'].value, '0x0000')
    st.equal(decoded['stab3'].value, '0x000000')
    st.equal(decoded['stab4'].value, '0x00000000')
    st.equal(decoded['stab5'].value, '0x0000000000')
    st.equal(decoded['stab6'].value, '0x000000000000')
    st.equal(decoded['stab7'].value, '0x00000000000000')
    st.equal(decoded['stab8'].value, '0x0000000000000000')
    st.equal(decoded['stab9'].value, '0x000000000000000000')
    st.equal(decoded['stab10'].value, '0x00000000000000000000')
    st.equal(decoded['stab11'].value, '0x0000000000000000000000')
    st.equal(decoded['stab12'].value, '0x000000000000000000000000')
    st.equal(decoded['stab13'].value, '0x00000000000000000000000000')
    st.equal(decoded['stab14'].value, '0x0000000000000000000000000000')
    st.equal(decoded['stab15'].value, '0x000000000000000000000000000000')
    st.equal(decoded['stab16'].value, '0x00000000000000000000000000000000')
    st.equal(decoded['stab17'].value, '0x0000000000000000000000000000000000')
    st.equal(decoded['stab18'].value, '0x000000000000000000000000000000000000')
    st.equal(decoded['stab19'].value, '0x00000000000000000000000000000000000000')
    st.equal(decoded['stab20'].value, '0x0000000000000000000000000000000000000000')
    st.equal(decoded['stab21'].value, '0x000000000000000000000000000000000000000000')
    st.equal(decoded['stab22'].value, '0x00000000000000000000000000000000000000000000')
    st.equal(decoded['stab23'].value, '0x0000000000000000000000000000000000000000000000')
    st.equal(decoded['stab24'].value, '0x000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab25'].value, '0x00000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab26'].value, '0x0000000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab27'].value, '0x000000000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab28'].value, '0x00000000000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab29'].value, '0x0000000000000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab30'].value, '0x000000000000000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab31'].value, '0x00000000000000000000000000000000000000000000000000000000000000')
    st.equal(decoded['stab32'].value, '0x0000000000000000000000000000000000000000000000000000000000000000')
    st.equal(decoded['enumDec'].value, 'e0')
    st.equal(decoded['str1'].length, '0x0')
    st.equal(decoded['str2'].length, '0x0')
    st.equal(decoded['str1'].value, '')
    st.equal(decoded['str12'].value, '')
    st.equal(decoded['str2'].value, '')
    cb()
  })
}

function shrinkStorage (storage) {
  var shrinkedStorage = {}
  var regex = /0x(00)*(..)/
  for (var key in storage) {
    var value = storage[key]
    shrinkedStorage[key.replace(regex, '0x$2')] = value.replace(regex, '0x$2')
  }
  return shrinkedStorage
}

function testStructArrayStorage (st, cb) {
  var structArrayStorage = require('./contracts/structArrayStorage')
  var output = compiler.compileStandardWrapper(compilerInput(structArrayStorage.contract))
  output = JSON.parse(output)
  var mockStorageResolver = new MockStorageResolver(structArrayStorage.storage)
  stateDecoder.solidityState(mockStorageResolver, output.sources, 'structArrayStorage').then((decoded) => {
    st.equal(decoded['intStructDec'].value['i8'].value, '32')
    st.equal(decoded['intStructDec'].value['i16'].value, '-54')
    st.equal(decoded['intStructDec'].value['ui32'].value, '128')
    st.equal(decoded['intStructDec'].value['i256'].value, '-1243565465756')
    st.equal(decoded['intStructDec'].value['ui16'].value, '34556')
    st.equal(decoded['intStructDec'].value['i32'].value, '-345446546')
    st.equal(decoded['i5'].length, '0x7')
    st.equal(decoded['i5'].value[0].value, '-2134')
    st.equal(decoded['i5'].value[1].value, '345')
    st.equal(decoded['i5'].value[2].value, '-3246')
    st.equal(decoded['i5'].value[3].value, '4357')
    st.equal(decoded['i5'].value[4].value, '324')
    st.equal(decoded['i5'].value[5].value, '-2344')
    st.equal(decoded['i5'].value[6].value, '3254')
    st.equal(decoded['idyn5'].length, '0x9')
    st.equal(decoded['idyn5'].value[0].value, '-2134')
    st.equal(decoded['idyn5'].value[1].value, '345')
    st.equal(decoded['idyn5'].value[2].value, '-3246')
    st.equal(decoded['idyn5'].value[3].value, '4357')
    st.equal(decoded['idyn5'].value[4].value, '324')
    st.equal(decoded['idyn5'].value[5].value, '-2344')
    st.equal(decoded['idyn5'].value[6].value, '3254')
    st.equal(decoded['idyn5'].value[7].value, '-254')
    st.equal(decoded['idyn5'].value[8].value, '-2354')
    st.equal(decoded['dyn1'].length, '0x4')
    st.equal(decoded['dyn1'].value[0].length, '0x1')
    st.equal(decoded['dyn1'].value[0].value[0].value, '3')
    st.equal(decoded['dyn1'].value[1].length, '0x3')
    st.equal(decoded['dyn1'].value[1].value[0].value, '12')
    st.equal(decoded['dyn1'].value[1].value[1].value, '-12')
    st.equal(decoded['dyn1'].value[1].value[2].value, '-1234')
    st.equal(decoded['dyn1'].value[2].length, '0xa')
    st.equal(decoded['dyn1'].value[2].value[0].value, '1')
    st.equal(decoded['dyn1'].value[2].value[1].value, '12')
    st.equal(decoded['dyn1'].value[2].value[2].value, '1235')
    st.equal(decoded['dyn1'].value[2].value[3].value, '-12')
    st.equal(decoded['dyn1'].value[2].value[4].value, '-123456')
    st.equal(decoded['dyn1'].value[2].value[5].value, '-23435435')
    st.equal(decoded['dyn1'].value[2].value[6].value, '543543')
    st.equal(decoded['dyn1'].value[2].value[7].value, '2')
    st.equal(decoded['dyn1'].value[2].value[8].value, '-1')
    st.equal(decoded['dyn1'].value[2].value[9].value, '232432')
    st.equal(decoded['dyn1'].value[3].length, '0x2')
    st.equal(decoded['dyn1'].value[3].value[0].value, '232432')
    st.equal(decoded['dyn1'].value[3].value[0].value, '232432')
    st.equal(decoded['dyn2'].length, '0x2')
    st.equal(decoded['dyn2'].value[0].length, '0x4')
    st.equal(decoded['dyn2'].value[0].value[0].value[0].value, '23')
    st.equal(decoded['dyn2'].value[0].value[0].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[0].value[0].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[0].value[1].value[0].value, '23')
    st.equal(decoded['dyn2'].value[0].value[1].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[0].value[1].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[0].value[2].value[0].value, '23')
    st.equal(decoded['dyn2'].value[0].value[2].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[0].value[2].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[0].value[3].value[0].value, '23')
    st.equal(decoded['dyn2'].value[0].value[3].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[0].value[3].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[1].length, '0x4')
    st.equal(decoded['dyn2'].value[1].value[0].value[0].value, '23')
    st.equal(decoded['dyn2'].value[1].value[0].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[1].value[0].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[1].value[1].value[0].value, '23')
    st.equal(decoded['dyn2'].value[1].value[1].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[1].value[1].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[1].value[2].value[0].value, '23')
    st.equal(decoded['dyn2'].value[1].value[2].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[1].value[2].value[2].value, '-28')
    st.equal(decoded['dyn2'].value[1].value[3].value[0].value, '23')
    st.equal(decoded['dyn2'].value[1].value[3].value[1].value, '-23')
    st.equal(decoded['dyn2'].value[1].value[3].value[2].value, '-28')
    st.equal(decoded['arrayStruct'].value[0].value[0].value.i8.value, '34')
    st.equal(decoded['arrayStruct'].value[0].value[0].value.str.value, 'test_str_short')
    st.equal(decoded['arrayStruct'].value[0].value[1].value.i8.value, '-123')
    st.equal(decoded['arrayStruct'].value[0].value[1].value.str.value, 'test_str_long test_str_lo ngtest_str_longtest_str_ longtest_str_longtest_ str_longtest_str_l ongtest_str_long')
    st.equal(decoded['arrayStruct'].value[1].value[0].value.i8.value, '50')
    st.equal(decoded['arrayStruct'].value[1].value[0].value.str.value, 'test_str_short')
    st.equal(decoded['arrayStruct'].value[2].value[0].value.i8.value, '60')
    st.equal(decoded['arrayStruct'].value[2].value[0].value.str.value, 'test_str_short')
    st.equal(decoded['arrayStruct'].value[2].value[1].value.i8.value, '84')
    st.equal(decoded['arrayStruct'].value[2].value[1].value.str.value, 'test_str_long test_str_lo ngtest_str_longtest_str_ longtest_str_longtest_ str_longtest_str_l ongtest_str_long')
    st.equal(decoded['arrayStruct'].value[2].value[2].value.i8.value, '-34')
    st.equal(decoded['arrayStruct'].value[2].value[2].value.str.value, 'test_str_short')
    cb()
  })
}

function testMappingStorage (st, cb) {
  var mappingStorage = require('./contracts/mappingStorage')
  var vmSendTx = require('./vmCall')
  var privateKey = new Buffer('dae9801649ba2d95a21e688b56f77905e5667c44ce868ec83f82e838712a2c7a', 'hex')
  var vm = initVM(st, privateKey)
  var output = compiler.compileStandardWrapper(compilerInput(mappingStorage.contract))
  output = JSON.parse(output)
  vmSendTx(vm, {nonce: 0, privateKey: privateKey}, null, 0, output.contracts['test.sol']['SimpleMappingState'].evm.bytecode.object, function (error, txHash) {
    if (error) {
      console.log(error)
      st.end(error)
    } else {
      vmSendTx(vm, {nonce: 1, privateKey: privateKey}, null, 0, '2fd0a83a00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000001074686973206973206120737472696e6700000000000000000000000000000000',
      function (error, txHash) {
        if (error) {
          console.log(error)
          st.end(error)
        } else {
          console.log(txHash)
          var TraceManager = require('remix-core').trace.TraceManager
          var traceManager = new TraceManager()
          var StorageResolver = require('remix-core').storage.StorageResolver
          var StorageViewer = require('remix-core').storage.StorageViewer
          var storageViewer = new StorageViewer({
            stepIndex: 180,
            tx: null,
            address: null
          }, new StorageResolver(), traceManager)
          var stateVars = stateDecoder.extractStateVariables('SimpleMappingState', output.sources)
          stateDecoder.decodeState(stateVars, storageViewer).then((result) => {
            console.log(result)
          })
        }
      })
    }
  })
}

/*
  Init VM / Send Transaction
*/
function initVM (st, privateKey) {
  var remixLib = require('remix-lib')
  var utileth = require('ethereumjs-util')
  var VM = require('ethereumjs-vm')
  var Web3Providers = remixLib.vm.Web3Providers
  var address = utileth.privateToAddress(privateKey)
  var vm = new VM({
    enableHomestead: true,
    activatePrecompiles: true
  })
  vm.stateManager.putAccountBalance(address, 'f00000000000000001', function cb () {})
  var web3Providers = new Web3Providers()
  web3Providers.addVM('VM', vm)
  web3Providers.get('VM', function (error, obj) {
    if (error) {
      var mes = 'provider TEST not defined'
      console.log(mes)
      st.fail(mes)
    } else {
      global.web3 = obj
      st.end()
    }
  })
  return vm
}
