from flask import Flask, request

app = Flask(__name__)
posts = []

@app.route("/")
def home():
    return "Campus blog"

@app.route("/posts", methods=["GET"])
def list_posts():
    return {"posts": posts}

@app.route("/posts", methods=["POST"])
def create_post():
    posts.append({"title": request.json["title"], "body": request.json["body"]})
    return {"ok": True}

@app.route("/posts/<pid>", methods=["DELETE"])
def delete_post(pid):
    return {"deleted": pid}
