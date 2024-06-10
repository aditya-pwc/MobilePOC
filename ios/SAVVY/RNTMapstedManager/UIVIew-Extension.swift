//
//  UIVIew-Extension.swift
//
//  Created by Jiaxiang Wang on 2023/11/15.
//  Copyright © 2023 SAVVY. All rights reserved.
//
import UIKit
extension UIView {
    func findViewController() -> UIViewController? {
        if let nextResponder = self.next as? UIViewController {
            return nextResponder
        } else if let nextResponder = self.next as? UIView {
            return nextResponder.findViewController()
        } else {
            return nil
        }
    }
}
