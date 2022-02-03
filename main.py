import logging
import json
import sys
import os
import datetime
import requests
import math

from flask import Flask, render_template, request, redirect, url_for
from flask_login import LoginManager
from flask_login import login_user, current_user, login_required, logout_user
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer import oauth_authorized

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# ========== FireStore connection ================
# Use the application default credentials
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
   'projectId': 'agree2disagree',
})
db = firestore.client()

# ========== Flask setup ==========================
# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__, template_folder='views')
app.secret_key = 'don\'t tell anyone'
app.logger.setLevel(logging.DEBUG)
h1 = logging.StreamHandler(sys.stderr)
h1.setFormatter(logging.Formatter('%(levelname)-8s %(asctime)s %(filename)s:%(lineno)s] %(message)s'))
app.logger.addHandler(h1)


# ============ User =========================
def user_db_ref(email):
    return db.collection('users').document(email)
        
def user_from_db(email):
    doc = user_db_ref(email).get()
    as_dict = doc.to_dict()
    return AgDaUser(email)

class AgDaUser:
    def __init__(self, email):
        self.email = email

    def save_to_db(self):
        ref = user_db_ref(self.email)
        initial_data = {}
        if ref.get().exists:
            pass
            #ref.update(initial_data)
        else:
            ref.set(initial_data)
    
    @property
    def is_active(self):
        return True
    @property
    def is_authenticated(self):
        return True
    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return self.email

    def __str__(self):
        return f'User with email {self.email}'


# ========== Login setup ===========================
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return user_from_db(user_id)


secret = open("google_client_secret").read()

google_blueprint = make_google_blueprint(
    client_id='939952990424-d29q9fvaclvmgdkac7o6v6rfp8bde372.apps.googleusercontent.com',
    client_secret=secret,
    scope=[
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ]
)
app.register_blueprint(google_blueprint, url_prefix='/auth')

@oauth_authorized.connect
def _on_signin(blueprint, token):
    user_json = google.get('oauth2/v1/userinfo').json()
    print(user_json)
    us = AgDaUser(user_json['email'])
    us.save_to_db()
    login_user(us)
    
@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('root'))



@firestore.transactional
def increment_last_id(transaction):
  id_doc = db.collection('globals').document('id')
  snapshot = id_doc.get(transaction=transaction)
  if snapshot.exists:
      last_id = snapshot.get('last_id')
  else:
      last_id = -1
  next_id = last_id + 1
  transaction.set(id_doc, {'last_id': next_id})
  return next_id

letters = [chr(ord('A') + i) for i in range(ord('Z') - ord('A') + 1)]
num_letters = len(letters)
def as_string_id(num_id):
  num_digits = max(math.ceil(math.log(num_id + 1, num_letters)), 3)
  result = ''
  for i in range(num_digits):
    result = letters[num_id % num_letters] + result
    num_id //= num_letters
  assert num_id == 0
  return result

def get_next_id():
  transaction = db.transaction()
  return as_string_id(increment_last_id(transaction))

def claim_ref(claim_id):
  return db.collection('claims').document(claim_id)


# ============== Main endpoints ========================
# Just redirects to where angular assets are served from.
@app.route('/')
def root():
    return redirect('/ui/')

# In dev mode, we proxy /ui over to ng serve. In prod, static assets are served as
# configured in app.yaml. (See deploy.sh for exact details on how app.yaml is generated.)
if not os.getenv('GAE_ENV', '').startswith('standard'):
    @app.route('/ui/', defaults={'path': ''})
    @app.route('/ui/<path:path>')
    def ui_proxy(path):
        resp = requests.get(f'http://localhost:4200/ui/{path}', stream=True)
        return resp.raw.read(), resp.status_code, resp.headers.items()


# ============== Ajax endpoints =======================

# Login state endpoint
@app.route('/login_state', methods=['GET'])
def login_state():
    if current_user.is_authenticated:
        return json.dumps({'email': current_user.email, 'given_name': '', 'picture': ''})
    else:
        return json.dumps({})

@app.route('/new_claim', methods=['POST'])
@login_required
def new_claim():
    text = request.json['text']
    user = current_user.get_id()
    claim_id = get_next_id()
    claim_ref(claim_id).set({'text': text, 'author': user})
    return json.dumps({'claim_id': claim_id})
    
@app.route('/get_claim_text', methods=['POST'])
@login_required
def get_claim_text():
    claim_id = request.json['claim_id'] 
    return json.dumps(claim_ref(claim_id).get().get('text'))
    
# ============= Boilerplate!!! ========================
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='0.0.0.0', port=8080, debug=True)
# [END gae_python37_app]
