#!/bin/bash
cd /home/kavia/workspace/code-generation/simple-notes-manager-5914-5923/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

