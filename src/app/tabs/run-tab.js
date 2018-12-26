'use strict'
var $ = require('jquery')
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var EventManager = require('../../lib/events')
var globlalRegistry = require('../../global/registry')
var helper = require('../../lib/helper.js')
var executionContext = require('../../execution-context')
var modalDialogCustom = require('../ui/modal-dialog-custom')
var Card = require('../ui/card')
var Recorder = require('../../recorder')
var css = require('./styles/run-tab-styles')

var settingsUI = require('./runTab/settings.js')
var contractDropdownUI = require('./runTab/contractDropdown.js')

function runTab (opts, localRegistry) {
  /* -------------------------
            VARIABLES
  --------------------------- */
  var self = this
  self.event = new EventManager()
  self._view = {}
  self.data = {
    count: 0,
    text: `All transactions (deployed contracts and function executions)
    in this environment can be saved and replayed in
    another environment. e.g Transactions created in
    Javascript VM can be replayed in the Injected Web3.`
  }
  self._components = {}
  self._components.registry = localRegistry || globlalRegistry
  self._components.transactionContextAPI = {
    getAddress: (cb) => {
      cb(null, $('#txorigin').val())
    },
    getValue: (cb) => {
      try {
        var number = document.querySelector('#value').value
        var select = document.getElementById('unit')
        var index = select.selectedIndex
        var selectedUnit = select.querySelectorAll('option')[index].dataset.unit
        var unit = 'ether' // default
        if (selectedUnit === 'ether') {
          unit = 'ether'
        } else if (selectedUnit === 'finney') {
          unit = 'finney'
        } else if (selectedUnit === 'gwei') {
          unit = 'gwei'
        } else if (selectedUnit === 'wei') {
          unit = 'wei'
        }
        cb(null, executionContext.web3().toWei(number, unit))
      } catch (e) {
        cb(e)
      }
    },
    getGasLimit: (cb) => {
      cb(null, $('#gasLimit').val())
    }
  }
  // dependencies
  self._deps = {
    udapp: self._components.registry.get('udapp').api,
    udappUI: self._components.registry.get('udappUI').api,
    config: self._components.registry.get('config').api,
    fileManager: self._components.registry.get('filemanager').api,
    editor: self._components.registry.get('editor').api,
    logCallback: self._components.registry.get('logCallback').api,
    filePanel: self._components.registry.get('filepanel').api,
    pluginManager: self._components.registry.get('pluginmanager').api,
    compilersArtefacts: self._components.registry.get('compilersartefacts').api
  }
  self._deps.udapp.resetAPI(self._components.transactionContextAPI)
  self._view.recorderCount = yo`<span>0</span>`
  self._view.instanceContainer = yo`<div class="${css.instanceContainer}"></div>`
  self._view.clearInstanceElement = yo`
    <i class="${css.clearinstance} ${css.icon} fa fa-trash" onclick=${() => self.event.trigger('clearInstance', [])}
    title="Clear instances list and reset recorder" aria-hidden="true">
  </i>`
  self._view.instanceContainerTitle = yo`
    <div class=${css.instanceContainerTitle}
      title="Autogenerated generic user interfaces for interaction with deployed contracts">
      Deployed Contracts
      ${self._view.clearInstanceElement}
    </div>`
  self._view.noInstancesText = yo`
    <div class="${css.noInstancesText}">
      Currently you have no contract instances to interact with.
    </div>`

  var container = yo`<div class="${css.runTabView}" id="runTabView" ></div>`
  var recorderInterface = makeRecorder(localRegistry, self.event, self)

  self._view.collapsedView = yo`
    <div class=${css.recorderCollapsedView}>
      <div class=${css.recorderCount}>${self._view.recorderCount}</div>
    </div>`

  self._view.expandedView = yo`
    <div class=${css.recorderExpandedView}>
      <div class=${css.recorderDescription}>
        ${self.data.text}
      </div>
      <div class="${css.transactionActions}">
        ${recorderInterface.recordButton}
        ${recorderInterface.runButton}
        </div>
      </div>
    </div>`

  self.recorderOpts = {
    title: 'Transactions recorded:',
    collapsedView: self._view.collapsedView
  }

  var recorderCard = new Card({}, {}, self.recorderOpts)
  recorderCard.event.register('expandCollapseCard', (arrow, body, status) => {
    body.innerHTML = ''
    status.innerHTML = ''
    if (arrow === 'down') {
      status.appendChild(self._view.collapsedView)
      body.appendChild(self._view.expandedView)
    } else if (arrow === 'up') {
      status.appendChild(self._view.collapsedView)
    }
  })
  /* -------------------------
       MAIN HTML ELEMENT
  --------------------------- */
  var el = yo`
  <div>
    ${settingsUI(container, self)}
    ${contractDropdownUI(self.event, self)}
    ${recorderCard.render()}
    ${self._view.instanceContainer}
  </div>
  `
  container.appendChild(el)

  return { render () { return container } }
}

