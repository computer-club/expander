'use babel';

import ExpanderView from './expander-view';
import { CompositeDisposable } from 'atom';

var fs
var expansionFile
var expansions
var buffer

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
      'expander:expand': () => this.expand()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:addKey': () => this.addKey()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'expander:addValue': () => this.addValue()
    }));


    fs = require('fs')
    expansionFile = 'expansions.json'
    expansions = JSON.parse(fs.readFileSync(__dirname + '/' + expansionFile ,'utf8'));
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
    if (editor = atom.workspace.getActiveTextEditor()){
      let selection = editor.getSelectedText()
      let expansion
      if(expansion = expansions[selection]){
         editor.insertText(expansion)
       } else {
          atom.notifications.addInfo('No expansion found.')
       }
     }
   },
   addKey(){
     let editor
     if (editor = atom.workspace.getActiveTextEditor()){
       if(selection = editor.getSelectedText()){
         if(expansions[selection]){
           atom.notifications.addWarning("Key: " + selection + " already exists." )
         }
         buffer = selection
         atom.notifications.addInfo('Added key: '+ buffer)
       } else {
         atom.notifications.addInfo('No text selected.')
       }
     }
   },
   addValue(){
     let editor
     if (editor = atom.workspace.getActiveTextEditor()){
       if(selection = editor.getSelectedText()){
         if(buffer){
           expansions[buffer] = selection
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
