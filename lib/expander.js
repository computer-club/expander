'use babel';

import ExpanderView from './expander-view';
import { CompositeDisposable } from 'atom';

var fs
var expansionFile
var expansions

export default {
  expanderView: null,
  modalPanel: null,
  subscriptions: null,

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
      'expander:toggle': () => this.toggle()
    }));

    fs = require('fs')
    expansionFile = "expansions.json"
    expansions = JSON.parse(fs.readFileSync(__dirname + "/" + expansionFile ,'utf8'));
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

  toggle() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()){
      let selection = editor.getSelectedText()
      let expansion
      if(expansion = expansions[selection]){
         editor.insertText(expansion)
       }
     }
   }
};
