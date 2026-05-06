# Taskboard

A Trello-style project management board built as a static web app.

## Features

- Dashboard for all boards
- Multiple boards with To Do, In Progress, Review, and Done lists
- Drag-and-drop task cards
- Card editing with priority, owner, due date, labels, and comments
- Workspace label manager
- Local browser saving with IndexedDB/localStorage
- Optional Firebase Firestore sync

## Run locally

Open `index.html` in a browser.

## Firebase sync

1. Create a Firebase project.
2. Add a Web app and copy the Firebase config object.
3. Enable Cloud Firestore.
4. In the app, click `Firebase`, paste the config, choose a workspace ID, and connect.

The app stores workspace documents in the `taskboardWorkspaces` collection.
