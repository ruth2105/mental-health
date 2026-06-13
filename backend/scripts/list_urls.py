import os
import sys

# make project importable
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, BASE)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.urls import get_resolver

def walk(resolver=None, prefix=''):
    resolver = resolver or get_resolver()
    for p in resolver.url_patterns:
        try:
            pattern = prefix + str(p.pattern)
            # include / namespace
            if hasattr(p, 'url_patterns') and p.url_patterns:
                walk(p, prefix=pattern)
            else:
                name = getattr(p, 'name', '')
                print(f"{pattern}    {name}")
        except Exception as e:
            print('ERROR', e, getattr(p, 'pattern', p))

if __name__ == '__main__':
    walk()