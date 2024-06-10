"""
Author: Ken Bao
Release Date: Dec, 2023

This py script can be used in two ways:
1. pre-commit hook
2. standalone app
"""
import glob
import json
import os
import re
import subprocess
import sys


def run(project_path):
    script_dir = os.path.dirname(os.path.abspath(sys.argv[0]))
    rules_file_path = os.path.join(script_dir, 'rules.json')
    default_regex_patterns, default_include_types_whitelist, default_disable_rules_blacklist, default_exclude_files_blacklist, default_exclude_strings_blacklist, default_exclude_folders_blacklist = read(rules_file_path)
    custom_rules_file_path = os.path.join(project_path, 'hard-coded-scanner-custom-rules.json')
    if not os.path.exists(custom_rules_file_path):
        custom_rules_file_path = os.path.join(script_dir, 'hard-coded-scanner-custom-rules.json')
    custom_regex_patterns, custom_include_types_whitelist, custom_disable_rules_blacklist, custom_exclude_files_blacklist, custom_exclude_strings_blacklist, custom_exclude_folders_blacklist = read(custom_rules_file_path)
    temp_regex_patterns = default_regex_patterns + custom_regex_patterns
    regex_patterns = []
    for i in temp_regex_patterns:
        if i not in regex_patterns:
            regex_patterns.append(i)
    include_types_whitelist = list(set(default_include_types_whitelist + custom_include_types_whitelist))
    disable_rules_blacklist = list(set(default_disable_rules_blacklist + custom_disable_rules_blacklist))
    exclude_files_blacklist = list(set(default_exclude_files_blacklist + custom_exclude_files_blacklist))
    exclude_strings_blacklist = list(set(default_exclude_strings_blacklist + custom_exclude_strings_blacklist))
    exclude_folders_blacklist = list(set(default_exclude_folders_blacklist + custom_exclude_folders_blacklist))
    if len(sys.argv) > 1:
        scan(project_path, exclude_files_blacklist, regex_patterns, include_types_whitelist, disable_rules_blacklist, exclude_strings_blacklist, exclude_folders_blacklist)
    else:
        hook(exclude_files_blacklist, regex_patterns, include_types_whitelist, disable_rules_blacklist, exclude_strings_blacklist, exclude_folders_blacklist)


def read(rules_file_path):
    with open(rules_file_path, 'r') as config_file:
        config = json.load(config_file)
        if config.get('switch_off'):
            sys.exit()
        regex_patterns = config.get('rules', [])
        include_types_whitelist = config.get('include_types_whitelist', [])
        disable_rules_blacklist = config.get('disable_rules_blacklist', [])
        relative_exclude_files_blacklist = config.get('exclude_files_blacklist', [])
        exclude_files_blacklist = []
        for relative_exclude_files_blacklist_path in relative_exclude_files_blacklist:
            exclude_files_blacklist.extend(glob.glob(os.path.join(project_path, os.sep.join(relative_exclude_files_blacklist_path.split("/"))), recursive=True))
        exclude_strings_blacklist = config.get('exclude_strings_blacklist', [])
        exclude_folders_blacklist = config.get('exclude_folders_blacklist', [])
        return regex_patterns, include_types_whitelist, disable_rules_blacklist, exclude_files_blacklist, exclude_strings_blacklist, exclude_folders_blacklist


def scan(project_path, exclude_files_blacklist, regex_patterns, include_types_whitelist, disable_rules_blacklist, exclude_strings_blacklist, exclude_folders_blacklist):
    issues = []
    if os.path.isdir(project_path):
        for root, dirs, files in os.walk(project_path):
            dirs[:] = [d for d in dirs if d not in exclude_folders_blacklist]
            for file in files:
                file_path = os.path.join(root, file)
                if file_path in exclude_files_blacklist:
                    continue
                file_issues = []
                for rule in regex_patterns:
                    if rule['name'] not in disable_rules_blacklist:
                        file_issues.extend(detect(file_path, [rule], include_types_whitelist, exclude_strings_blacklist))
                if file_issues:
                    issues.extend(file_issues)
    else:
        print("Invalid path.")
        return

    if issues:
        print("Possible hard-coded issues found:")
        print("-" * 50)
        for file_path, issue_type, line_number, content in issues:
            print("File: ", file_path)
            print("Issue: ", issue_type)
            print("Line: ", line_number)
            print("Content: ", content)
            print("-" * 50)
        print("Total Issues: ", len(issues))
    else:
        print("No hard-coded issues detected.")


def hook(exclude_files_blacklist, regex_patterns, include_types_whitelist, disable_rules_blacklist, exclude_strings_blacklist, exclude_folders_blacklist):
    staged_files = subprocess.check_output(['git', 'diff', '--cached', '--name-only']).decode().splitlines()
    issues = []
    for file_path in staged_files:
        abs_file_path = os.path.abspath(file_path)
        if abs_file_path in exclude_files_blacklist or any(dir_name in abs_file_path for dir_name in exclude_folders_blacklist):
            continue
        file_issues = []
        for rule in regex_patterns:
            if rule['name'] not in disable_rules_blacklist:
                file_issues.extend(detect(abs_file_path, [rule], include_types_whitelist, exclude_strings_blacklist))
        if file_issues:
            issues.extend(file_issues)

    if issues:
        print("Commit aborted! Click 'Open Git Log' for detail or check detail in terminal, Please fix the possible hard-coded issues or adjust the rules in pre-commit-custom-rules.json to commit successfully.")
        print("-" * 50)
        for file_path, issue_type, line_number, content in issues:
            print("File: ", file_path)
            print("Issue: ", issue_type)
            print("Line: ", line_number)
            print("Content: ", content)
            print("-" * 50)
        print("Total Issues: ", len(issues))
        exit(1)
    else:
        print("No hard-coded issues detected. Commit allowed.")


def detect(file_path, regex_patterns, include_types_whitelist, exclude_strings_blacklist):
    issues = []
    file_extension = file_path.split('.')[-1]
    if file_extension not in include_types_whitelist or not os.path.exists(file_path):
        return issues
    with open(file_path, 'r', encoding='gbk', errors='ignore') as file:
        lines = file.readlines()
        for line_number, line in enumerate(lines, start=1):
            skip_line = False
            for exclude_string in exclude_strings_blacklist:
                if exclude_string in line:
                    skip_line = True
                    break
            if skip_line:
                continue
            for rule in regex_patterns:
                if re.search(rule['pattern'], line):
                    issues.append((file_path, rule['name'], line_number, line.strip()))
    return issues


if __name__ == '__main__':
    if len(sys.argv) > 1:
        project_path = os.path.abspath(sys.argv[1])
        run(project_path)
    else:
        project_path = os.getcwd()
        run(project_path)
