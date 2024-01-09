# Celestial Capture Extension

The capture extension is used to record user sessions towards learning interface usage patterns. The primary function is to start and capture, interact within the browser context of a single tab, stop the capture and launch the analyze flow window to label events, and finally exporting the session as a serializable package or file. This also means the replay function will have limited support due to the variability of interface strategies between web elements and is not (simulating javascript input is not truthy).

## Events

Events are reported whenever a user interacts with the interface and meta-evetns of the changing environment, such as page load.

## Screenshots

Screenshot events are generated per user-capture session whenever a screenshot is warranted and usually a subset of events. This means periodic screenshots of text input (as opposed to every key entry). Screenshot events largely take place with interaction to the interface or perceptible events that act as feedback to interaction. This acts as a rate limit to taking screenshots, and de-noises data for processing.

Events and screenshots should agree and a timeline should be possible to construct from both collections, and may be useful in adding context to infer the user flow.

## Supported Operations

- key input
- click
- copy/cut/paste via right click selection