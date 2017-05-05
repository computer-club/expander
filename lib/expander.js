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

  activate(state) {
    this.expanderView = new ExpanderView(state.expanderViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.expanderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:expand': () => this.expand()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:setClip': () => this.setClip()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:setExpansion': () => this.setExpansion()
    }));


    fs = require('fs')
    expansionFile = 'expansions.json'
    expansions = JSON.parse(fs.readFileSync(__dirname + '/' + expansionFile, 'utf8'));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.expanderView.destroy();
  },

  serialize() {
    return {
      expanderViewState: this.expanderView.serialize()
    };
  },
  expand() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getWordUnderCursor()
      //let grammar = editor.getGrammar().name
      console.log(editor.getGrammar().name)
      console.log(expansions[selection])
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
        if(grammarExpansions == null){
          console.log("grammarExpression for "+ grammarExpansions + " is null.")
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
          if(grammarExpansions == null){
            expansion = {}
            expansion[buffer] = selection
            expansions[editor.getGrammar().name] = expansion
          } else {
            grammarExpansions[buffer] = selection
          }
          fs.writeFile(__dirname + '/' + expansionFile, JSON.stringify(expansions), 'utf8')
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

// {
//   "JavaScript" : {"cat" : "dog"}
// }
