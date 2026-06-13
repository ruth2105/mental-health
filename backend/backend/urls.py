def serve_react(request, path=''):
    """Serve the React app's index.html for all non-API routes (SPA routing)."""
    from django.http import HttpResponse
    # Try multiple possible locations for index.html
    possible_paths = [
        os.path.join(settings.BASE_DIR, 'staticfiles', 'frontend', 'index.html'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html'),
        os.path.join(settings.BASE_DIR, 'static', 'frontend', 'index.html'),
    ]
    for index_path in possible_paths:
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
    
    # Debug: show what files exist
    static_dir = os.path.join(settings.BASE_DIR, 'staticfiles')
    files = []
    if os.path.exists(static_dir):
        for root, dirs, filenames in os.walk(static_dir):
            for fname in filenames:
                if 'index' in fname.lower():
                    files.append(os.path.join(root, fname))
    return HttpResponse(
        f'<h1>App loading...</h1><p>Looking for index.html...</p><p>Found index files: {files}</p>',
        content_type='text/html'
    )
