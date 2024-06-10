use std::io::{self, BufRead, Write};
use std::fs;
use walkdir::WalkDir;


fn update_file_with_content_after_nb_line(file_path: &str, new_content: &str) -> io::Result<()> {
    let str_start = "// common library start";
    let str_end = "// common library end";

    // Step 1: Read the file and collect lines in a vector
    let file = fs::File::open(file_path)?;
    let reader = io::BufReader::new(file);
    let lines: Vec<String> = reader.lines().collect::<io::Result<_>>()?;

    // Step 2: Find the range of lines to delete
    let mut start_index = None;
    let mut end_index = None;
    for (i, line) in lines.iter().enumerate() {
        if line.contains(str_start) {
            start_index = Some(i);
        }
        if line.contains(str_end) {
            end_index = Some(i);
            break;
        }
    }

    // If both start and end indices are found, remove the range of lines
    if let (Some(start), Some(end)) = (start_index, end_index) {
        let mut updated_lines = lines;
        updated_lines.drain(start + 1..=end - 1);

        // Step 3: Insert new content between nb0 and nb1
        updated_lines.insert(start + 1, new_content.to_string());

        // Step 4: Write the updated content back to the file
        let output = updated_lines.join("\n");
        let mut file = fs::File::create(file_path)?;
        file.write_all(output.as_bytes())?;
    } else {
        println!("Range not found!");
    }

    Ok(())
}


fn main() {
    let src_dir = "../../src/common";
    let src_dir_to_cut = "../../";
    let mut str_to_insert = String::new();


    for entry in WalkDir::new(src_dir).follow_links(true) {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.is_file() {
                if let Some(extension) = path.extension() {
                    if extension == "tsx" || extension == "ts" {
                        let contains_test = path.to_str().map_or(false, |s| s.contains(".test."));
                        if !contains_test {
                            // Get the path relative to the `src` directory
                            if let Ok(relative_path) = path.strip_prefix(src_dir_to_cut) {
                                if let Some(path_str) = relative_path.to_str() {
                                    let parts: Vec<&str> = path_str.split(".").collect();
                                    let result = parts[0];
                                    str_to_insert.push_str(&*format!("import './{}'\n", result))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if let Err(err) = update_file_with_content_after_nb_line("../../common.js", &str_to_insert) {
        eprintln!("Error: {}", err);
    } else {
        println!("Operation failed");
    }
}
