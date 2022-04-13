import logging
import json
import sys
import os
import datetime
import requests
import math

from flask import Flask, render_template, request, redirect, url_for, session
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

FIRESTORE_PREFIX = os.environ.get('FIRESTORE_PREFIX', 'prod$')

def root_collection(name):
    return db.collection(FIRESTORE_PREFIX + name)

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
    return root_collection('users').document(email)
        
def user_from_db(email):
    doc = user_db_ref(email).get()
    as_dict = doc.to_dict()
    return AgDaUser(email, as_dict['picture'], as_dict['givenName'])

class AgDaUser:
    def __init__(self, email, picture, given_name):
        self.email = email
        self.picture = picture
        self.given_name = given_name

    def save_to_db(self):
        ref = user_db_ref(self.email)
        initial_data = {
            'picture': self.picture,
            'givenName': self.given_name
        }
        if ref.get().exists:
            ref.update(initial_data)
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
    us = AgDaUser(user_json['email'], user_json.get('picture', ''), user_json.get('given_name', ''))
    us.save_to_db()
    login_user(us)
    
@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('root'))



@firestore.transactional
def increment_last_id(transaction):
  id_doc = root_collection('globals').document('id')
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

def claim_collection():
  return root_collection('claims')

def claim_ref(claim_id):
  return claim_collection().document(claim_id)

def claim_arguments_collection(claim_id):
  return claim_ref(claim_id).collection('arguments')

def argument_ref(claim_id, argument_id):
  return claim_arguments_collection(claim_id).document(argument_id)

def counter_collection(claim_id, argument_id):
  return argument_ref(claim_id, argument_id).collection('counters')

def counter_ref(claim_id, argument_id, counter_id):
  return (
      counter_collection(claim_id, argument_id)
        .document(counter_id))

def ano_text_ref(text_id):
  return root_collection('ano_texts').document(text_id)

def annotation_collection(text_id):
    return ano_text_ref(text_id).collection('annotations')

def annotation_ref(text_id, annotation_id):
    return annotation_collection(text_id).document(annotation_id)

def opinion_ref(claim_id, user_id):
    return root_collection('opinions').document(f'{claim_id}:{user_id}')

def new_ano_text(text, author):
    text_id = get_next_id()
    ano_text_ref(text_id).set({'id': text_id, 'text': text, 'author': author})
    return text_id
    

def get_just_text(text_id):
    return ano_text_ref(text_id).get().get('text')

def enrich_with_text(annotation_meta):
    claimTextId = claim_ref(annotation_meta['claimId']).get().get('textId')
    annotation_meta['claimText'] = get_just_text(claimTextId)
    return annotation_meta

def favorite_disagreers_ref(user_id):
    return root_collection('favorite_disagreers').document(user_id)

def no_author(data):
    if 'author' in data:
        del data['author']
    return data

def enrich_with_ano_text(owner):
    text_id = owner['textId']
    data = no_author(ano_text_ref(text_id).get().to_dict())
    data['annotations'] = [
        enrich_with_text(no_author(a.to_dict()))
        for a in annotation_collection(text_id).stream()]
    owner['text'] = data
    del owner['textId']
    return owner
    

# ============== Main endpoints ========================
# Just redirects to where angular assets are served from.
@app.route('/')
def root():
    target = session.get("next", None)
    if target is not None:
        session.pop("next")
        return redirect(target)
    return redirect('/ui/')

@app.route('/googlelogin', methods=['GET'])
def googlelogin():
    session["next"] = request.args.get('next', '/ui/')
    return redirect(url_for("google.login"))

# In dev mode, we proxy /ui over to ng serve. In prod, static assets are served as
# configured in app.yaml. (See deploy.sh for exact details on how app.yaml is generated.)
if not os.getenv('GAE_ENV', '').startswith('standard'):
    @app.route('/ui/', defaults={'path': ''})
    @app.route('/ui/<path:path>')
    def ui_proxy(path):
        resp = requests.get(f'http://localhost:4200/ui/{path}', stream=True)
        return resp.raw.read(), resp.status_code, resp.headers.items()
    
# ============== Ajax endpoints =======================

@app.route('/login_state', methods=['GET'])
def login_state():
    if current_user.is_authenticated:
        return json.dumps({'email': current_user.email, 'givenName': current_user.given_name, 'picture': current_user.picture})
    else:
        return json.dumps({})