/* ------------------------------------------------
           RECORDER
------------------------------------------------ */
function makeRecorder (registry, runTabEvent, self) {
  var recorder = new Recorder(self._deps.udapp, self._deps.logCallback)

  recorder.event.register('newTxRecorded', (count) => {
    self.data.count = count
    self._view.recorderCount.innerText = count
  })
  recorder.event.register('cleared', () => {
    self.data.count = 0
    self._view.recorderCount.innerText = 0
  })

  executionContext.event.register('contextChanged', () => {
    recorder.clearAll()
  })

  runTabEvent.register('clearInstance', () => {
    recorder.clearAll()
  })

  var css2 = csjs`
    .container {}
    .runTxs {}
    .recorder {}
  `

  var runButton = yo`<i class="fa fa-play runtransaction ${css2.runTxs} ${css.icon}"  title="Run Transactions" aria-hidden="true"></i>`
  var recordButton = yo`
    <i class="fa fa-floppy-o savetransaction ${css2.recorder} ${css.icon}"
      onclick=${triggerRecordButton} title="Save Transactions" aria-hidden="true">
    </i>`

  function triggerRecordButton () {
    var txJSON = JSON.stringify(recorder.getAll(), null, 2)
    var fileManager = self._deps.fileManager
    var path = fileManager.currentPath()
    modalDialogCustom.prompt(null, 'Transactions will be saved in a file under ' + path, 'scenario.json', input => {
      var fileProvider = fileManager.fileProviderOf(path)
      if (fileProvider) {
        var newFile = path + '/' + input
        helper.createNonClashingName(newFile, fileProvider, (error, newFile) => {
          if (error) return modalDialogCustom.alert('Failed to create file. ' + newFile + ' ' + error)
          if (!fileProvider.set(newFile, txJSON)) {
            modalDialogCustom.alert('Failed to create file ' + newFile)
          } else {
            fileManager.switchFile(newFile)
          }
        })
      }
    })
  }

  runButton.onclick = () => {
    /*
    @TODO
    update account address in scenario.json
    popup if scenario.json not open - "Open a file with transactions you want to replay and click play again"
    */
    var currentFile = self._deps.config.get('currentFile')
    self._deps.fileManager.fileProviderOf(currentFile).get(currentFile, (error, json) => {
      if (error) {
        modalDialogCustom.alert('Invalid Scenario File ' + error)
      } else {
        if (currentFile.match('.json$')) {
          try {
            var obj = JSON.parse(json)
            var txArray = obj.transactions || []
            var accounts = obj.accounts || []
            var options = obj.options || {}
            var abis = obj.abis || {}
            var linkReferences = obj.linkReferences || {}
          } catch (e) {
            return modalDialogCustom.alert('Invalid Scenario File, please try again')
          }
          if (txArray.length) {
            var noInstancesText = self._view.noInstancesText
            if (noInstancesText.parentNode) { noInstancesText.parentNode.removeChild(noInstancesText) }
            recorder.run(txArray, accounts, options, abis, linkReferences, self._deps.udapp, (abi, address, contractName) => {
              self._view.instanceContainer.appendChild(self._deps.udappUI.renderInstanceFromABI(abi, address, contractName))
            })
          }
        } else {
          modalDialogCustom.alert('A scenario file is required. Please make sure a scenario file is currently displayed in the editor. The file must be of type JSON. Use the "Save Transactions" Button to generate a new Scenario File.')
        }
      }
    })
  }

  return { recordButton, runButton }
}

module.exports = runTab
