#!/bin/bash

set -xue

rm -rf prod_ui || true
mkdir prod_ui
pushd web/agree2disagree-ui
ng build --outputHashing=all
popd
cp -r web/agree2disagree-ui/dist/agree2disagree-ui/* prod_ui

gcloud app deploy --project=agree2disagree --quiet || true

rm -rf prod_ui
