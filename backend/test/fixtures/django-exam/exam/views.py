from django.http import JsonResponse

def login(request):
    return JsonResponse({"ok": True})

def students(request):
    return JsonResponse({"students": []})

def papers(request):
    return JsonResponse({"papers": []})

def attempts(request):
    return JsonResponse({"attempts": []})
