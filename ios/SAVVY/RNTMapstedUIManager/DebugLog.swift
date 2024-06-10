//
//  DebugLog.swift
//
//  Created by joseph on 2023-08-30.
//  Copyright © 2023 Mapsted. All rights reserved.
//

import Foundation
/**
 This DebugLog class is used to help analysis Mapsted logs and errors
 */
class DebugLog {
	func Log(_ message: String, _ object: Any, _ file: String = #file, _ function: String = #function, _ line: Int = #line) {

		var filename = (file as NSString).lastPathComponent
		filename = filename.components(separatedBy: ".")[0]

		let currentDate = Date()
		let df = DateFormatter()
		df.dateFormat = "HH:mm:ss.SSS"
    // Format log with current date, this line is used to separate log
		print("──────────────────────────────────────────────────────────────────────────────────")
		print("\(message) | \(df.string(from: currentDate)) │ \(filename).\(function) (\(line))  ")
		print("──────────────────────────────────────────────────────────────────────────────────")
		print("\(String(describing: object))\n")
	}
}
