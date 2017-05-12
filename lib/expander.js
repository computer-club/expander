'use babel';

import ExpanderView from './expander-view';
import {
  CompositeDisposable
} from 'atom';
import packageConfig from './config-schema.json';


var fs
var expansionFile
var expansions
var buffer

export default {
  expanderView: null,
  modalPanel: null,
  subscriptions: null,
  config: packageConfig,
  expansionPanel: null,

  activate(state) {
    if (state.savedExpansions == null) {
      expansions = {}
    } else {
      expansions = state.savedExpansions
    }
    this.expanderView = new ExpanderView(state.expanderViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.expanderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:Expand': () => this.expand()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:Set Clip': () => this.setClip()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:Set Expansion': () => this.setExpansion()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:Show Expansions': () => this.showExpansions()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.expanderView.destroy();
  },

  serialize() {
    return {
      savedExpansions: expansions,
      expanderViewState: this.expanderView.serialize()
    };
  },

  showExpansions() {
    var activeExpansions = function()
    {
      list = document.createElement('ul')
      for (var key in activeGrammarExpansion) {
        listElement = document.createElement('li')
        listElement.className = 'list-element'
        listElement.textContent = key
        list.appendChild(listElement)
      }
      return list
    }

    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      activeGrammarExpansion = expansions[editor.getGrammar().name]
      if (this.expansionPanel == null) {
        this.expansionPanel = document.createElement('div')
        this.expansionPanel.className = 'expansion-panel'
        this.expansionPanel.appendChild(activeExpansions())
        this.expansionPanel.hidden = false
        atom.workspace.addRightPanel({
          item: this.expansionPanel
        })
      } else {
        if(this.expansionPanel.hidden){
          this.expansionPanel.hidden = false
          this.expansionPanel.removeChild(this.expansionPanel.firstChild)
          this.expansionPanel.appendChild(activeExpansions())
        } else {
          this.expansionPanel.hidden = true
        }
      }
    }
  },

  expand() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getWordUnderCursor()
      let expansion
      if (grammarExpansions = expansions[editor.getGrammar().name]) {
        if (expansion = grammarExpansions[selection]) {
          editor.selectWordsContainingCursors()
          editor.insertText(expansion)
        } else {
          atom.notifications.addInfo('No expansion found.')
        }
      } else {
        console.log("No grammar found for " + editor.getGrammar().name)
      }
    }
  },

  setClip() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      if (selection = editor.getSelectedText()) {
        grammarExpansions = expansions[editor.getGrammar().name]
        if (grammarExpansions == null) {
          console.log("grammarExpression for " + grammarExpansions + " is null.")
        } else if (grammarExpansions[selection]) {
          atom.notifications.addWarning("Key: " + selection + " already exists.")
        }
        buffer = selection
        if (atom.config.get('expander.trimWhitespace')) {
          buffer = buffer.trim()
        }
        atom.notifications.addInfo('Added key: ' + buffer)
      } else {
        atom.notifications.addInfo('No text selected.')
      }
    }
  },

  setExpansion() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      if (selection = editor.getSelectedText()) {
        if (buffer) {
          if (atom.config.get('expander.trimWhitespace')) {
            selection = selection.trim()
          }
          grammarExpansions = expansions[editor.getGrammar().name]
          if (grammarExpansions == null) {
            expansion = {}
            expansion[buffer] = selection
            expansions[editor.getGrammar().name] = expansion
          } else {
            grammarExpansions[buffer] = selection
          }
          atom.notifications.addInfo('Added new expansion: ' + buffer + ' -> ' + selection)
          buffer = ''
        } else {
          atom.notifications.addInfo('No key selected.')
        }
      } else {
        atom.notifications.addInfo('No text selected.')
      }
    }
  }
};
