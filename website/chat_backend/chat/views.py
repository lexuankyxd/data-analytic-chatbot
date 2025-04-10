from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from chatbot import funcs
import pandas as pd
from django.http import HttpResponse  
import traceback                   



@csrf_exempt
def chat(request):
    if request.method == "POST":
        user_message = request.POST.get("message", "")
        print(user_message)
        ai_response = funcs.ask(user_message)
        return JsonResponse({"user": user_message, "ai": ai_response})
    return JsonResponse({"error": "Invalid request method"})

def index(request):
    return render(request, "index.html")

@csrf_exempt
def query(request):
    try:
        query = request.POST.get("message", "")
        sql_code = funcs.parse_codeblock(query)
        html_result = funcs.query_db(sql_code)
        return HttpResponse(html_result, content_type='text/html')

    except Exception as e:
        tb = traceback.format_exc()
        print("[ERROR] SQL EXECUTION FAILED:\n", tb)  
        return HttpResponse(
            f"<p>Không truy xuất được dữ liệu.<br>Lỗi: {str(e)}</p>", 
            content_type='text/html', 
            status=500
        )

@csrf_exempt
def query_sql_view(request):
    if request.method == 'POST':
        query = request.POST.get('message', '')
        sql_code = funcs.parse_codeblock(query)
        df = funcs.query_db(sql_code)
        if isinstance(df, pd.DataFrame):
            html_table = df.to_html(classes="table table-bordered", index=False)
            return HttpResponse(html_table, content_type='text/html')
        else:
            return HttpResponse(f"<div class='alert alert-danger'>{df}</div>", content_type='text/html')
        
        
