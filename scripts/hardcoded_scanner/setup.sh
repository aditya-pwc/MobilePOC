#!/bin/sh

project_dir=$(git rev-parse --show-toplevel)
source_dir="$project_dir/scripts/hardcoded_scanner"
destination_hooks_dir="$project_dir/.git/hooks"
destination_custom_rules_file="$project_dir/hard-coded-scanner-custom-rules.json"

cp "$source_dir/pre-commit" "$destination_hooks_dir"
echo "1 file(s) copied."

cp "$source_dir/hard-coded-scanner.py" "$destination_hooks_dir"
echo "1 file(s) copied."

cp "$source_dir/rules.json" "$destination_hooks_dir"
echo "1 file(s) copied."

if [ ! -f "$destination_custom_rules_file" ]; then
    cp "$source_dir/hard-coded-scanner-custom-rules.json" "$destination_custom_rules_file"
    echo "1 file(s) copied."
fi

chmod +x "$destination_hooks_dir/pre-commit"
