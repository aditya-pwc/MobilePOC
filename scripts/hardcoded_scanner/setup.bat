@echo off  

for /f "delims=" %%d in ('git rev-parse --show-toplevel') do (set "project_dir=%%d")

set "source_dir=%project_dir%\scripts\hardcoded_scanner"
set "destination_hooks_dir=%project_dir%\.git\hooks"
set "destination_custom_rules_file=%project_dir%\hard-coded-scanner-custom-rules.json"

copy /y "%source_dir%\pre-commit" "%destination_hooks_dir%"
copy /y "%source_dir%\hard-coded-scanner.py" "%destination_hooks_dir%"
copy /y "%source_dir%\rules.json" "%destination_hooks_dir%"
if not exist "%destination_custom_rules_file%" (copy /y "%source_dir%\hard-coded-scanner-custom-rules.json" "%destination_custom_rules_file%")