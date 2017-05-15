# expander package

An Atom plugin for simple text expansions.

Usage
---

**Setting And Activating Clip Expansions**  
1. Select a word or set of words in an editor pane and activate the **Set Clip** command.  
2. Select a second word or set of words in an editor pane and activate the **Set Expansion** command.  
3. Select an instance of the original 'clip' wordset and activate the **Expand** command, this will replace the 'clip' selection with the 'expansion' selection.  

Commands
---
**Set Clip**  
Saves current selection as a clip which can be assigned an expansion.

**Set Expansion**  
Assigns current selection as an expansion for the current clip.
Once the clip / expansion have been set, the current clip will be reset.  
_If no clip is has been set this command will not make an effect on saved clips / expansions._

**Expand**  
Attempts expansion on current selection. If no selection is present, it will attempt to expand the word under the primary cursor.

**Show Expansions**  
___Under construction___

Displays available clip / expansion combinations.




![A screenshot of your package](https://f.cloud.github.com/assets/69169/2290250/c35d867a-a017-11e3-86be-cd7c5bf3ff9b.gif)
