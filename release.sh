#!/usr/bin/env sh

if [ "$CURRENT_VERSION" = "$NEW_VERSION" ]; then
  echo "Not a new release, exiting"
  exit
fi

go get github.com/tcnksm/ghr

ghr -t ${GITHUB_TOKEN} -u ${CIRCLE_PROJECT_USERNAME} -r ${CIRCLE_PROJECT_REPONAME} -c ${CIRCLE_SHA1} -delete ${NEW_VERSION} ./workspace/dist/
