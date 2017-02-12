# geneology

## TODO Features
- legend
- right-side svg overflow scrolling
- method to reset to original and/or change the root: enter name
- hover-over tool-tip info for each mathematicians
- side box for mathematician info (get from wikipedia) if available.
- vertical year division in the background and properly position nodes
- information toggling (e.g. hide university text)

## TODO UI Features
- Better layout... somehow
- change text color on hover-over
- make text more readable on hover-over

## Working Features
- children overflow + cycling function
- root reset when the tree gets too large.
- backward traversal by clicking on left margin

## Bugs
- hand text-mashing in the case of single descendant which is too close to parent in date.
- depth rule is not respected in backward traversal.

## Bugs Fixed
- need to make sure the colors are correct for nodes that have children
- database now contains the correct graduation dates
- fixed name stuck behind node
