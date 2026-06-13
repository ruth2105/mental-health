def serve_react(request, path=''):
    from django.http import HttpResponse
    # collectstatic copies frontend/ contents, check both locations
    possible_paths = [
        os.path.join(settings.BASE_DIR, 'staticfiles', 'frontend', 'index.html'),
        os.path.join(settings.BASE_DIR, 'staticfiles', 'index.html'),
    ]
    for index_path in possible_paths:
        if os.path.exists(index_path):
            with open(index_path, 'r', encoding='utf-8') as f:
                return HttpResponse(f.read(), content_type='text/html')
    return HttpResponse('<h1>Loading...</h1>', content_type='text/html')
