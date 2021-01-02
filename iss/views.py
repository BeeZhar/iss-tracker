from django.shortcuts import render
from django.http import HttpResponse
import requests

# This route was the initial route getting the data from API. It is now completely handled using AJAX in the front end

# HOME ROUTE
# def home(request):
#     response = requests.get('https://api.wheretheiss.at/v1/satellites/25544/', timeout=(3.05, 27))
#     iss_data = response.json()
#     iss_data['velocity'] = round(iss_data['velocity'], 1)
#     iss_data['altitude'] = round(iss_data['altitude'], 1)
#     iss_data['latitude'] = round(iss_data['latitude'], 2)
#     iss_data['longitude'] = round(iss_data['longitude'], 2)

#     return render(request, 'iss/home.html', iss_data)

# Renders the current API DATA once.
# Updates are then handled by Jquery in 'iss.js' on the front end.

#_____Options to consider?____
# Django rest framework endpoint for API ?
# Handling the calls in the back end 

def home(request):
    return render(request, 'iss/home.html')

def about(request):
    return HttpResponse('<h1>ISS ABOUT</h1>')

