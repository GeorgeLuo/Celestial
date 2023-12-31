# Celestial

## Constellation

A constellation is a representation of an interface as a coordinate system of elements and position relative to the top left corner. For example, a constellation of width 100 and height 200 will have (100, 0) as the top right, (0, 200) at the bottom left and (100, 200) at the bottom right.

## Purpose

By converting interfaces from xml-like representations to positions in space, we can denote actions with coordinate precision instead of seraching for element by xpath.

### Models

#### Find rectangles

### Extension

The extension defines a tool used to capture user flows. Note this will only work for webpages and not chrome settings pages. The extension handles one session recording at a time across changes in url of a single tab. 

Usage outside of this is not tested and will be unstable. For example, starting from the google search page, typing characters in the search box and clicking the standard search buttons will log the coordinates and input text for the commands along with a timestamp. Additionally, metadata such as url changes are captured.