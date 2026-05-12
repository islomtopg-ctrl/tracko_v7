import os

def update_links():
    templates_dir = 'templates'
    for filename in os.listdir(templates_dir):
        if filename.endswith('.html') and filename != 'landing.html':
            filepath = os.path.join(templates_dir, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace('href="/"', 'href="/dashboard"')
            
            if content != new_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filename}")

if __name__ == "__main__":
    update_links()
