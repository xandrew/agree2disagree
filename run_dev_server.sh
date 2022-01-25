#!/bin/bash

set -xue

source ~/agdaenv/bin/activate
export GOOGLE_CLOUD_PROJECT='agree2disagree'
export GOOGLE_APPLICATION_CREDENTIALS=./agree2disagree-key.json
export OAUTHLIB_INSECURE_TRANSPORT=1
python main.py