@app.route('/new_claim', methods=['POST'])
@login_required
def new_claim():
    text = request.json['text']
    user = current_user.get_id()
    claim_id = get_next_id()
    claim_ref(claim_id).set({
        'id': claim_id,
        'textId': new_ano_text(text, user),
        'author': user})
    return json.dumps(claim_id)
    
@app.route('/new_argument', methods=['POST'])
@login_required
def new_argument():
    claim_id = request.json['claimId']
    argument_id = get_next_id()
    user = current_user.get_id()
    fork_history = request.json['forkHistory']
    data = {
        'id': argument_id,
        'textId': new_ano_text(request.json['text'], user),
        'isAgainst': request.json['isAgainst'],
        'author': user,
        'forkHistory': fork_history,
    }
    argument_ref(claim_id, argument_id).set(data)
    if fork_history:
        for counter in counter_collection(claim_id, fork_history[0]).stream():
            counter_dict = counter.to_dict()
            counter_ref(
                claim_id, argument_id, counter_dict['id']).set(counter_dict)
    return json.dumps(argument_id)

def backfill_fork_history(data):
    if 'forkHistory' not in data:
        data['forkHistory'] = []
    return data

@app.route('/get_arguments', methods=['POST'])
def get_arguments():
    col = claim_arguments_collection(request.json['claimId'])
    return json.dumps([
        backfill_fork_history(
            enrich_with_ano_text(no_author(editable(arg.to_dict()))))
        for arg in col.stream()])

@app.route('/new_counter', methods=['POST'])
@login_required
def new_counter():
    claim_id = request.json['claimId']
    argument_id = request.json['argumentId']
    counter_id = get_next_id()
    user = current_user.get_id()
    ref = counter_ref(
        claim_id,
        argument_id,
        counter_id)
    ref.set({
        'id': counter_id,
        'textId': new_ano_text(request.json['text'], user),
        'author': user})
    maybe_protect_argument(claim_id, argument_id)
    return json.dumps(counter_id)

def editable(data):
    user_id = 'NOSUCHUSER'
    if current_user.is_authenticated:
        user_id = current_user.get_id()
    if (data.get('author', '') == user_id) and not data.get('protected', False):
        data['editable'] = True
    else:
        data['editable'] = False
    return data


@firestore.transactional
def update_argument_if_not_protected(transaction, argument_ref, text_id):
    snapshot = argument_ref.get(transaction=transaction)
    if editable(snapshot.to_dict())['editable']:
        transaction.update(argument_ref, { 'textId': text_id })
        return True
    else:
        return False

@app.route('/replace_argument', methods=['POST'])
@login_required
def replace_argument():
    argument_id = request.json['argumentId']
    user = current_user.get_id()
    ref = argument_ref(
        request.json['claimId'],
        argument_id)
    text_id = new_ano_text(request.json['text'], user)
    
    if update_argument_if_not_protected(db.transaction(), ref, text_id):
        return json.dumps(argument_id)
    else:
        return json.dumps('')

@firestore.transactional
def update_counter_if_not_protected(transaction, counter_ref, text_id):
    snapshot = counter_ref.get(transaction=transaction)
    if editable(snapshot.to_dict())['editable']:
        transaction.update(counter_ref, { 'textId': text_id })
        return True
    else:
        return False

@app.route('/replace_counter', methods=['POST'])
@login_required
def replace_counter():
    counter_id = request.json['counterId']
    user = current_user.get_id()
    ref = counter_ref(
        request.json['claimId'],
        request.json['argumentId'],
        counter_id)
    text_id = new_ano_text(request.json['text'], user)
    
    if update_counter_if_not_protected(db.transaction(), ref, text_id):
        return json.dumps(counter_id)
    else:
        return json.dumps('')

@app.route('/get_counters', methods=['POST'])
def get_counters():
    col = counter_collection(
        request.json['claimId'],
        request.json['argumentId'])
    return json.dumps(
        [enrich_with_ano_text(no_author(editable(counter.to_dict())))
         for counter in col.stream()])

@app.route('/get_claim', methods=['POST'])
def get_claim():
    claim_id = request.json['claimId'] 
    return json.dumps(
        enrich_with_ano_text(
            {'id': claim_id,
             'textId': claim_ref(claim_id).get().get('textId')}))
    
