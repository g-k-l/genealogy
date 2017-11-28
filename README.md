# Visual Genealogy

Tree visualization for the [Mathematics Genealogy Project](https://www.genealogy.math.ndsu.nodak.edu) built with `d3.js`.

I obtained the genealogy data by using `requests` and `beautifulsoup`. The records are stored in MongoDB on [mlab](mlab.com).


## TODO Features
- a svg-based legend with a toggle-able box on the bottom right hand
- session support (will take some investigation...)
- information toggling (e.g. hide university text)
- side box for mathematician info (get from wikipedia) if available.
- add a message display for "loading..." during wait time.

## Organization
- factor out style and place them in CSS instead (use classes)

## TODO UI Features
- delayed transition while path is being highlighted
- make text more readable on hover-over (by adding background rectangle)
- vertical year division in the background and properly position nodes

## Working Features
- hover-over circle displays the number of children a node has
- search function with display of results and cycling of results
- children overflow + cycling function
- root reset when the tree gets too large.
- backward traversal by clicking on left margin

## Bugs
- Occasional initial load failure for tree (favicon? But sometimes there is no error at all?)
- handle text-mashing in the case of single descendant which is too close to parent in date.

## Bugs Fixed
- year-ticks not refreshing when changing root (except for search results)
- Link transition occasionally breaks when mouse moves during transition.
- need to make sure the colors are correct for nodes that have children
- database now contains the correct graduation dates
- fixed name stuck behind node
