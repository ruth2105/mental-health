#!/usr/bin/env python3
"""
Script to organize old documentation files into archive
"""

import os
import shutil
from pathlib import Path

# Files to keep in root
KEEP_IN_ROOT = {
    'README.md',
    'CONTRIBUTING.md',
    'LICENSE',
    '.gitignore',
    'docker-compose.yml'
}

# Directories to skip
SKIP_DIRS = {
    'backend',
    'frontend',
    'docs',
    'scripts',
    '.git',
    '.github',
    '.kiro',
    '.venv',
    '.vscode',
    'node_modules',
    'test-results'
}


def organize_docs():
    """Move old documentation to archive"""
    root_dir = Path(__file__).parent.parent
    archive_dir = root_dir / 'docs' / 'archive'
    archive_dir.mkdir(parents=True, exist_ok=True)
    
    moved_count = 0
    
    # Find all .md files in root
    for file in root_dir.glob('*.md'):
        if file.name not in KEEP_IN_ROOT:
            dest = archive_dir / file.name
            print(f'Moving {file.name} to archive/')
            shutil.move(str(file), str(dest))
            moved_count += 1
    
    # Move .bat and .ps1 files
    scripts_dir = root_dir / 'scripts' / 'old'
    scripts_dir.mkdir(parents=True, exist_ok=True)
    
    for ext in ['*.bat', '*.ps1', '*.html']:
        for file in root_dir.glob(ext):
            dest = scripts_dir / file.name
            print(f'Moving {file.name} to scripts/old/')
            shutil.move(str(file), str(dest))
            moved_count += 1
    
    print(f'\n✅ Moved {moved_count} files to archive')
    print(f'📁 Archive location: {archive_dir}')
    print(f'📁 Old scripts location: {scripts_dir}')


if __name__ == '__main__':
    print('Organizing documentation...\n')
    organize_docs()
    print('\n✨ Documentation organized!')
