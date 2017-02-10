# geneology

## TODO Features
- right-side svg overflow scrolling
- method to reset to original and/or change the root: click on name, causing highlight, then click button "set as root"
- hover-over tool-tip info for each mathematicians
- side box for mathematician info (get from wikipedia) if available.
- when click on university name, tool-tip of university's website if available
- vertical year division in the background and properly position nodes
- information toggling (e.g. hide university text)

## TODO UI Features
- Better layout... somehow
- make text more readable on hover-over

## Working Features
- root reset when the tree gets too large.
- backward traversal by clicking on left margin

## Bugs
- some way of handling excessive children which causes text-mashing (e.g. Ernst Eduard Kunmer, C. Felix Klein) proposed solution: display a max of 15 children. Then have some mechanism for cycling through them.
- depth rule is not respected in backward traversal.

## Bugs Fixed
- need to make sure the colors are correct for nodes that have children
- database now contains the correct graduation dates
