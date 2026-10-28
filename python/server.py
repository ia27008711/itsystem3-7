#!/usr/bin/env python3
"""
ネットの危険性体験シミュレータ - ローカルWebサーバー
ブラウザを自動起動し、Webアプリを提供します。
"""

import http.server
import socketserver
import webbrowser
import threading
import time
import os
import sys

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # キャッシュ無効化ヘッダーを付与して開発・体験時の最新状態を保証
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def open_browser():
    time.sleep(1.0)
    url = f"http://localhost:{PORT}/index.html"
    print(f"\n🚀 ブラウザでアプリを開いています: {url}")
    webbrowser.open(url)

def main():
    # スクリプトのディレクトリに作業ディレクトリを移動
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)

    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 60)
        print("🛡️  ネットフレンドの正体 - オンライン安全体験シミュレータ")
        print("=" * 60)
        print(f"📡 サーバー起動中: http://localhost:{PORT}/index.html")
        print("🛑 停止するには [Ctrl + C] を押してください。")
        print("=" * 60)

        # ブラウザ自動オープン用スレッド
        threading.Thread(target=open_browser, daemon=True).start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 サーバーを停止しました。お疲れ様でした！")
            sys.exit(0)

if __name__ == "__main__":
    main()
