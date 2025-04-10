#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

def main():
    # res = funcs.ask(f"Your job is to generate SQL queries to aid the user with their questions about data from a\
    # database with this description: \n{json.dumps(json.load(open("chatbot/db_des.json", 'r')), indent=4)}. Keep\
    # your solution SQL query inside a SQL codeblock for easy extraction.",)
    # print(res)
    #initiating chatbot
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
