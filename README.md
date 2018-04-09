# Remilama

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Remilama is a tool for review documents.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

![overview](https://github.com/kawasima/remilama/blob/master/public/remilama_overview.png?raw=true)

## Usage

Running remilama locally

```
% yarn production
```

### For development

Run remilama in the development mode.

```
% yarn start
```

## Customization

### Add custom fields

You can add custom fields to a comment. When you create a review, set a file such as the following.

```json
[
  {
    "id": "solutions",
    "label": "Solutions",
    "type": "text"
  },
  {
    "id": "cause",
    "label": "Cause",
    "type": "dropdown",
    "source": [
      "Carelessly",
      "Misunderstood",
      "Intentional"
    ]
  }
]
```
