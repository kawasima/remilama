# Remilama

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Remilama is a realtime document review tool using WebRTC (PeerJS).

![overview](https://github.com/kawasima/remilama/blob/master/public/remilama_overview.png?raw=true)

## Terminology

| Term         | Role                       | Description                                                                                                                                                          |
|--------------|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Reviewee** | Presenter / Review creator | Creates a review, uploads documents, and navigates pages while explaining. Corresponds to `RevieweePage` (`/review/:id`).                                            |
| **Reviewer** | Participant                | Joins an existing review via Review ID, follows the Reviewee's navigation, and posts comments on documents. Corresponds to `ReviewerPage` (`/review/:id/reviewer`).  |

## Usage

### Running locally

```
npm run dev
```

### Production

```
npm run build
node app.js
```

## How it works

1. **Reviewee** creates a review and uploads PDF documents.
2. **Reviewee** shares the Review ID (or URL) with Reviewers.
3. **Reviewer** joins the review by entering the Review ID and their name.
4. A WebRTC (PeerJS) connection is established between Reviewee and Reviewer(s).
5. The Reviewee navigates documents and pages; Reviewers follow in real-time (Follow mode, ON by default).
6. Reviewers can post comments on documents via long-press, drag to reposition, and edit inline.
7. Comments are synchronized in real-time between all participants.

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
