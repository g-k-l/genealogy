# Visual Genealogy

## TODO Features
- a svg-based legend with a toggle-able box on the bottom right hand
- session support (will take some investigation...)
- information toggling (e.g. hide university text)
- side box for mathematician info (get from wikipedia) if available.
- add a message display for "loading..." during wait time.

## TODO UI Features
- change text color on hover-over
- make text more readable on hover-over
- vertical year division in the background and properly position nodes

## Working Features
- hover-over circle displays the number of children a node has
- search function with display of results and cycling of results
- children overflow + cycling function
- root reset when the tree gets too large.
- backward traversal by clicking on left margin

## Bugs
- Occasional initial load failure for tree (favicon?)
- handle text-mashing in the case of single descendant which is too close to parent in date.

## Bugs Fixed
- year-ticks not refreshing when changing root (except for search results)
- Link transition occasionally breaks when mouse moves during transition.
- need to make sure the colors are correct for nodes that have children
- database now contains the correct graduation dates
- fixed name stuck behind node
