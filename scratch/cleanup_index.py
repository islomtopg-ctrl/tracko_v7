import sys
import os

path = 'templates/index.html'
if not os.path.exists(path):
    print(f'Error: {path} not found')
    sys.exit(1)

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '<!-- ═══ SCRIPTS ═══ -->'
end_marker = '</body>'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Find the last </script> before </body>
    script_end = content.rfind('</script>', start_idx, end_idx)
    if script_end != -1:
        new_script = """  <!-- ═══ SCRIPTS ═══ -->
  <script src="https://unpkg.com/html5-qrcode"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  <!-- ═══ APP CONFIG BRIDGE ═══ -->
  <script>
    window.CATS = {{ categories|tojson }};
    window.ROLE_INFO = {{ role_info|tojson }};
    window.CURRENT_USER = {
        name: "{{ current_user.name }}",
        role: "{{ current_user.role }}"
    };
    window.ALL_EMPS = {{ all_emps|tojson if all_emps else '[]' }};
  </script>

  <!-- ═══ APP LOGIC ═══ -->
  <script src="/static/js/app.js?v=1.1"></script>\n"""
        new_content = content[:start_idx] + new_script + content[script_end+9:]
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print('SUCCESS')
    else:
        print('ERROR: </script> not found')
else:
    # Try alternative marker if the first one failed (maybe encoding issues with box symbols)
    print(f'ERROR: markers not found. Start: {start_idx}, End: {end_idx}')
    # Let's try to find just 'animateNumber' as a fallback start
    fallback_start = content.find('function animateNumber')
    if fallback_start != -1:
         # Go back to find the start of the script tag
         tag_start = content.rfind('<script>', 0, fallback_start)
         if tag_start != -1:
             script_end = content.rfind('</script>', tag_start, end_idx)
             if script_end != -1:
                 new_script = """  <!-- ═══ SCRIPTS ═══ -->
  <script src="https://unpkg.com/html5-qrcode"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

  <!-- ═══ APP CONFIG BRIDGE ═══ -->
  <script>
    window.CATS = {{ categories|tojson }};
    window.ROLE_INFO = {{ role_info|tojson }};
    window.CURRENT_USER = {
        name: "{{ current_user.name }}",
        role: "{{ current_user.role }}"
    };
    window.ALL_EMPS = {{ all_emps|tojson if all_emps else '[]' }};
  </script>

  <!-- ═══ APP LOGIC ═══ -->
  <script src="/static/js/app.js?v=1.1"></script>\n"""
                 new_content = content[:tag_start] + new_script + content[script_end+9:]
                 with open(path, 'w', encoding='utf-8') as f:
                     f.write(new_content)
                 print('SUCCESS (via fallback)')
             else:
                 print('ERROR: fallback script end not found')
         else:
             print('ERROR: fallback script start not found')
