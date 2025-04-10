from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from chatbot import funcs


@csrf_exempt
def chat(request):
    if request.method == "POST":
        user_message = request.POST.get("message", "")
        # Mock AI response (replace with actual logic later)
        print(user_message)
        ai_response = funcs.ask(user_message)

        return JsonResponse({"user": user_message, "ai": ai_response})
    return JsonResponse({"error": "Invalid request method"})

def index(request):
    return render(request, "index.html")

@csrf_exempt
def query(request):
    query = request.POST.get("message", "")
    # Mock AI response (replace with actual logic later)
    query = funcs.parse_codeblock(query)
    df = funcs.query_db(query)
    return JsonResponse({"query": query, "data": df.to_json()})