@app.route('/get_all_claims', methods=['POST'])
def get_all_claims():
    return json.dumps(
        [{'id': claim.id, 'text': get_just_text(claim.get('textId'))}
         for claim in claim_collection().stream()])
    
@app.route('/new_annotation', methods=['POST'])
@login_required
def new_annotation():
    annotation_id = get_next_id()
    annotation_ref(request.json['textId'], annotation_id).set({
        'id': annotation_id,
        'claimId': request.json['claimId'],
        'negated': request.json['negated'],
        'startInText': request.json['startInText'],
        'endInText': request.json['endInText'],
        'author': current_user.get_id()})
    return json.dumps(annotation_id)


def maybe_protect_argument(claim_id, argument_id):
    user_id = current_user.get_id()
    ref = argument_ref(claim_id, argument_id)
    try:
        author = ref.get().get('author')
    except KeyError:
        author = ''
    if author != user_id:
        ref.update({'protected': True})

def maybe_protect_counter(claim_id, argument_id, counter_id):
    user_id = current_user.get_id()
    ref = counter_ref(claim_id, argument_id, counter_id)
    try:
        counter_author = ref.get().get('author')
    except KeyError:
        counter_author = ''
    if counter_author != user_id:
        ref.update({'protected': True})

@app.route('/set_opinion', methods=['POST'])
@login_required
def set_opinion():
    user_id = current_user.get_id()
    claim_id = request.json['claimId']
    selected_counters = request.json['selectedCounters']
    selected_arguments_for = request.json['selectedArgumentsFor']
    selected_arguments_against = request.json['selectedArgumentsAgainst']
    data = {
        'claimId': claim_id,
        'userId': user_id,
        'selectedArgumentsFor': selected_arguments_for,
        'selectedArgumentsAgainst': selected_arguments_against,
        'selectedCounters': selected_counters,
    }
    if 'value' in request.json:
        data['value'] = request.json['value']

    opinion_ref(claim_id, user_id).set(data)
    
    for argument_id in selected_arguments_for:
        maybe_protect_argument(claim_id, argument_id)
    for argument_id in selected_arguments_against:
        maybe_protect_argument(claim_id, argument_id)
    for argument_id, counter_id in selected_counters.items():
        maybe_protect_counter(claim_id, argument_id, counter_id)
        maybe_protect_argument(claim_id, argument_id)

    return json.dumps({})

@app.route('/get_opinion', methods=['POST'])
def get_opinion():
    if current_user.is_authenticated:
        user_id = request.json.get('userId', current_user.get_id())
        claim_id = request.json['claimId']
        snapshot = opinion_ref(claim_id, user_id).get()
        if snapshot.exists:
            return json.dumps(snapshot.to_dict())
    return json.dumps({
        'selectedArgumentsFor': [],
        'selectedArgumentsAgainst': [],
        'selectedCounters': {}})


@firestore.transactional
def prepend_disagreer_to_favorites(transaction, disagreer, fav_ref):
    snapshot = fav_ref.get(transaction=transaction)
    favorites = []
    if snapshot.exists:
        favorites = snapshot.get('favorites')
    if disagreer in favorites:
        favorites.remove(disagreer)
    favorites.insert(0, disagreer)
    transaction.set(fav_ref, {'favorites': favorites[:10]})
  
def report_disagreer(disagreer):
    ref = favorite_disagreers_ref(current_user.get_id())
    transaction = db.transaction()
    prepend_disagreer_to_favorites(transaction, disagreer, ref)

def user_meta(email):
    snapshot = user_db_ref(email).get()
    if snapshot.exists:
        as_dict = snapshot.to_dict()
        as_dict['email'] = email
        return as_dict
    else:
        return {}
    
@app.route('/get_user', methods=['POST'])
@login_required
def get_user():
    email = request.json['email']
    meta = user_meta(email)
    if 'email' in meta:
        report_disagreer(email)
    return json.dumps(meta);
 
@app.route('/get_favorite_disagreers', methods=['POST'])
@login_required
def get_favorite_disagreers():
    snapshot = favorite_disagreers_ref(current_user.get_id()).get()
    if snapshot.exists:
        return json.dumps(
            [user_meta(email) for email in snapshot.get('favorites')])
    return json.dumps([])


# ============= Boilerplate!!! ========================
if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    app.run(host='0.0.0.0', port=8080, debug=True)
# [END gae_python37_app]
