#!/usr/bin/env fish

# If there are no arguments passed, then default to the GIT_ROOT public
set -l GIT_ROOT (git rev-parse --show-toplevel)

# Target files for the html linkcheckers
set -l TARGET_FILES $argv
if test -z "$TARGET_FILES"
    set TARGET_FILES $GIT_ROOT/public/**html
end

# Internal links should NEVER 404! Check links which start with a dot or slash
# Use the live server to resolve relative links
if test -z $argv
    set -x no_proxy "http://localhost:8080"
    linkchecker http://localhost:8080 --threads 10 
else
    linkchecker $TARGET_FILES --threads 10 
end

set -l HTML_CHECK_STATUS_1 $status

# Check external links which I control
# TODO GH link won't exist for new posts
linkchecker $TARGET_FILES --ignore-url="!^https://(assets\.turntrout\.com|github\.com/alexander-turner/TurnTrout\.com)" --no-warnings --check-extern --threads 20 
set -l HTML_CHECK_STATUS_2 $status

# If any of the checks failed, exit with a non-zero status
if test $HTML_CHECK_STATUS_1 -ne 0 -o $HTML_CHECK_STATUS_2 -ne 0
    echo "Link checks failed: " >&2
    echo "Internal linkchecker: $HTML_CHECK_STATUS_1" >&2
    echo "CDN asset linkchecker: $HTML_CHECK_STATUS_2" >&2
    exit 1
end

exit 0
